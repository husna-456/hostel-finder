import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { RiSendPlaneFill } from "react-icons/ri";
import { Smile, FileText, Image, Mic, BarChart2, X } from "lucide-react";
import { toast } from "react-toastify";

const EMOJIS = [
  "😀","😂","😍","🥰","😊","😎","🤔","😢","😡","🤗",
  "👍","👎","❤️","🔥","🎉","✅","👏","🙏","💯","⭐",
  "😭","😅","🤣","😇","🤩","😴","🥳","😜","🙄","😬",
  "💪","🤝","✌️","👋","🫡","💡","🎯","⚡","🌹","🍕",
];

const ATTACHMENTS = [
  { label: "Document",        icon: FileText,  color: "text-blue-500",   bg: "bg-blue-50"   },
  { label: "Photos & Videos", icon: Image,     color: "text-green-500",  bg: "bg-green-50"  },
  { label: "Audio",           icon: Mic,       color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Poll",            icon: BarChart2, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function MessageInput({ conversationId, onSend }) {
  const socket        = useSocketContext();
  const currentUserId = getUserId();

  const [text,       setText]       = useState("");
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const typingRef     = useRef(null);
  const emojiWrapRef  = useRef(null); // wraps emoji btn + picker
  const attachWrapRef = useRef(null); // wraps + btn + attach menu

  /* close on outside click */
  useEffect(() => {
    const h = (e) => {
      if (emojiWrapRef.current  && !emojiWrapRef.current.contains(e.target))  setShowEmoji(false);
      if (attachWrapRef.current && !attachWrapRef.current.contains(e.target)) setShowAttach(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket || !e.target.value.trim()) return;
    socket.emit("typing", { conversationId });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => socket.emit("stop_typing", { conversationId }), 3000);
  };

  const send = () => {
    if (!text.trim() || !socket) return;
    const tempId = `temp_${Date.now()}`;
    onSend({ _id: tempId, message: text, senderId: currentUserId, conversationId, createdAt: new Date(), status: "sent" });
    clearTimeout(typingRef.current);
    socket.emit("stop_typing",  { conversationId });
    socket.emit("send_message", { conversationId, text, tempId });
    setText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="w-full px-3 py-3 bg-transparent shrink-0">
      <div className="relative flex items-end gap-2">

        {/* ── + Attachment button + menu ── */}
        <div ref={attachWrapRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => { setShowAttach((p) => !p); setShowEmoji(false); }}
            className="w-10 h-10 flex items-center justify-center bg-[#D9F2ED] hover:bg-[#c8eae3] rounded-full text-[#01AA85] text-xl font-bold transition-colors"
            aria-label="Attach"
          >
            +
          </button>

          {showAttach && (
            <div className="absolute bottom-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-52">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Attach</span>
                <button onClick={() => setShowAttach(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
              </div>
              <div className="space-y-1">
                {ATTACHMENTS.map(({ label, icon: Icon, color, bg }) => (
                  <button
                    key={label}
                    onClick={() => { setShowAttach(false); toast.info(`${label} coming soon!`); }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl ${bg} hover:opacity-90 transition-opacity text-sm font-medium text-gray-700`}
                  >
                    <Icon size={15} className={`${color} shrink-0`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Message form ── */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 flex items-end gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100"
        >
          {/* Emoji button + picker */}
          <div ref={emojiWrapRef} className="relative shrink-0 self-end mb-0.5">
            <button
              type="button"
              onClick={() => { setShowEmoji((p) => !p); setShowAttach(false); }}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
              aria-label="Emoji"
            >
              <Smile size={20} />
            </button>

            {showEmoji && (
              <div className="absolute bottom-9 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-72">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Emoji</span>
                  <button onClick={() => setShowEmoji(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                </div>
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setText((p) => p + e); setShowEmoji(false); }}
                      className="text-xl hover:bg-gray-100 rounded-lg p-1 transition-colors leading-none"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[15px] text-[#2A3D39] resize-none leading-tight max-h-24 overflow-y-auto placeholder-gray-400"
            placeholder="Write your message…"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={send}
            className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shrink-0 self-end"
            aria-label="Send"
          >
            <RiSendPlaneFill size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
