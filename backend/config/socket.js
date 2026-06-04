// config/socket.js
import { Server } from "socket.io";
import verifySocketToken from "../utils/verifySocketToken.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CORS_ORIGIN || "http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  io.use(verifySocketToken);

  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    socket.join(userId);

    // Mark online
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
      io.emit("user_status_change", { userId, isOnline: true, lastSeen: null });
    } catch (err) {
      console.error("online status error:", err.message);
    }

    // ── JOIN CONVERSATION ──────────────────────────────────────────────────────
    socket.on("join_conversation", async (conversationId) => {
      socket.join(conversationId);

      // Mark all unread messages (where this user is receiver) as read
      try {
        const unread = await Message.find({
          conversationId,
          receiverId: userId,
          status: { $ne: "read" },
        }).lean();

        if (unread.length > 0) {
          const now = new Date();
          await Message.updateMany(
            { conversationId, receiverId: userId, status: { $ne: "read" } },
            { status: "read", seenAt: now }
          );

          // Notify each sender
          const senderIds = [...new Set(unread.map((m) => m.senderId.toString()))];
          senderIds.forEach((sid) => {
            io.to(sid).emit("messages_seen", { conversationId, seenBy: userId });
          });
        }
      } catch (err) {
        console.error("mark seen error:", err.message);
      }
    });

    // ── SEND MESSAGE ───────────────────────────────────────────────────────────
    socket.on("send_message", async ({ conversationId, text, tempId }) => {
      try {
        if (!text?.trim()) return;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        const senderId = socket.user.id;
        let receiverId;

        if (senderId === convo.clientId.toString()) {
          receiverId = convo.ownerId.toString();
        } else if (senderId === convo.ownerId.toString()) {
          receiverId = convo.clientId.toString();
        } else {
          return;
        }

        const message = await Message.create({
          conversationId,
          senderId,
          receiverId,
          message: text,
          status: "sent",
        });

        convo.lastMessage = text;
        await convo.save();

        // Ack to sender so temp message is replaced with real DB record
        io.to(senderId).emit("message_ack", { ...message.toObject(), tempId });

        // Check if receiver is currently online
        const receiverRoom = io.sockets.adapter.rooms.get(receiverId);
        if (receiverRoom && receiverRoom.size > 0) {
          // Auto-deliver: receiver is online
          const now = new Date();
          await Message.findByIdAndUpdate(message._id, {
            status: "delivered",
            deliveredAt: now,
          });
          io.to(receiverId).emit("receive_message", {
            ...message.toObject(),
            status: "delivered",
            deliveredAt: now,
          });
          io.to(senderId).emit("message_delivered", {
            messageId: message._id.toString(),
          });
        } else {
          io.to(receiverId).emit("receive_message", message.toObject());
        }
      } catch (err) {
        console.error("send_message error:", err.message);
      }
    });

    // ── TYPING ─────────────────────────────────────────────────────────────────
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_typing", { conversationId });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_stop_typing", { conversationId });
    });

    // ── DISCONNECT ─────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      try {
        const now = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: now });
        io.emit("user_status_change", { userId, isOnline: false, lastSeen: now });
      } catch (err) {
        console.error("offline status error:", err.message);
      }
    });
  });

  return io;
};
