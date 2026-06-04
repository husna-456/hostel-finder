// models/Message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: { type: Date, default: null },
    seenAt:      { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
