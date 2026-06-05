import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { RiSendPlaneFill } from "react-icons/ri";
import { Plus, Smile, FileText, Image, Mic, BarChart2, X } from "lucide-react";
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
  const emojiWrapRef  = useRef(null);
  const attachWrapRef = useRef(null);

  /* close popups on outside click */
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
    typingRef.current = setTimeout(
      () => socket.emit("stop_typing", { conversationId }),
      3000
    );
  };

  const send = () => {
    if (!text.trim() || !socket) return;
    const tempId = `temp_${Date.now()}`;
    onSend({
      _id: tempId, message: text, senderId: currentUserId,
      conversationId, createdAt: new Date(), status: "sent",
    });
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
    /*
     * pt-2 only — no bottom padding so the bar sits flush at the viewport
     * bottom with zero white strip below the input.
     */
    <div className="w-full px-4 py-3 bg-white border-t border-gray-100 shrink-0">
      <div className="flex items-center gap-2">

        {/*
         * PILL — holds + icon, emoji icon, and textarea all inside one
         * rounded container (WhatsApp style). The pill is flex-1 so it
         * grows to fill all space between the left edge and the send button.
         */}
        <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-full px-3 py-2 border border-gray-200">

          {/* ── + Attachment (inside pill) ── */}
          <div ref={attachWrapRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => { setShowAttach((p) => !p); setShowEmoji(false); }}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors p-0.5"
              aria-label="Attach"
            >
              <Plus size={20} />
            </button>

            {showAttach && (
              <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-52">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Attach</span>
                  <button onClick={() => setShowAttach(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
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

          {/* ── Emoji (inside pill) ── */}
          <div ref={emojiWrapRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => { setShowEmoji((p) => !p); setShowAttach(false); }}
              className="flex items-center justify-center text-gray-600 hover:text-yellow-500 transition-colors p-0.5"
              aria-label="Emoji"
            >
              <Smile size={20} />
            </button>

            {showEmoji && (
              <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-72">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Emoji</span>
                  <button onClick={() => setShowEmoji(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
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

          {/* ── Textarea (inside pill, fills remaining width) ── */}
          <textarea
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-gray-900
                       resize-none leading-tight max-h-24 overflow-y-auto placeholder-gray-400"
            placeholder="Write your message…"
          />
        </div>

        {/* ── Send button (outside pill, purple circle) ── */}
        <button
          type="button"
          onClick={send}
          className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700
                     text-white rounded-full transition-colors shrink-0"
          aria-label="Send"
        >
          <RiSendPlaneFill size={15} />
        </button>

      </div>
    </div>
  );
}
