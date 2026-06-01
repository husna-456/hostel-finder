// models/Conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     lastMessage: {
      type: String,   // 🔥 CHAT LIST KE LIYE
    },
  },
  { timestamps: true }
);

conversationSchema.index(
  { hostelId: 1, clientId: 1, ownerId: 1 },
  { unique: true }
);

export default mongoose.model("Conversation", conversationSchema);
