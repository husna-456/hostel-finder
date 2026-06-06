// controllers/message.controller.js
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../services/socket.service.js";

export const getMessages = async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.conversationId,
  }).sort("createdAt");

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const { conversationId, receiverId, message } = req.body;

  const msg = await Message.create({
    conversationId,
    senderId: req.user.id,
    receiverId,
    message,
  });

    // 2️⃣ Update conversation
  await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: message,      // chat list preview
      updatedAt: new Date(),     // 🔥 MOST IMPORTANT
    }
  );


  res.json(msg);
};

export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user._id.toString();

    const msg = await Message.findById(req.params.messageId);
    if (!msg || msg.type !== 'poll') {
      return res.status(404).json({ message: "Poll not found" });
    }

    msg.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId);
    });

    if (optionIndex >= 0 && optionIndex < msg.poll.options.length) {
      msg.poll.options[optionIndex].votes.push(req.user._id);
    }

    await msg.save();

    try {
      const io = getIO();
      io.to(msg.conversationId.toString()).emit('poll_updated', {
        messageId: msg._id.toString(),
        poll: msg.poll,
      });
    } catch (_) {}

    res.json({ poll: msg.poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
