import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "BOOKING_REQUEST",
  "BOOKING_ACCEPTED",
  "BOOKING_REJECTED",
  "NEW_MESSAGE",
  "PAYMENT_SUBMITTED",
  "PAYMENT_VERIFIED",
  "PAYMENT_REJECTED",
];

const notificationSchema = new mongoose.Schema(
  {
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type:       { type: String, enum: NOTIFICATION_TYPES, required: true },
    title:      { type: String, default: "" },
    message:    { type: String, required: true },
    entityId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    link:       { type: String, default: "" },
    isRead:     { type: Boolean, default: false, index: true },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index for anti-spam upsert + fast per-user queries
notificationSchema.index({ receiverId: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, type: 1, entityId: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
