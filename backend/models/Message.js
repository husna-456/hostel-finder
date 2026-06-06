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
      default: "",
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: { type: Date, default: null },
    seenAt:      { type: Date, default: null },

    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "document", "poll"],
      default: "text",
    },
    fileUrl:   { type: String, default: null },
    fileName:  { type: String, default: null },
    fileSize:  { type: Number, default: null },
    duration:  { type: Number, default: null },  // seconds for audio/voice

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isDeleted:  { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    poll: {
      question: String,
      options: [{
        _id: false,
        text: String,
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
