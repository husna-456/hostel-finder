import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    roomId: String,
    roomType: String,

    name: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    category: String,
    people: Number,
    message: String,

    status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "reserved"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "pending_verification", "paid", "verified", "rejected"],
    default: "unpaid"
  },
  proposedStatus: {  // New field for owner's draft
    type: String,
    enum: ["accepted", "rejected"],
    default: null
  }
},{ timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
