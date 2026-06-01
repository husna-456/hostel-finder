import { useState, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { RiSendPlaneFill } from "react-icons/ri";

export default function MessageInput({ conversationId, onSend }) {
  const socket = useSocketContext();

  const currentUserId = getUserId(); // 🔥 REAL ID
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    if (!socket || !e.target.value.trim()) return;

    socket.emit("typing", { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 3000);
  };


  const send = () => {
    if (!text.trim()) return;

    console.log("SEND MESSAGE:", {
      text,
      senderId: currentUserId,
      conversationId,
    });

    if (!socket) {
      console.warn("⛔ Socket not ready yet");
      return;
    }



    // ✅ INSTANT UI UPDATE (WhatsApp style)
    onSend({
      _id: Date.now(), // temp key
      message: text,
      senderId: currentUserId,
      conversationId,
      createdAt: new Date(),
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stop_typing", { conversationId });

    socket.emit("send_message", {
      conversationId,
      text,
    });
    setText(""); // 🔥 important
  };


  return (
    <div className="sticky bottom-0 w-full px-4 py-3 bg-transparent">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow-md"
      >
        <button className="w-10 h-10 flex items-center justify-center 
                 bg-[#D9f2ed] rounded-full 
                 hover:bg-[#c8eae3] text-xl font-bold">+</button>
        <input
          type="text"              // ✅ FIXED
          value={text}             // ✅ CONTROLLED
          onChange={handleChange}
          className="flex-1 bg-transparent outline-none 
                 text-[16px] text-[#2A3D39] 
                 px-2"
          placeholder="Write your message..."
        />
        <button
          type="button"
          onClick={send}
          className="w-10 h-10 flex items-center justify-center
                 bg-[#D9f2ed] rounded-full 
                 hover:bg-[#c8eae3] text-lg"
        >
          <RiSendPlaneFill />
        </button>
      </form>
    </div>
  );
}