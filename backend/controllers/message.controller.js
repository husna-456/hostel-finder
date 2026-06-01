// controllers/message.controller.js
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

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
