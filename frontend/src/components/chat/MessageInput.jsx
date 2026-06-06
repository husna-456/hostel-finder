import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { RiSendPlaneFill } from "react-icons/ri";
import { Plus, Smile, FileText, Image, Mic, BarChart2, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabaseClient";

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

function PollModal({ onClose, onSubmit }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => {
    if (options.length < 4) setOptions((p) => [...p, ""]);
  };

  const removeOption = (idx) => {
    setOptions((p) => p.filter((_, i) => i !== idx));
  };

  const setOption = (idx, val) => {
    setOptions((p) => p.map((o, i) => (i === idx ? val : o)));
  };

  const handleSubmit = () => {
    if (!question.trim()) { toast.error("Question is required"); return; }
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2) { toast.error("At least 2 options are required"); return; }
    onSubmit(question.trim(), filled.map((o) => o.trim()));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-base">Create Poll</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Options</label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 4 && (
            <button
              onClick={addOption}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              + Add option
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MessageInput({ conversationId, onSend }) {
  const socket        = useSocketContext();
  const currentUserId = getUserId();

  const [text,          setText]          = useState("");
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [showAttach,    setShowAttach]    = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  const typingRef     = useRef(null);
  const emojiWrapRef  = useRef(null);
  const attachWrapRef = useRef(null);
  const docInputRef   = useRef(null);
  const mediaInputRef = useRef(null);
  const audioInputRef = useRef(null);

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

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop();
    const path = `chat-media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('hostel-images').upload(path, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('hostel-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const sendFileMessage = async (file, type) => {
    const tempId = `temp_${Date.now()}`;
    setUploading(true);
    try {
      const fileUrl = await uploadFile(file);
      const msgType = file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('image/') ? 'image'
        : type;

      onSend({
        _id: tempId, message: file.name, type: msgType,
        fileUrl, fileName: file.name, fileSize: file.size,
        senderId: currentUserId, conversationId,
        createdAt: new Date(), status: 'sent',
      });
      clearTimeout(typingRef.current);
      socket.emit('stop_typing', { conversationId });
      socket.emit('send_message', {
        conversationId, text: file.name, tempId,
        type: msgType, fileUrl, fileName: file.name, fileSize: file.size,
      });
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const sendPollMessage = (question, options) => {
    const tempId = `temp_${Date.now()}`;
    const poll = { question, options: options.map(text => ({ text, votes: [] })) };
    onSend({
      _id: tempId, message: question, type: 'poll', poll,
      senderId: currentUserId, conversationId,
      createdAt: new Date(), status: 'sent',
    });
    socket.emit('send_message', { conversationId, text: question, type: 'poll', poll, tempId });
    setShowPollModal(false);
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) sendFileMessage(file, 'document');
    e.target.value = '';
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) sendFileMessage(file, 'image');
    e.target.value = '';
  };

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) sendFileMessage(file, 'audio');
    e.target.value = '';
  };

  const handleAttachClick = (label) => {
    if (label === "Document") {
      docInputRef.current?.click();
      setShowAttach(false);
    } else if (label === "Photos & Videos") {
      mediaInputRef.current?.click();
      setShowAttach(false);
    } else if (label === "Audio") {
      audioInputRef.current?.click();
      setShowAttach(false);
    } else if (label === "Poll") {
      setShowPollModal(true);
      setShowAttach(false);
    }
  };

  return (
    <div className="w-full px-4 py-3 bg-white border-t border-gray-100 shrink-0">
      <input ref={docInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx" onChange={handleDocChange} />
      <input ref={mediaInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaChange} />
      <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioChange} />

      {showPollModal && (
        <PollModal
          onClose={() => setShowPollModal(false)}
          onSubmit={sendPollMessage}
        />
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-full px-3 py-2 border border-gray-200">

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
                      onClick={() => handleAttachClick(label)}
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

          <textarea
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={uploading}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-gray-900
                       resize-none leading-tight max-h-24 overflow-y-auto placeholder-gray-400 disabled:opacity-60"
            placeholder={uploading ? "Uploading…" : "Write your message…"}
          />

          {uploading && (
            <Loader2 size={18} className="text-purple-500 animate-spin shrink-0" />
          )}
        </div>

        <button
          type="button"
          onClick={send}
          disabled={uploading}
          className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700
                     text-white rounded-full transition-colors shrink-0 disabled:opacity-60"
          aria-label="Send"
        >
          <RiSendPlaneFill size={15} />
        </button>
      </div>
    </div>
  );
}
