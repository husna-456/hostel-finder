// config/socket.js
import { Server } from "socket.io";
import verifySocketToken from "../utils/verifySocketToken.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const initSocket = (server) => {
  console.log("🔥 SOCKET.JS FILE LOADED");
  const io = new Server(server, {
    cors: {
      origin: [process.env.CORS_ORIGIN || "http://localhost:5173", "http://localhost:5174"],
      credentials: true
    },
   
  });
  io.use(verifySocketToken);

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(userId);

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

 socket.on("send_message", async ({ conversationId, text }) => {
  try {
    if (!text || !text.trim()) return;
    console.log("📨 SEND_MESSAGE EVENT");
    console.log("➡️ From socket user:", socket.user);
    console.log("➡️ conversationId:", conversationId);
    console.log("➡️ text:", text);
    const convo = await Conversation.findById(conversationId);
     if (!convo) {
      console.log("⛔ Conversation NOT FOUND");
      return;
    }
 console.log("📄 Conversation found:", {
      clientId: convo.clientId.toString(),
      ownerId: convo.ownerId.toString(),
    });
    const senderId = socket.user.id;
    let receiverId;

    if (senderId === convo.clientId.toString()) {
      receiverId = convo.ownerId.toString();
    } else if (senderId === convo.ownerId.toString()) {
      receiverId = convo.clientId.toString();
    } else {
      console.log("❌ Sender not part of conversation");
      return;
    }
    console.log("🧑 senderId:", senderId);
    console.log("👤 receiverId:", receiverId);

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      message: text,
    });

     console.log("✅ Message saved in DB:", message._id.toString());

    console.log("📡 Emitting to rooms:");
    console.log("➡️ client room:", convo.clientId.toString());
    console.log("➡️ owner room:", convo.ownerId.toString());


    convo.lastMessage = text;
    await convo.save();

     // ✅ SIRF RECEIVER KO SEND , Server → receiver
    io.to(receiverId).emit("receive_message", message);

     console.log("✅ receive_message EMITTED");

  } catch (err) {
    console.error("❌ send_message error:", err.message);
  }
});



     socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("user_typing", { conversationId });
  });

  socket.on("stop_typing", ({ conversationId }) => {
    socket.to(conversationId).emit("user_stop_typing", { conversationId });
  });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });



 


  return io; // 🔴 REQUIRED
};
