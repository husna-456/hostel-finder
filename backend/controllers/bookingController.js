import mongoose from "mongoose";
const { Types: { ObjectId } } = mongoose;
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { Hostel } from "../models/Hostel.js";
import { notify } from "../services/notificationService.js";

// --------------------------------
// USER: Create Booking
// --------------------------------
export const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hostelId, roomId, roomType, name, contactNo, email, category, people, message } = req.body;

    if (!hostelId || !name || !contactNo || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = new Booking({
      hostelId,
      userId,
      roomId: roomId || undefined,
      roomType: roomType || undefined,
      name,
      contactNo,
      email,
      category,
      people,
      message
    });

    const savedBooking = await booking.save();

    const populated = await Booking.findById(savedBooking._id)
      .populate("hostelId", "name ownerId")
      .populate("userId", "name email");

    const hostelName = populated.hostelId?.name || "your hostel";
    const ownerId    = populated.hostelId?.ownerId;

    // Confirm to guest that their request was received (in-app + email)
    notify({
      type:       "BOOKING_RECEIVED",
      receiverId: userId,
      entityId:   savedBooking._id,
      data:       { hostelName, people, roomType: roomType || "Any" },
    }).catch(() => {});

    // Notify owner of new booking request (in-app + email)
    if (ownerId) {
      notify({
        type:       "BOOKING_REQUEST",
        receiverId: ownerId,
        senderId:   userId,
        entityId:   savedBooking._id,
        data:       { guestName: name, hostelName, people, roomType: roomType || "Any", contactNo },
      }).catch(() => {});
    }

    res.status(201).json({ message: "Booking created!", booking: populated });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get bookings for a specific hostel
export const getBookings = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const bookings = await Booking.find({ hostelId }).populate("hostelId", "name");
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// --------------------------------
// USER: Get My Bookings (with latest payment)
// --------------------------------
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ userId })
      .populate("hostelId", "name images startingRent rooms")
      .sort({ createdAt: -1 })
      .lean();

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    const payMap = {};
    payments.forEach(p => {
      const key = p.bookingId?.toString();
      if (key && !payMap[key]) payMap[key] = p;
    });

    const enriched = bookings.map(b => {
      const pay = payMap[b._id.toString()];
      const room = b.hostelId?.rooms?.find(r => r.roomId === b.roomId);
      return {
        ...b,
        advanceAmount: room?.advanceAmount ?? null,
        payment: pay ? { _id: pay._id, status: pay.status, amount: pay.amount, method: pay.method, receiptScreenshot: pay.receiptScreenshot, rejectionReason: pay.rejectionReason } : null,
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// --------------------------------
// OWNER: Get all bookings of my hostels (with advanceAmount per booking)
// --------------------------------
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user._id);
    const ownerHostels = await Hostel.find({ ownerId }).select("_id");
    if (ownerHostels.length === 0) {
      return res.status(200).json([]);
    }
    const hostelIds = ownerHostels.map(h => h._id);

    const bookings = await Booking.find({ hostelId: { $in: hostelIds } })
      .populate("hostelId", "name rooms jazzCashNumber easypaisaNumber")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Attach advanceAmount + latest payment per booking
    const payments = await Payment.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    const payMap = {};
    payments.forEach(p => {
      const key = p.bookingId?.toString();
      if (key && !payMap[key]) payMap[key] = p;
    });

    const enriched = bookings.map((b) => {
      const room = b.hostelId?.rooms?.find(r => r.roomId === b.roomId);
      const pay  = payMap[b._id.toString()];
      return {
        ...b,
        advanceAmount: room?.advanceAmount ?? null,
        payment: pay ? { _id: pay._id, status: pay.status, amount: pay.amount, method: pay.method, receiptScreenshot: pay.receiptScreenshot, rejectionReason: pay.rejectionReason } : null,
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error("Owner Bookings Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["accepted", "rejected", "reserved", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel || hostel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: you do not own this hostel" });
    }
    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("hostelId", "name")
      .populate("userId", "name email");

    // Notify the student when owner accepts or rejects
    if (status === "accepted" || status === "rejected") {
      const notifType  = status === "accepted" ? "BOOKING_ACCEPTED" : "BOOKING_REJECTED";
      const hostelName = updatedBooking.hostelId?.name || "your hostel";
      const studentId  = updatedBooking.userId?._id;
      if (studentId) {
        notify({
          type:       notifType,
          receiverId: studentId,
          senderId:   req.user._id,
          entityId:   updatedBooking._id,
          data:       { hostelName },
        }).catch(() => {});
      }
    }

    return res.json(updatedBooking);
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSingleBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate hostelId with every field PaymentPage needs:
    // - name, jazzCashNumber, easypaisaNumber, contact  → for display + manual payment
    // - rooms                                           → for advance amount lookup
    // - images, startingRent                            → for booking summary display
    const booking = await Booking.findById(id)
      .populate("hostelId", "name jazzCashNumber easypaisaNumber contact rooms images startingRent")
      .populate("userId", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Resolve room details directly from the now-populated hostelId.rooms
    let roomDetails = null;
    let roomAdvanceAmount = null;
    let roomSeatPrice = null;

    if (booking.hostelId?.rooms && booking.roomId) {
      roomDetails = booking.hostelId.rooms.find((r) => r.roomId === booking.roomId) || null;
      roomAdvanceAmount = roomDetails?.advanceAmount ?? null;
      roomSeatPrice     = roomDetails?.seatPrice     ?? null;
    }

    res.status(200).json({
      ...booking,
      roomDetails,
      roomAdvanceAmount,
      roomSeatPrice,
      roomType: booking.roomType || roomDetails?.type || roomDetails?.name || null,
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// USER: Cancel Booking (only allowed while status is "pending")
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be cancelled" });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      message: "Booking cancelled successfully",
      deletedBookingId: bookingId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// OWNER: Mark booking as completed
export const markBookingCompleted = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel || hostel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "completed";
    await booking.save();
    res.json({ message: "Booking marked as completed", booking });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
