// src/components/chat/ChatWindow.jsx
import { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useSocketContext } from "../../context/SocketContext";
import { getMessages } from "../../api/message.api";
import { getUserId, getUserRole } from "../../utils/auth";
import { createConversation } from "../../api/conversation.api";

export default function ChatWindow({ conversation }) {
  const socket = useSocketContext();
  const currentUserId = getUserId();
  const role = getUserRole();

  const otherUser =
    role === "hostel_owner"
      ? conversation.clientId || {}
      : conversation.ownerId || {};

  const [messages, setMessages] = useState([]); // ✅ LOCAL STATE
  const [isTyping, setIsTyping] = useState(false);

  /* LOAD MESSAGES */
  useEffect(() => {
    if (!conversation?._id) return;
    getMessages(conversation._id).then(setMessages);
  }, [conversation?._id]);

  /* ================= JOIN CONVERSATION ================= */
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    socket.emit("join_conversation", conversation._id);

    return () => {
      socket.emit("leave_conversation", conversation._id);
    };
  }, [socket, conversation?._id]);


  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    if (!socket || conversation.isTemporary) {
      console.log("⛔ OWNER SOCKET NULL");
      return;
    }
    const handleNewMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setIsTyping(false);
      }
    };


    socket.on("receive_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, conversation._id]);

 const handleSend = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };


  return (
    <section
      className="flex flex-col justify-start h-screen w-full"
      style={{
        backgroundImage: "url('/chat-bg.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "300px",
      }}
    >
      {/* ================= HEADER ================= */}
      <header className="w-full h-16 px-4 bg-white border-b border-gray-300 flex items-center gap-3">
        <img
          src={otherUser?.avatar || "/avatar.png"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <p className="font-medium text-gray-900 text-[17px]">
            {otherUser?.name}
          </p>
          <p className="text-base text-gray-500">
            online
          </p>
        </div>
      </header>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto px-4 py-3 h-[4000px]">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id || Math.random()}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No messages yet
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="px-4 py-2 rounded-2xl text-sm text-gray-500">
              Typing...
            </div>
          </div>
        )}
      </div>


      {/* ================= INPUT ================= */}
      <MessageInput
        conversationId={conversation?._id}
        receiverId={
          currentUserId === conversation?.clientId
            ? conversation?.ownerId
            : conversation?.clientId
        }
        onSend={handleSend}
      />
    </section>
  );
}