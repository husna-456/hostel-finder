import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import EmojiPicker from "emoji-picker-react";
import { getUserId } from "../../utils/auth";
import clsx from "clsx";
import {
  Check, CheckCheck, FileText, Download, Play, Pause,
  Copy, Reply, Trash2, X, Smile, ChevronDown, Plus,
} from "lucide-react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";

/* ─── helpers ────────────────────────────────────────────── */

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDur(s) {
  if (!s && s !== 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function getDocStyle(name) {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (ext === "pdf")                return { bg: "bg-red-100",    color: "text-red-600",    label: "PDF" };
  if (["doc","docx"].includes(ext)) return { bg: "bg-blue-100",   color: "text-blue-600",   label: ext.toUpperCase() };
  if (["xls","xlsx"].includes(ext)) return { bg: "bg-green-100",  color: "text-green-600",  label: ext.toUpperCase() };
  if (["ppt","pptx"].includes(ext)) return { bg: "bg-orange-100", color: "text-orange-600", label: ext.toUpperCase() };
  return { bg: "bg-gray-100", color: "text-gray-600", label: ext.toUpperCase() || "FILE" };
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/* ─── tick ─────────────────────────────────────────────── */

function Tick({ status, white = false }) {
  const gray = white ? "text-white/80" : "text-gray-400";
  const blue = white ? "text-blue-300" : "text-blue-500";
  if (status === "read")      return <CheckCheck size={12} className={`${blue} shrink-0`} />;
  if (status === "delivered") return <CheckCheck size={12} className={`${gray} shrink-0`} />;
  return <Check size={12} className={`${gray} shrink-0`} />;
}

/* ─── media modal ───────────────────────────────────────── */

function MediaModal({ type, src, onClose }) {
  return createPortal(
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10">
        <X size={22} />
      </button>
      {type === "image" ? (
        <img src={src} alt="full" className="max-w-[95vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
      ) : (
        <video src={src} controls autoPlay className="max-w-[95vw] max-h-[90vh] rounded-xl" onClick={(e) => e.stopPropagation()} />
      )}
    </div>,
    document.body
  );
}

/* ─── voice note player ─────────────────────────────────── */

function VoiceNotePlayer({ message, isSender, otherUser }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total,   setTotal]   = useState(message.duration || 0);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
  };

  const bars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) =>
      4 + Math.abs(Math.sin(i * 2.5 + (message._id?.charCodeAt(0) || 42))) * 16
    ),
    [message._id]
  );

  const avatarUser = useMemo(() => {
    if (isSender) {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
    }
    return otherUser || {};
  }, [isSender, otherUser]);

  const avatarPic = avatarUser?.profilePicture || "";
  const initial   = (avatarUser?.name || "?").charAt(0).toUpperCase();
  const progress  = total > 0 ? current / total : 0;

  return (
    <div className="flex items-center gap-2 min-w-[220px] max-w-[280px]">
      <audio
        ref={audioRef} src={message.fileUrl} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
        onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
        onLoadedMetadata={(e) => setTotal(e.target.duration || message.duration || 0)}
      />
      {avatarPic ? (
        <img src={avatarPic} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initial}
        </div>
      )}
      <button onClick={toggle} className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center shrink-0 transition-colors">
        {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
      </button>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-px h-6">
          {bars.map((h, i) => (
            <div key={i} style={{ height: `${h}px` }}
              className={clsx("w-[3px] rounded-full transition-colors duration-100",
                (i / 30) < progress ? "bg-purple-600" : "bg-gray-300")} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 tabular-nums leading-none">
          {formatDur(current)} / {formatDur(total)}
        </span>
      </div>
    </div>
  );
}

/* ─── poll ──────────────────────────────────────────────── */

function PollMessage({ message }) {
  const currentUserId = getUserId();
  const [localPoll, setLocalPoll] = useState(message.poll);

  const totalVotes   = localPoll?.options?.reduce((s, o) => s + (o.votes?.length || 0), 0) || 0;
  const userVotedIdx = localPoll?.options?.findIndex(
    (o) => o.votes?.some((v) => v?.toString() === currentUserId || v === currentUserId)
  );

  const handleVote = async (idx) => {
    try {
      const result = await fetchClient(`/messages/${message._id}/vote`, {
        method: "POST", body: JSON.stringify({ optionIndex: idx }),
      });
      setLocalPoll(result.poll);
    } catch { toast.error("Vote failed"); }
  };

  useEffect(() => { setLocalPoll(message.poll); }, [message.poll]);

  return (
    <div className="min-w-[200px]">
      <p className="text-[14px] font-semibold text-gray-900 mb-2">{localPoll?.question}</p>
      <div className="space-y-2">
        {localPoll?.options?.map((opt, idx) => {
          const count = opt.votes?.length || 0;
          const pct   = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const voted = idx === userVotedIdx;
          return (
            <button key={idx} onClick={() => handleVote(idx)}
              className={clsx("w-full text-left rounded-xl px-3 py-2 transition-colors border",
                voted ? "bg-purple-100 border-purple-300" : "bg-white/60 border-gray-200 hover:bg-purple-50")}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-gray-800 font-medium">
                  {voted && <span className="mr-1 text-purple-600">✓</span>}
                  {opt.text}
                </span>
                <span className="text-[11px] text-gray-500 ml-2 shrink-0">{count} · {pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
    </div>
  );
}

/* ─── reply preview ─────────────────────────────────────── */

function ReplyPreview({ replyTo }) {
  if (!replyTo) return null;
  const name    = replyTo.senderId?.name || "Unknown";
  const content = replyTo.type === "text" ? replyTo.message : replyTo.fileName || replyTo.type;
  return (
    <div className="border-l-4 border-purple-400 bg-white/40 rounded px-2 py-1 mb-1.5">
      <p className="text-[11px] font-semibold text-purple-600 truncate">{name}</p>
      <p className="text-[12px] text-gray-600 truncate">{content}</p>
    </div>
  );
}

/* ─── image bubble ──────────────────────────────────────── */

function ImageBubble({ message, isSender }) {
  const [loaded, setLoaded] = useState(false);
  const [modal,  setModal]  = useState(false);

  return (
    <>
      {/* Outer container: skeleton aspect until image loads */}
      <div
        className={clsx(
          "relative cursor-pointer overflow-hidden rounded-2xl active:opacity-90",
          !loaded && "aspect-[4/3] bg-gray-200 animate-pulse"
        )}
        onClick={() => setModal(true)}
      >
        <img
          src={message.fileUrl}
          alt={message.fileName || "image"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={clsx(
            "w-full h-auto block object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0 absolute inset-0 w-full h-full"
          )}
          style={{ maxHeight: "340px" }}
        />

        {/* Bottom gradient + timestamp — only after image loads */}
        {loaded && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-end gap-1 px-2.5 pb-1.5 pt-8 bg-gradient-to-t from-black/55 to-transparent pointer-events-none">
            <span className="text-white text-[11px] leading-none drop-shadow-sm tabular-nums">
              {formatTime(message.createdAt)}
            </span>
            {isSender && <Tick status={message.status} white />}
          </div>
        )}
      </div>

      {modal && <MediaModal type="image" src={message.fileUrl} onClose={() => setModal(false)} />}
    </>
  );
}

/* ─── video bubble ──────────────────────────────────────── */

function VideoBubble({ message, isSender }) {
  const [modal, setModal] = useState(false);

  return (
    <>
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl active:opacity-90 group/vid"
        onClick={() => setModal(true)}
      >
        {/* Fixed aspect ratio container */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          <video
            src={message.fileUrl}
            className="w-full h-full object-cover opacity-80"
            preload="metadata"
            muted
            playsInline
          />

          {/* Subtle dark vignette */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Play button — scales on hover */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[52px] h-[52px] rounded-full bg-black/50 border-[2.5px] border-white/90 flex items-center justify-center shadow-xl backdrop-blur-[2px] transition-transform duration-200 group-hover/vid:scale-110 active:scale-90">
              <Play size={20} className="text-white translate-x-[2px]" fill="white" />
            </div>
          </div>

          {/* Bottom gradient — duration left, timestamp right */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-2.5 pb-2 pt-10 bg-gradient-to-t from-black/65 to-transparent pointer-events-none">
            {message.duration ? (
              <span className="text-white text-[11px] leading-none font-medium tabular-nums">
                {formatDur(message.duration)}
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1">
              <span className="text-white text-[11px] leading-none tabular-nums">
                {formatTime(message.createdAt)}
              </span>
              {isSender && <Tick status={message.status} white />}
            </div>
          </div>
        </div>
      </div>

      {modal && <MediaModal type="video" src={message.fileUrl} onClose={() => setModal(false)} />}
    </>
  );
}

/* ─── message content ───────────────────────────────────── */

function MessageContent({ message, isSender, otherUser }) {
  const type = message.type || "text";

  if (message.isDeleted) {
    return <p className="italic text-gray-400 text-[14px]">🚫 This message was deleted</p>;
  }

  if (type === "image") {
    return <ImageBubble message={message} isSender={isSender} />;
  }

  if (type === "video") {
    return <VideoBubble message={message} isSender={isSender} />;
  }

  if (type === "audio") {
    return <VoiceNotePlayer message={message} isSender={isSender} otherUser={otherUser} />;
  }

  if (type === "document") {
    const { bg, color, label } = getDocStyle(message.fileName);
    return (
      <div className="flex items-center gap-3 bg-white/90 rounded-xl p-3 min-w-[220px] max-w-[280px] cursor-pointer hover:bg-white transition-colors"
        onClick={() => window.open(message.fileUrl, "_blank")}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          <FileText size={24} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{message.fileName || "Document"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {message.fileSize ? formatSize(message.fileSize) + " · " : ""}{label}
          </p>
        </div>
        <a href={message.fileUrl} download={message.fileName} onClick={(e) => e.stopPropagation()}
          className="text-purple-600 hover:text-purple-700 shrink-0">
          <Download size={18} />
        </a>
      </div>
    );
  }

  if (type === "poll") {
    return <PollMessage message={message} />;
  }

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] text-gray-900 leading-snug">
      {message.message}
    </p>
  );
}

/* ─── reactions display ──────────────────────────────────── */

function ReactionsDisplay({ reactions, currentUserId, onReact }) {
  if (!reactions?.length) return null;

  const groups = {};
  reactions.forEach((r) => {
    if (!groups[r.emoji]) groups[r.emoji] = [];
    groups[r.emoji].push(r.userId);
  });

  return (
    <div className="flex flex-wrap gap-1 mt-0.5 px-1">
      {Object.entries(groups).map(([emoji, userIds]) => {
        const hasReacted = userIds.some(
          (u) => u?.toString() === currentUserId || u === currentUserId
        );
        return (
          <button key={emoji} onClick={() => onReact(emoji)}
            className={clsx(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 border text-xs transition-colors",
              hasReacted
                ? "bg-purple-100 border-purple-300 text-purple-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}>
            <span className="text-[13px] leading-none">{emoji}</span>
            {userIds.length > 1 && <span className="text-[10px] font-medium ml-0.5">{userIds.length}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── delete modal (portal, mobile-sheet style on small screens) ── */

function DeleteModal({ isSender, onDeleteEveryone, onDeleteForMe, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        <div className="px-6 pt-4 pb-3 text-center">
          <h3 className="font-semibold text-gray-900 text-[15px]">Delete message?</h3>
          {!isSender && (
            <p className="text-xs text-gray-400 mt-1">This will only be removed from your view.</p>
          )}
        </div>
        <div className="border-t border-gray-100" />

        {isSender && (
          <button
            onClick={onDeleteEveryone}
            className="w-full px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete for Everyone
          </button>
        )}

        <button
          onClick={onDeleteForMe}
          className={clsx(
            "w-full px-6 py-4 text-sm font-medium transition-colors",
            isSender
              ? "text-gray-700 hover:bg-gray-50 border-t border-gray-100"
              : "text-red-600 hover:bg-red-50"
          )}
        >
          Delete for Me
        </button>

        <button
          onClick={onClose}
          className="w-full px-6 py-4 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ─── main MessageBubble ────────────────────────────────── */

export default function MessageBubble({
  message, highlight, isCurrentResult, onReply, onSelfDelete, onMarkDeleted, otherUser,
  isSelected, onSelect, onClose,
}) {
  const currentUserId = getUserId();
  const isSender =
    message.senderId?.toString() === currentUserId ||
    message.senderId === currentUserId;

  const [showMenu,        setShowMenu]        = useState(false);
  const [showReactions,   setShowReactions]   = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSheet,       setShowSheet]       = useState(false);
  const [menuAbove,       setMenuAbove]       = useState(false);

  const bubbleRef    = useRef(null);
  const menuRef      = useRef(null);
  const reactRef     = useRef(null);
  const longPressRef = useRef(null);

  useEffect(() => {
    if (!isSelected) {
      setShowMenu(false);
      setShowReactions(false);
      setShowEmojiPicker(false);
      setShowSheet(false);
    }
  }, [isSelected]);

  useEffect(() => {
    if (!showMenu && !showReactions) return;
    const h = (e) => {
      if (showMenu      && menuRef.current  && !menuRef.current.contains(e.target))  setShowMenu(false);
      if (showReactions && reactRef.current && !reactRef.current.contains(e.target)) setShowReactions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showMenu, showReactions]);

  const handleClose = () => {
    setShowMenu(false);
    setShowReactions(false);
    setShowSheet(false);
    setShowEmojiPicker(false);
    onClose?.();
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowReactions(false);
    if (!showMenu && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      setMenuAbove(window.innerHeight - rect.bottom < 250);
    }
    setShowMenu((p) => !p);
    onSelect?.();
  };

  const toggleReactions = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowReactions((p) => !p);
    onSelect?.();
  };

  const onTouchStart = () => {
    longPressRef.current = setTimeout(() => { setShowSheet(true); onSelect?.(); }, 500);
  };
  const onTouchEnd = () => clearTimeout(longPressRef.current);

  const handleReact = async (emoji) => {
    try {
      await fetchClient(`/messages/${message._id}/react`, {
        method: "PATCH", body: JSON.stringify({ emoji }),
      });
    } catch { toast.error("Failed to react"); }
  };

  const handleReply    = () => { onReply(message); handleClose(); };
  const handleCopy     = () => {
    navigator.clipboard.writeText(message.message || "").then(() => toast.success("Copied"));
    handleClose();
  };
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = message.fileUrl;
    a.download = message.fileName || "download";
    a.click();
    handleClose();
  };
  const openDeleteModal = () => { handleClose(); setShowDeleteModal(true); };

  const confirmDeleteEveryone = async () => {
    setShowDeleteModal(false);
    try {
      await fetchClient(`/messages/${message._id}/delete`, {
        method: "PATCH", body: JSON.stringify({ deleteType: "foreveryone" }),
      });
      onMarkDeleted?.(message._id);
    } catch { toast.error("Failed to delete"); }
  };

  const confirmDeleteForMe = async () => {
    setShowDeleteModal(false);
    try {
      await fetchClient(`/messages/${message._id}/delete`, {
        method: "PATCH", body: JSON.stringify({ deleteType: "forme" }),
      });
      onSelfDelete?.(message._id);
    } catch { toast.error("Failed to delete"); }
  };

  const type           = message.type || "text";
  const isMedia        = (type === "image" || type === "video") && !message.isDeleted;
  const hideBottomMeta = isMedia;
  const hasText        = !!message.message && !message.isDeleted;
  const hasMedia       = !!message.fileUrl  && !message.isDeleted;

  const currentUserReaction = message.reactions?.find(
    (r) => r.userId?.toString() === currentUserId || r.userId === currentUserId
  )?.emoji;

  /* ── quick reaction picker ── */
  const reactionPicker = (
    <div className={clsx(
      "absolute bottom-full mb-2 z-50",
      isSender ? "right-0" : "left-0"
    )}>
      <div className="bg-white rounded-full shadow-xl border border-gray-100 px-2.5 py-1.5 flex items-center gap-0.5">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => { e.stopPropagation(); handleReact(emoji); setShowReactions(false); onClose?.(); }}
            className={clsx(
              "text-xl leading-none px-1 py-0.5 rounded-full hover:scale-125 transition-transform",
              currentUserReaction === emoji && "bg-purple-100"
            )}
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(true); setShowReactions(false); onSelect?.(); }}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ml-0.5 shrink-0 transition-colors"
          title="More reactions"
        >
          <Plus size={13} className="text-gray-500" />
        </button>
      </div>
    </div>
  );

  /* ── reaction toggle button ── */
  const reactionBtn = (
    <div ref={reactRef} className="relative shrink-0 self-end mb-1">
      <button
        onClick={toggleReactions}
        aria-label="React"
        className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all",
          "text-gray-400 hover:text-gray-600 hover:bg-white/70",
          showReactions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <Smile size={16} />
      </button>
      {showReactions && reactionPicker}
    </div>
  );

  /* ── inline action menu ── */
  const actionMenu = showMenu && (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "absolute z-50 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-1 menu-popup",
        menuAbove ? "bottom-full mb-1" : "top-7 mt-0.5",
        isSender ? "right-0" : "left-0"
      )}
    >
      <button onClick={handleReply}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <Reply size={14} className="text-gray-400 shrink-0" /> Reply
      </button>
      {hasText && (
        <button onClick={handleCopy}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Copy size={14} className="text-gray-400 shrink-0" /> Copy Message
        </button>
      )}
      {hasMedia && (
        <button onClick={handleDownload}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={14} className="text-gray-400 shrink-0" /> Download
        </button>
      )}
      <div className="border-t border-gray-100 my-1" />
      <button onClick={openDeleteModal}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={14} className="shrink-0" />
        {isSender ? "Delete" : "Delete for Me"}
      </button>
    </div>
  );

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          isSender={isSender}
          onDeleteEveryone={confirmDeleteEveryone}
          onDeleteForMe={confirmDeleteForMe}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {showEmojiPicker && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center bg-black/40"
          onClick={() => setShowEmojiPicker(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(e) => { handleReact(e.emoji); setShowEmojiPicker(false); handleClose(); }}
              height={380} width={300}
            />
          </div>
        </div>,
        document.body
      )}

      {isSelected && showSheet && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end bg-black/40" onClick={handleClose}>
          <div
            className="bg-white w-full rounded-t-2xl shadow-2xl pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />

            <div className="flex justify-center px-4 pb-3">
              <div className="bg-white rounded-full shadow-lg border border-gray-100 px-2.5 py-1.5 flex items-center gap-0.5">
                {QUICK_EMOJIS.map((e) => (
                  <button key={e}
                    onClick={() => { handleReact(e); handleClose(); }}
                    className={clsx(
                      "text-xl leading-none px-1 py-0.5 rounded-full hover:scale-125 transition-transform",
                      currentUserReaction === e && "bg-purple-100"
                    )}
                  >{e}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <button onClick={handleReply}
              className="flex items-center gap-3 w-full px-6 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
              <Reply size={16} className="text-gray-400 shrink-0" /> Reply
            </button>
            {hasText && (
              <button onClick={handleCopy}
                className="flex items-center gap-3 w-full px-6 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
                <Copy size={16} className="text-gray-400 shrink-0" /> Copy Message
              </button>
            )}
            {hasMedia && (
              <button onClick={handleDownload}
                className="flex items-center gap-3 w-full px-6 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
                <Download size={16} className="text-gray-400 shrink-0" /> Download
              </button>
            )}
            <div className="border-t border-gray-100 my-1" />
            <button onClick={openDeleteModal}
              className="flex items-center gap-3 w-full px-6 py-3.5 text-sm text-red-600 hover:bg-red-50">
              <Trash2 size={16} className="shrink-0" />
              {isSender ? "Delete" : "Delete for Me"}
            </button>
            <button onClick={handleClose}
              className="flex items-center gap-3 w-full px-6 py-3.5 text-sm text-gray-400 hover:bg-gray-50">
              <X size={16} className="shrink-0" /> Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Bubble row ── */}
      <div className="flex flex-col group">
        <div className={clsx("flex items-end gap-1", isSender ? "justify-end" : "justify-start")}>

          {!isSender && reactionBtn}

          {/* Bubble + inline menu wrapper — wider for media on mobile */}
          <div className={clsx(
            "relative",
            isMedia ? "max-w-[82%] sm:max-w-[65%] md:max-w-[55%]" : "max-w-[75%]"
          )}>

            {/* The visual bubble */}
            <div
              ref={bubbleRef}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
              className={clsx(
                "relative w-fit rounded-2xl shadow-sm overflow-hidden transition-all duration-150",
                isMedia ? "p-0" : "px-3 py-1.5",
                isSender ? "bg-[#d9fdd3] rounded-tr-sm" : "bg-white rounded-tl-sm",
                highlight    && !isCurrentResult && "ring-2 ring-yellow-300",
                isCurrentResult                  && "ring-2 ring-yellow-500",
                isSelected                       && "ring-2 ring-purple-200",
              )}
            >
              {/* ▾ Arrow button — desktop hover only */}
              <button
                onClick={toggleMenu}
                aria-label="Message options"
                className={clsx(
                  "hidden md:flex absolute top-1 right-1 w-5 h-5 rounded-full z-10",
                  "items-center justify-center transition-opacity",
                  isMedia
                    ? "bg-black/25 hover:bg-black/40"
                    : isSender
                      ? "bg-[#c5f2c2]/80 hover:bg-[#aeecab]"
                      : "bg-gray-200/70 hover:bg-gray-300/80",
                  showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <ChevronDown size={12} className={isMedia ? "text-white" : "text-gray-600"} />
              </button>

              {/* Reply-to preview — inside bubble, padded if media */}
              {message.replyTo && (
                <div className={clsx(isMedia ? "px-3 pt-2" : "")}>
                  <ReplyPreview replyTo={message.replyTo} />
                </div>
              )}

              <MessageContent message={message} isSender={isSender} otherUser={otherUser} />

              {/* Bottom meta row — only for non-media types */}
              {!hideBottomMeta && (
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[11px] text-gray-500 leading-none select-none">
                    {formatTime(message.createdAt)}
                  </span>
                  {isSender && <Tick status={message.status} />}
                </div>
              )}
            </div>

            {actionMenu}
          </div>

          {isSender && reactionBtn}
        </div>

        {/* Reactions row below bubble */}
        <div className={clsx("flex", isSender ? "justify-end pr-8" : "justify-start pl-8")}>
          <ReactionsDisplay
            reactions={message.reactions}
            currentUserId={currentUserId}
            onReact={handleReact}
          />
        </div>
      </div>
    </>
  );
}
