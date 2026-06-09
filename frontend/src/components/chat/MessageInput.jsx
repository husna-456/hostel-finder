import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { getUserId } from "../../utils/auth";
import { uploadFile } from "../../utils/uploadToSupabase";
import { RiSendPlaneFill } from "react-icons/ri";
import {
  Plus, Smile, FileText, Image, Mic, BarChart2, Music,
  X, Loader2, Reply,
} from "lucide-react";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";
import clsx from "clsx";

const ATTACHMENTS = [
  { label: "Document",        icon: FileText,  iconColor: "text-blue-600",   circleBg: "bg-blue-100"   },
  { label: "Photos & Videos", icon: Image,     iconColor: "text-green-600",  circleBg: "bg-green-100"  },
  { label: "Audio",           icon: Music,     iconColor: "text-orange-600", circleBg: "bg-orange-100" },
  { label: "Poll",            icon: BarChart2, iconColor: "text-purple-600", circleBg: "bg-purple-100" },
];

function PollModal({ onClose, onSubmit }) {
  const [question, setQuestion] = useState("");
  const [options,  setOptions]  = useState(["", ""]);

  const addOption    = () => { if (options.length < 4) setOptions((p) => [...p, ""]); };
  const removeOption = (i) => setOptions((p) => p.filter((_, j) => j !== i));
  const setOption    = (i, v) => setOptions((p) => p.map((o, j) => (j === i ? v : o)));

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Question</label>
          <input
            type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
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
                  type="text" value={opt} onChange={(e) => setOption(idx, e.target.value)}
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
            <button onClick={addOption} className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium">
              + Add option
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRecDur(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function MessageInput({ conversationId, onSend, replyTo, clearReply }) {
  const socket        = useSocketContext();
  const currentUserId = getUserId();

  const [text,           setText]           = useState("");
  const [showEmoji,      setShowEmoji]      = useState(false);
  const [showAttach,     setShowAttach]     = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [showPollModal,  setShowPollModal]  = useState(false);
  const [isRecording,    setIsRecording]    = useState(false);
  const [recDuration,    setRecDuration]    = useState(0);

  const textareaRef      = useRef(null);
  const typingRef        = useRef(null);
  const emojiWrapRef     = useRef(null);
  const attachWrapRef    = useRef(null);
  const docInputRef      = useRef(null);
  const mediaInputRef    = useRef(null);
  const audioInputRef    = useRef(null);
  const mediaRecRef      = useRef(null);
  const audioChunksRef   = useRef([]);
  const recTimerRef      = useRef(null);
  const streamRef        = useRef(null);
  const cancelledRef     = useRef(false);

  // Close emoji/attach on outside click
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
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 96) + "px"; }
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
      _id: tempId,
      message: text,
      senderId: currentUserId,
      conversationId,
      createdAt: new Date(),
      status: "sent",
      replyTo: replyTo || null,
    });
    clearTimeout(typingRef.current);
    socket.emit("stop_typing",  { conversationId });
    socket.emit("send_message", {
      conversationId,
      text,
      tempId,
      replyTo: replyTo?._id || null,
    });
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
    clearReply?.();
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── file upload helper ── */
  const uploadFileToSupabase = async (file) => {
    const ext  = file.name.split(".").pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    return uploadFile(file, "chat-media", name);
  };

  /* ── send a file message ── */
  const sendFileMessage = async (file, defaultType) => {
    const tempId = `temp_${Date.now()}`;
    setUploading(true);
    try {
      const fileUrl = await uploadFileToSupabase(file);
      const msgType = file.type.startsWith("video/") ? "video"
        : file.type.startsWith("image/") ? "image"
        : defaultType;

      onSend({
        _id: tempId, message: file.name, type: msgType,
        fileUrl, fileName: file.name, fileSize: file.size,
        senderId: currentUserId, conversationId,
        createdAt: new Date(), status: "sent",
        replyTo: replyTo || null,
      });
      clearTimeout(typingRef.current);
      socket.emit("stop_typing", { conversationId });
      socket.emit("send_message", {
        conversationId, text: file.name, tempId,
        type: msgType, fileUrl, fileName: file.name, fileSize: file.size,
        replyTo: replyTo?._id || null,
      });
      clearReply?.();
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ── poll ── */
  const sendPollMessage = (question, options) => {
    const tempId = `temp_${Date.now()}`;
    const poll   = { question, options: options.map((t) => ({ text: t, votes: [] })) };
    onSend({
      _id: tempId, message: question, type: "poll", poll,
      senderId: currentUserId, conversationId,
      createdAt: new Date(), status: "sent",
    });
    socket.emit("send_message", { conversationId, text: question, type: "poll", poll, tempId });
    setShowPollModal(false);
  };

  /* ── voice note recording ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      cancelledRef.current = false;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelledRef.current) return;

        const blob     = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const duration = recDuration;
        const label    = `Voice note (${formatRecDur(duration)})`;

        setUploading(true);
        try {
          const url    = await uploadFile(blob, "voice-notes", `voice_${Date.now()}.webm`);
          const tempId = `temp_${Date.now()}`;
          onSend({
            _id: tempId, message: label, type: "audio",
            fileUrl: url, duration,
            senderId: currentUserId, conversationId,
            createdAt: new Date(), status: "sent",
          });
          socket.emit("send_message", {
            conversationId, text: label, type: "audio",
            fileUrl: url, duration, tempId,
          });
        } catch (err) {
          toast.error("Failed to send voice note: " + err.message);
        } finally {
          setUploading(false);
        }
      };

      recorder.start();
      mediaRecRef.current = recorder;
      setIsRecording(true);
      setRecDuration(0);
      recTimerRef.current = setInterval(() => setRecDuration((d) => d + 1), 1000);
    } catch {
      toast.error("Microphone access required for voice notes");
    }
  };

  const stopRecording = (cancel = false) => {
    cancelledRef.current = cancel;
    clearInterval(recTimerRef.current);
    mediaRecRef.current?.stop();
    setIsRecording(false);
    setRecDuration(0);
  };

  /* ── file input handlers ── */
  const handleDocChange   = (e) => { const f = e.target.files?.[0]; if (f) sendFileMessage(f, "document"); e.target.value = ""; };
  const handleMediaChange = (e) => { const f = e.target.files?.[0]; if (f) sendFileMessage(f, "image");    e.target.value = ""; };
  const handleAudioChange = (e) => { const f = e.target.files?.[0]; if (f) sendFileMessage(f, "audio");    e.target.value = ""; };

  const handleAttachClick = (label) => {
    if (label === "Document")        { docInputRef.current?.click();   setShowAttach(false); }
    else if (label === "Photos & Videos") { mediaInputRef.current?.click(); setShowAttach(false); }
    else if (label === "Audio")      { audioInputRef.current?.click(); setShowAttach(false); }
    else if (label === "Poll")       { setShowPollModal(true);         setShowAttach(false); }
  };

  /* ── recording UI ── */
  if (isRecording) {
    return (
      <div className="w-full px-4 py-3 shrink-0"
           style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)" }}>
        <div className="flex items-center gap-3 bg-red-50 rounded-full px-4 py-2 border border-red-200">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="flex-1 text-sm font-medium text-red-600 tabular-nums">
            {formatRecDur(recDuration)}
          </span>
          <button
            onClick={() => stopRecording(true)}
            className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
            aria-label="Cancel recording"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => stopRecording(false)}
            className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
            aria-label="Send voice note"
          >
            <RiSendPlaneFill size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-3 shrink-0"
         style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)" }}>
      {/* Hidden file inputs */}
      <input ref={docInputRef}   type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx" onChange={handleDocChange} />
      <input ref={mediaInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaChange} />
      <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioChange} />

      {/* Modals */}
      {showPollModal && (
        <PollModal onClose={() => setShowPollModal(false)} onSubmit={sendPollMessage} />
      )}

      {/* Reply preview bar */}
      {replyTo && (
        <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-purple-500 px-3 py-2 rounded mb-2">
          <Reply size={14} className="text-purple-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-purple-600 truncate">
              Replying to {replyTo.senderId?.name || replyTo.senderName || "message"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {replyTo.type === "text" ? replyTo.message : replyTo.fileName || replyTo.type}
            </p>
          </div>
          <button onClick={clearReply} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-end">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-full border border-gray-300 shadow-sm px-4 py-0 min-h-[54px]">

          {/* Attach menu */}
          <div ref={attachWrapRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => { setShowAttach((p) => !p); setShowEmoji(false); }}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors p-0.5 cursor-pointer"
              aria-label="Attach"
            >
              <Plus size={20} />
            </button>

            {showAttach && (
              <div className="absolute bottom-full mb-3 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[210px]">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-1 pb-2">
                  Attach
                </p>
                <div className="flex flex-col">
                  {ATTACHMENTS.map(({ label, icon: Icon, iconColor, circleBg }) => (
                    <button
                      key={label}
                      onClick={() => handleAttachClick(label)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-gray-700 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circleBg} shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className={iconColor} />
                      </div>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emoji picker */}
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
              <div
                className={clsx(
                  "z-50",
                  // Mobile: fixed above keyboard; Desktop: absolute
                  "fixed bottom-20 left-2 right-2",
                  "md:absolute md:bottom-full md:mb-2 md:left-0 md:right-auto"
                )}
              >
                <EmojiPicker
                  onEmojiClick={(d) => setText((p) => p + d.emoji)}
                  width="100%"
                  height={380}
                  searchPlaceholder="Search emoji…"
                  lazyLoadEmojis
                  style={{ maxWidth: "100%", borderRadius: "16px" }}
                />
              </div>
            )}
          </div>

          {/* Text area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={uploading}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-gray-900
                       resize-none leading-tight overflow-hidden placeholder-gray-400 disabled:opacity-60"
            placeholder={uploading ? "Uploading…" : "Write your message…"}
          />

          {uploading && <Loader2 size={18} className="text-purple-500 animate-spin shrink-0" />}

          {/* Mic button */}
          <button
            type="button"
            onClick={startRecording}
            disabled={uploading}
            className="flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors p-0.5 shrink-0 disabled:opacity-40"
            aria-label="Record voice note"
          >
            <Mic size={20} />
          </button>

          {/* Send button — inside pill on all screen sizes */}
          <button
            type="button"
            onClick={send}
            disabled={uploading || !text.trim()}
            className="flex items-center justify-center w-9 h-9 bg-purple-600 hover:bg-purple-700
                       text-white rounded-full transition-colors shrink-0 disabled:opacity-60"
            aria-label="Send"
          >
            <RiSendPlaneFill size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
