import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  FaCreditCard, FaMobileAlt, FaCheckCircle, FaTimesCircle,
  FaUpload, FaArrowLeft, FaLock, FaBuilding, FaDoorOpen,
  FaMoneyBillWave, FaUser, FaEnvelope
} from "react-icons/fa";
import { toast } from "react-toastify";
import { submitManualPayment, getPaymentByBooking } from "../../api/payment.api";
import { fetchClient } from "../../api/fetchClient";
import { supabase } from "../../lib/supabaseClient";
import PaymentForm from "../../components/Payment/PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [method, setMethod] = useState("card");
  const [manualMethod, setManualMethod] = useState("jazzcash");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, [bookingId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        fetchClient(`/bookings/${bookingId}`),
        getPaymentByBooking(bookingId),
      ]);

      const bookingData = results[0].status === "fulfilled" ? results[0].value : null;
      const paymentResponse = results[1].status === "fulfilled" ? results[1].value : null;
      // Debug: raw responses to inspect field names for room/advance amount
      console.log("[PaymentPage] booking API response:", bookingData);
      console.log("[PaymentPage] payment API response:", paymentResponse);
      const paymentData = paymentResponse?.payment || paymentResponse || null;
      const bookingRecord = bookingData || paymentData?.bookingId || null;
      const hostelFromBooking = bookingRecord?.hostelId || bookingRecord?.hostel || null;
      const hostelFromPayment = paymentData?.bookingId?.hostelId || paymentData?.hostelId || null;

      setBooking(bookingRecord);
      setPayment(paymentData);
      setHostel(hostelFromBooking || hostelFromPayment || null);

      if (paymentData?.status === "verified" || paymentData?.status === "reserved") {
        setPaymentDone(true);
      }
    } catch (err) {
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleCardSuccess = () => {
    setPaymentDone(true);
    toast.success("Booking confirmed successfully!");
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleManualSubmit = async () => {
    if (!receiptFile) {
      toast.error("Please upload payment receipt");
      return;
    }

    try {
      setSubmitting(true);
      const fileName = `receipts/${Date.now()}-${receiptFile.name}`;
      const { error } = await supabase.storage.from("hostel-images").upload(fileName, receiptFile);
      if (error) throw error;

      const { data } = supabase.storage.from("hostel-images").getPublicUrl(fileName);
      await submitManualPayment(bookingId, manualMethod, data.publicUrl, transactionRef);
      toast.success("Payment submitted, waiting for owner verification");
      loadPaymentData();
    } catch (err) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  const getAdvanceAmount = () => {
    // Try several common field names that might be present depending on backend
    const candidates = [
      booking?.roomAdvanceAmount,
      booking?.roomDetails?.advanceAmount,
      payment?.amount,
      booking?.advanceAmount,
      booking?.advance_amount,
      booking?.advance,
      booking?.amount,
      booking?.price,
      booking?.room?.advanceAmount,
      booking?.room?.advance_amount,
      payment?.bookingId?.advanceAmount,
      payment?.bookingId?.advance_amount,
    ];

    for (const c of candidates) {
      if (c != null && c !== "") return Number(c);
    }

    if (hostel?.rooms && booking?.roomId) {
      const roomId = typeof booking.roomId === "string" ? booking.roomId : booking.roomId?.roomId || booking.roomId?._id;
      const room = hostel.rooms.find((r) => (r.roomId || r._id) === roomId);
      const roomCandidates = [room?.advanceAmount, room?.advance_amount, room?.price, room?.amount];
      for (const rc of roomCandidates) if (rc != null && rc !== "") return Number(rc);
    }

    return 0;
  };

  const advanceAmount = getAdvanceAmount();
  // Debug: computed amount
  console.log("[PaymentPage] computed advanceAmount:", advanceAmount);
  const paymentStatus = payment?.status || booking?.paymentStatus || payment?.bookingId?.paymentStatus;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-6 md:py-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/user/my-bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors text-sm"
        >
          <FaArrowLeft /> Back to My Bookings
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2">Complete Payment</h2>
          <p className="text-gray-600 text-sm md:text-base">Secure your booking by paying the advance</p>
        </motion.div>

        {/* Booking Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-purple-100 p-5 md:p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-purple-400 shrink-0" />
              <div className="flex justify-between flex-1">
                <span className="text-gray-500">Hostel</span>
                <span className="font-semibold text-gray-800 text-right">
                  {hostel?.name || booking?.hostelId?.name || booking?.hostel?.name || payment?.bookingId?.hostelId?.name || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaDoorOpen className="text-purple-400 shrink-0" />
              <div className="flex justify-between flex-1">
                <span className="text-gray-500">Room</span>
                <span className="font-semibold text-gray-800">
                  {booking?.roomType || booking?.room?.roomType || booking?.room?.type || payment?.bookingId?.roomType || "—"}
                </span>
              </div>
            </div>
            {(booking?.name || booking?.email || payment?.bookingId?.name) && (
              <>
                <div className="flex items-center gap-3">
                  <FaUser className="text-purple-400 shrink-0" />
                  <div className="flex justify-between flex-1">
                    <span className="text-gray-500">Booked by</span>
                    <span className="font-semibold text-gray-800 text-right">{booking?.name || payment?.bookingId?.name || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-purple-400 shrink-0" />
                  <div className="flex justify-between flex-1">
                    <span className="text-gray-500">Email</span>
                    <span className="font-semibold text-gray-800 text-right text-xs">{booking?.email || payment?.bookingId?.email || "—"}</span>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3 mt-2">
              <FaMoneyBillWave className="text-purple-500 shrink-0" />
              <div className="flex justify-between flex-1">
                <span className="text-gray-700 font-semibold">Advance Required</span>
                <span className="text-purple-700 font-bold text-lg">
                  PKR {advanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Done */}
        {paymentDone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 text-center"
          >
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful</h3>
            <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>
            <button
              onClick={() => navigate("/user/my-bookings")}
              className="w-full py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              View My Bookings
            </button>
          </motion.div>
        ) : paymentStatus === "payment-submitted" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center"
          >
            <FaCheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Submitted</h3>
            <p className="text-gray-600">
              Your payment is being reviewed by the hostel owner. You'll be notified once verified.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Payment status banner */}
            {paymentStatus === "payment-rejected" && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                <FaTimesCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Payment Rejected</p>
                  {payment?.rejectionReason && (
                    <p className="text-xs text-red-600 mt-0.5">Reason: {payment.rejectionReason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Method Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setMethod("card")}
                className={`flex-1 py-3.5 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm md:text-base ${
                  method === "card"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                <FaCreditCard /> Card
              </button>
              <button
                onClick={() => setMethod("manual")}
                className={`flex-1 py-3.5 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm md:text-base ${
                  method === "manual"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                <FaMobileAlt /> Mobile Wallet
              </button>
            </div>

            {/* Card Payment - Stripe Elements */}
            {method === "card" && (
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-5 md:p-6">
                <p className="text-gray-500 text-sm mb-4">
                  Enter your card details to pay{" "}
                  <span className="font-bold text-purple-700">PKR {advanceAmount.toLocaleString()}</span> securely via Stripe.
                </p>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    bookingId={bookingId}
                    amount={advanceAmount}
                    onSuccess={handleCardSuccess}
                  />
                </Elements>
              </div>
            )}

            {/* Manual Payment */}
            {method === "manual" && (
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-5 md:p-6 space-y-5">
                {/* Wallet Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setManualMethod("jazzcash")}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                      manualMethod === "jazzcash"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    JazzCash
                  </button>
                  <button
                    onClick={() => setManualMethod("easypaisa")}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                      manualMethod === "easypaisa"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Easypaisa
                  </button>
                </div>

                {/* Account Number */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Send payment to:</p>
                  <p className="text-lg md:text-xl font-bold text-gray-800 break-all">
                    {manualMethod === "jazzcash"
                      ? hostel?.jazzCashNumber || payment?.bookingId?.hostelId?.jazzCashNumber || "Not provided"
                      : hostel?.easypaisaNumber || payment?.bookingId?.hostelId?.easypaisaNumber || "Not provided"}
                  </p>
                </div>

                {/* Amount */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Amount to send:</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-800">
                    PKR {advanceAmount.toLocaleString()}
                  </p>
                </div>

                {/* Transaction Reference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction Reference (optional)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition text-sm"
                    placeholder="e.g. TID-123456789"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Payment Receipt *
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition">
                    <FaUpload className="text-gray-400 mb-1" />
                    <p className="text-xs md:text-sm text-gray-500">Click to upload screenshot</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                  {receiptPreview && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="h-20 md:h-24 rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-lg transition-all ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
