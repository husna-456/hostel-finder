import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true
    },
    roomId: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa"],
      required: true
    },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    receiptScreenshot: String,
    ownerAccountNumber: String,
    rejectionReason: String,
    status: {
      type: String,
      enum: ["pending", "pending_verification", "paid", "verified", "failed", "rejected"],
      default: "pending"
    },
    paidAt: Date
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
