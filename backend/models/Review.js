import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostelId:   { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", default: null },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, trim: true, maxlength: 1000 },
  status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

ReviewSchema.index({ userId: 1, hostelId: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ status: 1, createdAt: -1 });

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
