// config/socket.js
import { Server } from "socket.io";
import verifySocketToken from "../utils/verifySocketToken.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

const REPLY_POPULATE = {
  path: "replyTo",
  select: "message type fileName senderId",
  populate: { path: "senderId", select: "name" },
};

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

          const senderIds = [...new Set(unread.map((m) => m.senderId.toString()))];
          senderIds.forEach((sid) => {
            io.to(sid).emit("messages_seen", { conversationId, seenBy: userId });
          });
        }

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCounts.${userId}`]: 0 },
        });
        io.to(userId).emit("unread_count_update", { conversationId, unreadCount: 0 });
      } catch (err) {
        console.error("mark seen error:", err.message);
      }
    });

    // ── LEAVE CONVERSATION ─────────────────────────────────────────────────────
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    // ── MARK SEEN ─────────────────────────────────────────────────────────────
    socket.on("mark_seen", async ({ conversationId }) => {
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
          const senderIds = [...new Set(unread.map((m) => m.senderId.toString()))];
          senderIds.forEach((sid) => {
            io.to(sid).emit("messages_seen", { conversationId, seenBy: userId });
          });
        }

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCounts.${userId}`]: 0 },
        });
        io.to(userId).emit("unread_count_update", { conversationId, unreadCount: 0 });
      } catch (err) {
        console.error("mark_seen error:", err.message);
      }
    });

    // ── SEND MESSAGE ───────────────────────────────────────────────────────────
    socket.on(
      "send_message",
      async ({
        conversationId,
        text,
        tempId,
        type = "text",
        fileUrl,
        fileName,
        fileSize,
        duration,
        poll,
        replyTo,
      }) => {
        try {
          // For non-text messages allow empty text (use type as fallback check)
          const hasContent = (text && text.trim()) || fileUrl || poll;
          if (!hasContent) return;

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

          const msgData = {
            conversationId,
            senderId,
            receiverId,
            message: text || "",
            status: "sent",
            type,
          };
          if (fileUrl)  msgData.fileUrl  = fileUrl;
          if (fileName) msgData.fileName = fileName;
          if (fileSize) msgData.fileSize = fileSize;
          if (duration) msgData.duration = duration;
          if (poll)     msgData.poll     = poll;
          if (replyTo)  msgData.replyTo  = replyTo;

          const message = await Message.create(msgData);

          // Populate replyTo for rich display on both sides
          const populated = await Message.findById(message._id).populate(REPLY_POPULATE);

          const convRoom = io.sockets.adapter.rooms.get(conversationId);
          const receiverIsViewing = convRoom && [...convRoom].some((sid) => {
            const s = io.sockets.sockets.get(sid);
            return s && s.user.id === receiverId;
          });

          let lastMessagePreview;
          if (type === "image")         lastMessagePreview = "📷 Photo";
          else if (type === "video")    lastMessagePreview = "🎬 Video";
          else if (type === "audio")    lastMessagePreview = "🎵 Audio";
          else if (type === "document") lastMessagePreview = `📄 ${fileName || "Document"}`;
          else if (type === "poll")     lastMessagePreview = `📊 ${poll?.question || "Poll"}`;
          else                          lastMessagePreview = text;

          const updateData = { lastMessage: lastMessagePreview };
          if (!receiverIsViewing) {
            updateData.$inc = { [`unreadCounts.${receiverId}`]: 1 };
          }
          const updatedConvo = await Conversation.findByIdAndUpdate(
            conversationId,
            updateData,
            { new: true }
          );

          const msgObj = populated.toObject();

          // Ack to sender so temp message is replaced with real DB record
          io.to(senderId).emit("message_ack", { ...msgObj, tempId });

          // Deliver to receiver
          const receiverRoom = io.sockets.adapter.rooms.get(receiverId);
          if (receiverRoom && receiverRoom.size > 0) {
            const now = new Date();
            await Message.findByIdAndUpdate(message._id, {
              status: "delivered",
              deliveredAt: now,
            });
            io.to(receiverId).emit("receive_message", {
              ...msgObj,
              status: "delivered",
              deliveredAt: now,
            });
            io.to(senderId).emit("message_delivered", {
              messageId: message._id.toString(),
            });
          } else {
            io.to(receiverId).emit("receive_message", msgObj);
          }

          if (!receiverIsViewing) {
            const newCount = updatedConvo.unreadCounts?.get?.(receiverId) || 0;
            io.to(receiverId).emit("unread_count_update", {
              conversationId,
              unreadCount: newCount,
              lastMessage: lastMessagePreview,
            });
          }
          io.to(senderId).emit("unread_count_update", {
            conversationId,
            unreadCount: 0,
            lastMessage: lastMessagePreview,
          });
        } catch (err) {
          console.error("send_message error:", err.message);
        }
      }
    );

    // ── TYPING ─────────────────────────────────────────────────────────────────
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_typing", { conversationId });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_stop_typing", { conversationId });
    });

    // ── VOICE CALL RELAY ───────────────────────────────────────────────────────
    // Caller → server → Receiver: initiate call (contains offer)
    socket.on("call:initiate", ({ to, callerName, callerAvatar, offer }) => {
      io.to(to).emit("call:incoming", {
        from: userId,
        callerName,
        callerAvatar,
        offer,
      });
    });

    // Receiver → server → Caller: call accepted (contains answer)
    socket.on("call:accepted", ({ to, answer }) => {
      io.to(to).emit("call:accepted", { from: userId, answer });
    });

    // Receiver → server → Caller: call rejected
    socket.on("call:rejected", ({ to }) => {
      io.to(to).emit("call:rejected", { from: userId });
    });

    // Either side → server → Other: call ended
    socket.on("call:ended", ({ to }) => {
      io.to(to).emit("call:ended", { from: userId });
    });

    // WebRTC offer relay (caller → recipient after accept)
    socket.on("call:offer", ({ to, offer }) => {
      io.to(to).emit("call:offer", { from: userId, offer });
    });

    // WebRTC answer relay (recipient → caller)
    socket.on("call:answer", ({ to, answer }) => {
      io.to(to).emit("call:answer", { from: userId, answer });
    });

    // ICE candidate relay (bidirectional)
    socket.on("call:ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("call:ice-candidate", { from: userId, candidate });
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
