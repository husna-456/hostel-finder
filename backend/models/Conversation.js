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
      type: String,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    archivedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

conversationSchema.index(
  { hostelId: 1, clientId: 1, ownerId: 1 },
  { unique: true }
);

export default mongoose.model("Conversation", conversationSchema);
