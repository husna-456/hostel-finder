import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { Hostel } from "../models/Hostel.js";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";
import { getOrCreate as getSettings } from "./settingsController.js";
import { notify } from "../services/notificationService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------- SEAT TRACKING HELPER ----------
const reserveSeat = async (hostelId, roomId) => {
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw new Error("Hostel not found");

  const room = hostel.rooms.find((r) => r.roomId === roomId);
  if (!room) throw new Error("Room not found");

  room.reservedSeats = (room.reservedSeats || 0) + 1;

  await hostel.save();
};

// ---------- STRIPE PAYMENT INTENT ----------
export const createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is enabled in platform settings
    try {
      const s = await getSettings();
      if (!s.stripeEnabled) return res.status(403).json({ message: "Card payments are currently disabled." });
    } catch (_) {}

    console.log("📥 create-payment-intent body:", JSON.stringify(req.body, null, 2));

    const { amount, currency = "pkr", bookingId } = req.body;
    const requestedAmount = amount === undefined || amount === null ? undefined : Number(amount);

    if (!bookingId) {
      return res.status(400).json({ message: "Missing required field: bookingId" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    const roomId = booking.roomId;
    const room = hostel.rooms.find((r) => r.roomId === roomId);

    const resolvedAmount = requestedAmount > 0 ? requestedAmount : room?.advanceAmount ?? room?.seatPrice ?? 0;

    console.log("🔍 amount resolution:", {
      requestBodyAmount: amount,
      requestedAmount,
      resolvedAmount,
      roomAdvanceAmount: room?.advanceAmount ?? null,
      roomSeatPrice: room?.seatPrice ?? null,
    });

    if (!resolvedAmount || resolvedAmount <= 0) {
      return res.status(400).json({
        message: "Amount is required. No valid amount found in request body or room pricing.",
        receivedAmount: amount,
        roomAdvanceAmount: room?.advanceAmount ?? null,
        roomSeatPrice: room?.seatPrice ?? null,
      });
    }

    const stripeAmount = Math.round(resolvedAmount * 100);
    if (stripeAmount < 5000) {
      return res.status(400).json({
        message: `Amount too low. Stripe requires a minimum of 50 PKR (5000 paisas). Received: ${resolvedAmount} PKR (${stripeAmount} paisas).`,
        receivedAmount: resolvedAmount,
      });
    }

    console.log("💰 Creating PaymentIntent — amount:", resolvedAmount, "PKR /", stripeAmount, "paisas");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency,
      metadata: {
        bookingId: String(bookingId),
        paymentId: ""
      }
    });

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      ownerId: hostel.ownerId,
      hostelId: booking.hostelId,
      roomId: roomId || "",
      amount: resolvedAmount,
      method: "stripe",
      stripePaymentIntentId: paymentIntent.id,
      status: "pending"
    });

    paymentIntent.metadata.paymentId = payment._id.toString();
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { bookingId: String(bookingId), paymentId: payment._id.toString() }
    });

    booking.paymentStatus = "pending";
    await booking.save();

    console.log("✅ PaymentIntent created:", paymentIntent.id);
    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Stripe PaymentIntent error:", error.type, error.message);
    console.error("   raw:", error.raw?.message || error.raw);

    if (error.type?.startsWith("Stripe")) {
      return res.status(400).json({
        message: error.message,
        stripeCode: error.code,
        stripeDeclineCode: error.decline_code || null,
      });
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- CONFIRM BOOKING AFTER PAYMENT ----------
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({ message: "Missing required fields: bookingId, paymentIntentId" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed", status: paymentIntent.status });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (payment) {
      payment.status = "paid";
      payment.paidAt = new Date();
      await payment.save();
    }

    // Keep booking.status = "pending" — owner must confirm reservation
    booking.paymentStatus = "paid";
    await booking.save();

    res.json({ success: true, message: "Payment recorded. Awaiting owner confirmation." });
  } catch (error) {
    console.log("Error confirming booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- STRIPE CHECKOUT SESSION ----------
export const createStripeSession = async (req, res) => {
  try {
    try {
      const s = await getSettings();
      if (!s.stripeEnabled) return res.status(403).json({ message: "Card payments are currently disabled." });
    } catch (_) {}

    console.log("📥 create-stripe-session body:", JSON.stringify(req.body, null, 2));

    let { bookingId, amount, roomId } = req.body;
    const originalAmount = amount;
    const requestedAmount = amount === undefined || amount === null ? undefined : Number(amount);

    if (!bookingId) {
      return res.status(400).json({ message: "Missing required field: bookingId" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    // Auto-resolve roomId from booking if not provided
    if (!roomId) {
      roomId = booking.roomId;
    }

    const room = hostel.rooms.find((r) => r.roomId === roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Auto-resolve amount from room pricing if not provided or invalid
    amount = requestedAmount > 0 ? requestedAmount : room.advanceAmount || room.seatPrice || 0;

    console.log("🔍 amount resolution:", {
      requestBodyAmount: originalAmount,
      requestedAmount,
      resolvedAmount: amount,
      roomAdvanceAmount: room.advanceAmount ?? null,
      roomSeatPrice: room.seatPrice ?? null,
    });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount is required and must be greater than 0",
        receivedAmount: requestedAmount,
        roomAdvanceAmount: room.advanceAmount ?? null,
        roomSeatPrice: room.seatPrice ?? null,
      });
    }

    const stripeAmount = Math.round(amount * 100);
    if (stripeAmount < 5000) {
      return res.status(400).json({
        message: `Amount too low. Stripe requires a minimum of 50 PKR (5000 paisas). Received: ${amount} PKR (${stripeAmount} paisas).`,
        receivedAmount: amount,
      });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      ownerId: hostel.ownerId,
      hostelId: booking.hostelId,
      roomId,
      amount,
      method: "stripe",
      status: "pending"
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Hostel Booking — ${hostel.name}`,
              description: `Room: ${room.title || roomId}`
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        paymentId: payment._id.toString(),
        bookingId: booking._id.toString()
      },
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancel`
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    // Update booking payment status
    booking.paymentStatus = "pending";
    await booking.save();

    res.status(201).json({
      message: "Stripe checkout session created",
      sessionUrl: session.url
    });
  } catch (error) {
    console.log("Error creating Stripe session:", error);
    if (error.type?.startsWith("Stripe")) {
      return res.status(400).json({
        message: error.message,
        stripeCode: error.code,
        stripeDeclineCode: error.decline_code || null,
      });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- STRIPE WEBHOOK ----------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: "Webhook signature verification failed" });
  }

  // Acknowledge receipt immediately so Stripe doesn't retry
  res.status(200).json({ received: true });

  // Helper: mark a payment+booking as paid and notify via email
  const markPaid = async (paymentId, bookingId, stripePaymentIntentId) => {
    if (!paymentId) { console.log("Webhook: no paymentId in metadata"); return; }
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) { console.log("Webhook: payment not found", paymentId); return; }
      if (["paid", "verified"].includes(payment.status)) {
        console.log("Webhook: payment already processed", paymentId); return;
      }

      payment.status = "paid";
      if (stripePaymentIntentId) payment.stripePaymentIntentId = stripePaymentIntentId;
      payment.paidAt = new Date();
      await payment.save();

      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = "paid";
          await booking.save();

          try {
            const hostel = await Hostel.findById(booking.hostelId).select("name ownerId");
            const owner  = await User.findById(hostel?.ownerId).select("email");
            const guest  = await User.findById(booking.userId).select("email name");

            if (owner?.email) transporter.sendMail({
              to: owner.email,
              subject: `Card Payment Received — ${hostel?.name}`,
              html: `<h2>Student Paid via Card</h2><p>A student paid the advance for <strong>${hostel?.name}</strong>. Please verify and confirm their seat in your Bookings dashboard.</p>`
            });

            if (guest?.email) transporter.sendMail({
              to: guest.email,
              subject: `Payment Received — ${hostel?.name}`,
              html: `<h2>Payment Received!</h2><p>Hi ${guest.name},</p><p>Your card payment for <strong>${hostel?.name}</strong> has been received. The owner will confirm your seat shortly.</p>`
            });

            // In-app: notify owner that card payment was received
            if (hostel?.ownerId) {
              notify({
                type:       "PAYMENT_SUBMITTED",
                receiverId: hostel.ownerId,
                senderId:   booking.userId,
                entityId:   payment._id,
                data:       { hostelName: hostel.name, method: "stripe" },
              }).catch(() => {});
            }
          } catch (_) {}
        }
      }
      console.log("Webhook: payment marked paid", paymentId);
    } catch (err) {
      console.log("Webhook: error processing", err.message);
    }
  };

  // PaymentIntent flow (used by the custom card element / PaymentForm)
  if (event.type === "payment_intent.succeeded") {
    const pi       = event.data.object;
    const { paymentId, bookingId } = pi.metadata || {};
    await markPaid(paymentId, bookingId, pi.id);
  }

  // Checkout Session flow (used if createStripeSession is ever called)
  if (event.type === "checkout.session.completed") {
    const session  = event.data.object;
    const { paymentId, bookingId } = session.metadata || {};
    await markPaid(paymentId, bookingId, session.payment_intent);
  }
};

// ---------- MANUAL PAYMENT (JAZZCASH / EASYPAISA) ----------
export const manualPayment = async (req, res) => {
  try {
    const { bookingId, method, ownerAccountNumber, receiptScreenshot } = req.body;

    if (!bookingId || !method || !receiptScreenshot) {
      return res.status(400).json({ message: "Missing required fields: bookingId, method, receiptScreenshot" });
    }

    if (!["jazzcash", "easypaisa"].includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Check if this payment method is enabled in platform settings
    try {
      const s = await getSettings();
      if (method === "jazzcash" && !s.jazzCashEnabled)
        return res.status(403).json({ message: "JazzCash payments are currently disabled." });
      if (method === "easypaisa" && !s.easypaisaEnabled)
        return res.status(403).json({ message: "Easypaisa payments are currently disabled." });
    } catch (_) {}

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    // Use roomId from booking or from request
    const roomId = req.body.roomId || booking.roomId;

    const room = hostel.rooms.find((r) => r.roomId === roomId);
    const amount = room ? room.advanceAmount : req.body.amount;

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      ownerId: hostel.ownerId,
      hostelId: booking.hostelId,
      roomId,
      amount: amount || 0,
      method,
      receiptScreenshot,
      ownerAccountNumber: ownerAccountNumber || "",
      status: "pending_verification"
    });

    // Update booking payment status only; status stays "pending" until owner verifies
    booking.paymentStatus = "pending_verification";
    await booking.save();

    // Fire-and-forget: email owner to verify the receipt
    try {
      const owner = await User.findById(hostel.ownerId).select("email");
      if (owner?.email) {
        transporter.sendMail({
          to: owner.email,
          subject: `Payment Receipt Submitted — ${hostel.name}`,
          html: `
            <h2>Payment Receipt Awaiting Verification</h2>
            <p>A student has submitted a <strong>${method}</strong> payment receipt for <strong>${hostel.name}</strong>.</p>
            <p>Please verify the receipt in your dashboard to reserve their seat.</p>
          `
        });
      }
    } catch (_) {}

    // Notify owner that a payment receipt was submitted
    notify({
      type:       "PAYMENT_SUBMITTED",
      receiverId: hostel.ownerId,
      senderId:   booking.userId,
      entityId:   payment._id,
      data:       { hostelName: hostel.name, method },
    }).catch(() => {});

    res.status(201).json({
      message: "Manual payment submitted for verification",
      payment
    });
  } catch (error) {
    console.log("Error submitting manual payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- GET PAYMENT FOR A BOOKING ----------
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payments = await Payment.find({ bookingId }).sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.log("Error fetching payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- GET MY PAYMENTS (LOGGED-IN USER) ----------
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("hostelId", "name")
      .populate("bookingId", "roomType")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = payments.map((p) => ({
      ...p,
      hostelName: p.hostelId?.name || "Unknown Hostel",
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.log("Error fetching my payments:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- VERIFY PAYMENT (OWNER) — works for manual AND card payments ----------
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Already finalised — nothing to do
    if (payment.status === "verified") {
      return res.status(400).json({ message: "Payment is already verified" });
    }
    if (payment.status === "rejected") {
      return res.status(400).json({ message: "Payment was already rejected" });
    }
    // Accept pending_verification (manual) AND paid (card/Stripe confirmed by frontend)

    payment.status = "verified";
    payment.paidAt = new Date();
    await payment.save();

    // Update booking — now it becomes reserved
    const booking = await Booking.findById(payment.bookingId)
      .populate("userId", "name email")
      .populate("hostelId", "name");
    if (booking) {
      booking.status = "reserved";
      booking.paymentStatus = "verified";
      await booking.save();
    }

    // Reserve seat
    await reserveSeat(payment.hostelId, payment.roomId);

    // Fire-and-forget: email user that their seat is reserved
    try {
      const userEmail = booking?.userId?.email;
      const userName = booking?.userId?.name;
      const hostelName = booking?.hostelId?.name;
      if (userEmail) {
        transporter.sendMail({
          to: userEmail,
          subject: `Seat Reserved — ${hostelName}`,
          html: `
            <h2>Your Seat is Reserved!</h2>
            <p>Hi ${userName},</p>
            <p>Great news! Your payment has been verified and your seat at <strong>${hostelName}</strong> is now <strong>reserved</strong>.</p>
            <ul>
              <li>Amount Paid: PKR ${payment.amount?.toLocaleString() || "—"}</li>
              <li>Method: ${payment.method}</li>
              <li>Status: Confirmed</li>
            </ul>
            <p>Welcome to your new hostel!</p>
          `
        });
      }
    } catch (_) {}

    // Notify student that their payment is verified and seat is reserved
    const studentId  = booking?.userId?._id;
    const hostelName = booking?.hostelId?.name || "your hostel";
    if (studentId) {
      notify({
        type:       "PAYMENT_VERIFIED",
        receiverId: studentId,
        senderId:   req.user._id,
        entityId:   payment._id,
        data:       { hostelName },
      }).catch(() => {});
    }

    res.status(200).json({
      message: "Payment verified successfully",
      payment
    });
  } catch (error) {
    console.log("Error verifying payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------- REJECT PAYMENT (OWNER) — works for manual AND card payments ----------
export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason, reason } = req.body;
    const rejectReason = rejectionReason || reason || "";

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status === "verified") {
      return res.status(400).json({ message: "Payment is already verified and cannot be rejected" });
    }
    if (payment.status === "rejected") {
      return res.status(400).json({ message: "Payment is already rejected" });
    }

    payment.status = "rejected";
    payment.rejectionReason = rejectReason;
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.bookingId)
      .populate("userId", "name email")
      .populate("hostelId", "name");
    if (booking) {
      booking.paymentStatus = "rejected";
      await booking.save();

      // Notify student that their payment was rejected
      const studentId = booking.userId?._id;
      if (studentId) {
        notify({
          type:       "PAYMENT_REJECTED",
          receiverId: studentId,
          senderId:   req.user._id,
          entityId:   payment._id,
          data:       { hostelName: booking.hostelId?.name || "your hostel" },
        }).catch(() => {});
      }
    }

    res.status(200).json({
      message: "Payment rejected",
      payment
    });
  } catch (error) {
    console.log("Error rejecting payment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
