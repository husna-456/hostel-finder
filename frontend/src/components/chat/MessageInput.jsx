import { useState, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { RiSendPlaneFill } from "react-icons/ri";

export default function MessageInput({ conversationId, onSend }) {
  const socket        = useSocketContext();
  const currentUserId = getUserId();
  const [text, setText]   = useState("");
  const typingRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket || !e.target.value.trim()) return;
    socket.emit("typing", { conversationId });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 3000);
  };

  const send = () => {
    if (!text.trim() || !socket) return;

    const tempId = `temp_${Date.now()}`;
    onSend({
      _id: tempId,
      message: text,
      senderId: currentUserId,
      conversationId,
      createdAt: new Date(),
      status: "sent",
    });

    clearTimeout(typingRef.current);
    socket.emit("stop_typing", { conversationId });
    socket.emit("send_message", { conversationId, text, tempId });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="sticky bottom-0 w-full px-3 py-3 bg-transparent shrink-0">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-md"
      >
        <textarea
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-[15px] text-[#2A3D39] px-2 resize-none leading-tight max-h-24 overflow-y-auto"
          placeholder="Write your message…"
        />
        {/* Send button — icon-only on mobile */}
        <button
          type="button"
          onClick={send}
          className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shrink-0"
        >
          <RiSendPlaneFill size={16} />
        </button>
      </form>
    </div>
  );
}
