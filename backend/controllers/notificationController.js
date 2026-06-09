import Notification from "../models/Notification.js";

// GET /api/notifications — last 50 for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user._id })
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch (err) {
    console.error("getNotifications error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ receiverId: req.user._id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/:id/read
export const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, receiverId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiverId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/notifications/:id
export const deleteOne = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, receiverId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
