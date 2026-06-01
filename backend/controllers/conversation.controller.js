// controllers/conversation.controller.js
import Conversation from "../models/Conversation.js";

export const getOrCreateConversation = async (req, res) => {
  try {
    const { hostelId, ownerId } = req.body;
    const clientId = req.user._id;

    let conversation = await Conversation.findOne({
      hostelId,
      clientId,
      ownerId,
    })
      .populate("clientId", "name avatar")
      .populate("ownerId", "name avatar")
      .populate("hostelId", "name");

    if (!conversation) {
      conversation = await Conversation.create({
        hostelId,
        clientId,
        ownerId,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("clientId", "name avatar")
        .populate("ownerId", "name avatar")
        .populate("hostelId", "name");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getUserConversations = async (req, res) => {
  try {
    console.log("👤 USER:", {
  id: req.user._id,
  role: req.user.role,
});

    const userId = req.user._id; // ✅ FIXED
    const role = req.user.role;

    let conversations;

    if (role === "hostel_owner") {
      conversations = await Conversation.find({
        ownerId: userId,
      })
        .populate("clientId", "name avatar")
        .populate("hostelId", "name")
        .sort({ updatedAt: -1 });
    } else {
      conversations = await Conversation.find({
        clientId: userId,
      })
        .populate("ownerId", "name avatar")
        .populate("hostelId", "name")
        .sort({ updatedAt: -1 });
    }


    res.json(conversations);
    console.log("📦 conversations found:", conversations.length);
  } catch (err) {
    console.error("❌ getUserConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOwnerConversations = async (req, res) => {
  const { ownerId } = req.params;

  const conversations = await Conversation.find({ ownerId })
    .populate("hostelId clientId");

  res.json(conversations);
};
