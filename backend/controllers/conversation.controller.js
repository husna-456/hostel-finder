// controllers/conversation.controller.js
import Conversation from "../models/Conversation.js";

const USER_FIELDS = "name profilePicture isOnline lastSeen";

export const getOrCreateConversation = async (req, res) => {
  try {
    const { hostelId, ownerId } = req.body;
    const clientId = req.user._id;

    let conversation = await Conversation.findOne({ hostelId, clientId, ownerId })
      .populate("clientId", USER_FIELDS)
      .populate("ownerId",  USER_FIELDS)
      .populate("hostelId", "name");

    if (!conversation) {
      conversation = await Conversation.create({ hostelId, clientId, ownerId });
      conversation = await Conversation.findById(conversation._id)
        .populate("clientId", USER_FIELDS)
        .populate("ownerId",  USER_FIELDS)
        .populate("hostelId", "name");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const role   = req.user.role;

    let conversations;

    if (role === "hostel_owner") {
      conversations = await Conversation.find({ ownerId: userId })
        .populate("clientId", USER_FIELDS)
        .populate("hostelId", "name")
        .sort({ updatedAt: -1 });
    } else {
      conversations = await Conversation.find({ clientId: userId })
        .populate("ownerId",  USER_FIELDS)
        .populate("hostelId", "name")
        .sort({ updatedAt: -1 });
    }

    res.json(conversations);
  } catch (err) {
    console.error("getUserConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOwnerConversations = async (req, res) => {
  const { ownerId } = req.params;
  const conversations = await Conversation.find({ ownerId })
    .populate("hostelId", "name")
    .populate("clientId", USER_FIELDS);
  res.json(conversations);
};
