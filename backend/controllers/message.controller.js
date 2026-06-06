// controllers/message.controller.js
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../services/socket.service.js";

const REPLY_POPULATE = {
  path: "replyTo",
  select: "message type fileName senderId",
  populate: { path: "senderId", select: "name" },
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort("createdAt")
      .populate(REPLY_POPULATE);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, message } = req.body;

    const msg = await Message.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      message,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      updatedAt: new Date(),
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { deleteType } = req.body;
    const userId = req.user._id;

    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (deleteType === "forme") {
      const alreadyDeleted = msg.deletedFor.some(
        (id) => id.toString() === userId.toString()
      );
      if (!alreadyDeleted) {
        msg.deletedFor.push(userId);
        await msg.save();
      }
      return res.json(msg);
    }

    if (deleteType === "foreveryone") {
      if (msg.senderId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You can only delete your own messages" });
      }
      msg.isDeleted = true;
      msg.message = "";
      msg.fileUrl = "";
      await msg.save();

      try {
        const io = getIO();
        io.to(msg.conversationId.toString()).emit("message_deleted", {
          messageId: msg._id.toString(),
        });
      } catch (_) {}

      return res.json(msg);
    }

    res.status(400).json({ message: "Invalid deleteType" });
  } catch (err) {
    console.error("deleteMessage error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user._id.toString();

    const msg = await Message.findById(req.params.messageId);
    if (!msg || msg.type !== "poll") {
      return res.status(404).json({ message: "Poll not found" });
    }

    msg.poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((v) => v.toString() !== userId);
    });

    if (optionIndex >= 0 && optionIndex < msg.poll.options.length) {
      msg.poll.options[optionIndex].votes.push(req.user._id);
    }

    await msg.save();

    try {
      const io = getIO();
      io.to(msg.conversationId.toString()).emit("poll_updated", {
        messageId: msg._id.toString(),
        poll: msg.poll,
      });
    } catch (_) {}

    res.json({ poll: msg.poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
