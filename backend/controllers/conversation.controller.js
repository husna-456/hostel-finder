// controllers/conversation.controller.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

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

    const userIdStr = userId.toString();
    const result = conversations.map(c => ({
      ...c.toObject(),
      unreadCount: c.unreadCounts?.get?.(userIdStr) || 0,
      isArchived: c.archivedBy?.some(id => id.toString() === userIdStr) || false,
    }));
    res.json(result);
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

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const conversations = await Conversation.find({
      $or: [{ clientId: userId }, { ownerId: userId }],
    });
    const updates = conversations.map(c =>
      Conversation.findByIdAndUpdate(c._id, { $set: { [`unreadCounts.${userIdStr}`]: 0 } })
    );
    await Promise.all(updates);
    await Message.updateMany(
      { receiverId: userId, status: { $ne: "read" } },
      { status: "read", seenAt: new Date() }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const archiveAll = async (req, res) => {
  try {
    const userId = req.user._id;
    await Conversation.updateMany(
      {
        $or: [{ clientId: userId }, { ownerId: userId }],
        archivedBy: { $ne: userId },
      },
      { $push: { archivedBy: userId } }
    );
    res.json({ message: "All conversations archived" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unarchiveAll = async (req, res) => {
  try {
    const userId = req.user._id;
    await Conversation.updateMany(
      { $or: [{ clientId: userId }, { ownerId: userId }] },
      { $pull: { archivedBy: userId } }
    );
    res.json({ message: "All conversations unarchived" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
