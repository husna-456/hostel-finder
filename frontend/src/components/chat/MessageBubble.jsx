import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import EmojiPicker from "emoji-picker-react";
import { getUserId } from "../../utils/auth";
import clsx from "clsx";
import {
  Check, CheckCheck, FileText, Download, Play, Pause,
  Copy, Reply, Trash2, X, ChevronDown, Plus,
} from "lucide-react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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

/* ─── popup position calculator ─────────────────────────── */

function calcPopupPos(rect, isSender) {
  const PW = 224;  // w-56
  const PH = 340;  // approx (emoji bar ~52px + gap + menu ~280px)

  let left;
  if (isSender) {
    // Open to the LEFT of the bubble
    left = rect.left - PW - 8;
    if (left < 8) left = 8;
  } else {
    // Open to the RIGHT of the bubble
    left = rect.right + 8;
    if (left + PW > window.innerWidth - 8) left = window.innerWidth - PW - 8;
  }

  let top = rect.top;
  if (top + PH > window.innerHeight - 8) top = window.innerHeight - PH - 8;
  top = Math.max(8, top);

  return { top, left };
}

/* ─── quick emoji constants ──────────────────────────────── */

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

/* ─── message content ───────────────────────────────────── */

function MessageContent({ message, isSender, otherUser }) {
  const [modal, setModal] = useState(null);
  const type = message.type || "text";

  if (message.isDeleted) {
    return <p className="italic text-gray-400 text-[14px]">🚫 This message was deleted</p>;
  }

  if (type === "image") {
    return (
      <>
        <div className="relative cursor-pointer max-w-[280px] rounded-xl overflow-hidden" onClick={() => setModal("image")}>
          <img src={message.fileUrl} alt={message.fileName || "image"} className="w-full h-auto object-cover" loading="lazy" />
          <div className="absolute bottom-0 right-0 px-2 py-1 bg-black/40 rounded-tl-xl flex items-center gap-1">
            <span className="text-white text-[11px] leading-none">{formatTime(message.createdAt)}</span>
            {isSender && <Tick status={message.status} white />}
          </div>
        </div>
        {modal && <MediaModal type="image" src={message.fileUrl} onClose={() => setModal(null)} />}
      </>
    );
  }

  if (type === "video") {
    return (
      <>
        <div className="relative cursor-pointer max-w-[280px] rounded-xl overflow-hidden" onClick={() => setModal("video")}>
          <video src={message.fileUrl} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
              <Play size={24} className="text-gray-800 ml-1" />
            </div>
          </div>
          {message.duration && (
            <div className="absolute bottom-2 left-2 bg-black/50 rounded px-1.5 py-0.5">
              <span className="text-white text-[11px] tabular-nums">{formatDur(message.duration)}</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <span className="text-white text-[11px] leading-none">{formatTime(message.createdAt)}</span>
            {isSender && <Tick status={message.status} white />}
          </div>
        </div>
        {modal && <MediaModal type="video" src={message.fileUrl} onClose={() => setModal(null)} />}
      </>
    );
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

/* ─── reactions display (always shown below bubble) ──────── */

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

/* ─── action menu items (used in both popup + sheet) ─────── */

function ActionMenuItems({ message, isSender, onReply, onSelfDelete, onMarkDeleted, onMobileDelete, onClose }) {
  const hasMedia = !!message.fileUrl && !message.isDeleted;
  const hasText  = !!message.message && !message.isDeleted;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message || "").then(() => toast.success("Copied"));
    onClose();
  };

  const handleReply = () => { onReply(message); onClose(); };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = message.fileUrl;
    a.download = message.fileName || "download";
    a.click();
    onClose();
  };

  const handleDelete = async () => {
    if (window.innerWidth < 768) {
      onMobileDelete?.();
      return;
    }
    onClose();
    if (isSender) {
      const result = await Swal.fire({
        title: "Delete message?",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Delete for everyone",
        denyButtonText: "Delete for me",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        denyButtonColor: "#7c3aed",
        cancelButtonColor: "#6b7280",
      });
      if (result.isConfirmed) {
        try {
          await fetchClient(`/messages/${message._id}/delete`, {
            method: "PATCH", body: JSON.stringify({ deleteType: "foreveryone" }),
          });
          onMarkDeleted?.(message._id);
        } catch { toast.error("Failed to delete"); }
      } else if (result.isDenied) {
        try {
          await fetchClient(`/messages/${message._id}/delete`, {
            method: "PATCH", body: JSON.stringify({ deleteType: "forme" }),
          });
          onSelfDelete?.(message._id);
        } catch { toast.error("Failed to delete"); }
      }
    } else {
      const result = await Swal.fire({
        title: "Delete for me?",
        text: "This message will only be removed from your view.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete for me",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#6b7280",
      });
      if (result.isConfirmed) {
        try {
          await fetchClient(`/messages/${message._id}/delete`, {
            method: "PATCH", body: JSON.stringify({ deleteType: "forme" }),
          });
          onSelfDelete?.(message._id);
        } catch { toast.error("Failed to delete"); }
      }
    }
  };

  const items = [
    { icon: Reply,    label: "Reply",                                onClick: handleReply,    show: true },
    { icon: Copy,     label: "Copy text",                            onClick: handleCopy,     show: hasText },
    { icon: Download, label: "Download",                             onClick: handleDownload, show: hasMedia },
    { icon: Trash2,   label: isSender ? "Delete" : "Delete for me", onClick: handleDelete,   show: true, danger: true },
    { icon: X,        label: "Cancel",                               onClick: onClose,        show: true, cancel: true },
  ].filter((i) => i.show);

  return (
    <>
      {items.map((item) => (
        <div key={item.label}>
          {item.cancel && <div className="border-t border-gray-100 my-1" />}
          <button
            onClick={item.onClick}
            className={clsx(
              "flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors",
              item.danger  ? "text-red-600 hover:bg-red-50" :
              item.cancel  ? "text-gray-400 hover:bg-gray-50" :
                             "text-gray-700 hover:bg-gray-50"
            )}
          >
            <item.icon size={15} className="shrink-0" />
            {item.label}
          </button>
        </div>
      ))}
    </>
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

  const [openStyle,      setOpenStyle]      = useState(null); // "popup" | "sheet"
  const [popupPos,       setPopupPos]       = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bubbleRef    = useRef(null);
  const longPressRef = useRef(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const deleteMobileForMe = async () => {
    setShowDeleteSheet(false);
    try {
      await fetchClient(`/messages/${message._id}/delete`, {
        method: "PATCH", body: JSON.stringify({ deleteType: "forme" }),
      });
      onSelfDelete?.(message._id);
    } catch { toast.error("Failed to delete"); }
  };

  const deleteMobileForEveryone = async () => {
    setShowDeleteSheet(false);
    try {
      await fetchClient(`/messages/${message._id}/delete`, {
        method: "PATCH", body: JSON.stringify({ deleteType: "foreveryone" }),
      });
      onMarkDeleted?.(message._id);
    } catch { toast.error("Failed to delete"); }
  };

  // When parent deselects this message, reset local open state
  useEffect(() => {
    if (!isSelected) {
      setOpenStyle(null);
      setPopupPos(null);
      setShowEmojiPicker(false);
    }
  }, [isSelected]);

  // Desktop: ChevronDown click
  const triggerPopup = (e) => {
    e.stopPropagation();
    if (!bubbleRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    setOpenStyle("popup");
    setPopupPos(calcPopupPos(rect, isSender));
    onSelect?.();
  };

  // Mobile: long press
  const onTouchStart = () => {
    longPressRef.current = setTimeout(() => {
      setOpenStyle("sheet");
      onSelect?.();
    }, 500);
  };
  const onTouchEnd = () => clearTimeout(longPressRef.current);

  const handleClose = () => {
    setShowEmojiPicker(false);
    onClose?.();
  };

  const handleReact = async (emoji) => {
    try {
      await fetchClient(`/messages/${message._id}/react`, {
        method: "PATCH", body: JSON.stringify({ emoji }),
      });
    } catch { toast.error("Failed to react"); }
  };

  const currentUserReaction = message.reactions?.find(
    (r) => r.userId?.toString() === currentUserId || r.userId === currentUserId
  )?.emoji;

  const type = message.type || "text";
  const hideBottomMeta = !message.isDeleted && (type === "image" || type === "video");

  /* ── emoji bar (shared between popup + sheet) ── */
  const emojiBar = (
    <div className="bg-white shadow-lg rounded-full px-3 py-2 flex items-center gap-0.5">
      {QUICK_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => { handleReact(e); handleClose(); }}
          className={clsx(
            "text-xl leading-none px-1 py-0.5 rounded-full hover:scale-125 transition-transform cursor-pointer",
            currentUserReaction === e && "bg-purple-100"
          )}
        >
          {e}
        </button>
      ))}
      <button
        onClick={() => setShowEmojiPicker(true)}
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ml-0.5 transition-colors shrink-0"
        title="More reactions"
      >
        <Plus size={13} className="text-gray-500" />
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop positioned popup (emoji bar + action menu) ── */}
      {isSelected && openStyle === "popup" && popupPos && createPortal(
        <div
          className="fixed z-[9990] flex flex-col gap-1.5"
          style={{ top: popupPos.top, left: popupPos.left, width: "224px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {emojiBar}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <ActionMenuItems
              message={message} isSender={isSender}
              onReply={onReply} onSelfDelete={onSelfDelete}
              onMarkDeleted={onMarkDeleted}
              onMobileDelete={() => { setShowDeleteSheet(true); handleClose(); }}
              onClose={handleClose}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Mobile bottom sheet ── */}
      {isSelected && openStyle === "sheet" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white w-full rounded-t-2xl shadow-2xl pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto my-3" />
            <div className="flex justify-center px-4 pb-3">{emojiBar}</div>
            <div className="border-t border-gray-100" />
            <ActionMenuItems
              message={message} isSender={isSender}
              onReply={onReply} onSelfDelete={onSelfDelete}
              onMarkDeleted={onMarkDeleted}
              onMobileDelete={() => { setShowDeleteSheet(true); handleClose(); }}
              onClose={handleClose}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Full emoji picker ── */}
      {showEmojiPicker && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center bg-black/40"
          onClick={() => setShowEmojiPicker(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(e) => { handleReact(e.emoji); setShowEmojiPicker(false); handleClose(); }}
              height={380}
              width={300}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Mobile delete confirmation sheet ── */}
      {showDeleteSheet && createPortal(
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-[10001] bg-white rounded-t-2xl shadow-2xl p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <p className="text-center font-semibold text-gray-800 mb-1">Delete message?</p>
            <p className="text-center text-sm text-gray-500 mb-5">Choose an option</p>
            <div className="space-y-2">
              {isSender && (
                <button
                  onClick={deleteMobileForEveryone}
                  className="w-full py-3 rounded-xl bg-red-500 text-white font-medium text-sm"
                >
                  Delete for everyone
                </button>
              )}
              <button
                onClick={deleteMobileForMe}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-800 font-medium text-sm"
              >
                Delete for me
              </button>
              <button
                onClick={() => setShowDeleteSheet(false)}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
          <div
            className="fixed inset-0 bg-black/40 z-[10000]"
            onClick={() => setShowDeleteSheet(false)}
          />
        </>,
        document.body
      )}

      {/* ── Bubble column (chevron + bubble + reactions) ── */}
      <div className="flex flex-col group">
        <div className={clsx("flex items-end gap-1.5", isSender ? "justify-end" : "justify-start")}>

          {/* ChevronDown — LEFT side for received messages */}
          {!isSender && (
            <button
              onClick={triggerPopup}
              className="hidden md:flex w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center hover:bg-gray-50"
              aria-label="Message options"
            >
              <ChevronDown size={13} className="text-gray-500" />
            </button>
          )}

          {/* Bubble */}
          <div
            ref={bubbleRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
            className={clsx(
              "max-w-[75%] w-fit rounded-2xl shadow-sm overflow-hidden transition-all duration-150",
              (type === "image" || type === "video") && !message.isDeleted ? "" : "px-3 py-1.5",
              isSender ? "bg-[#d9fdd3] rounded-tr-sm" : "bg-white rounded-tl-sm",
              highlight && !isCurrentResult && "ring-2 ring-yellow-300",
              isCurrentResult && "ring-2 ring-yellow-500",
              isSelected && "ring-2 ring-purple-300",
            )}
          >
            {message.replyTo && (
              <div className={clsx((type === "image" || type === "video") ? "px-3 pt-2" : "")}>
                <ReplyPreview replyTo={message.replyTo} />
              </div>
            )}
            <MessageContent message={message} isSender={isSender} otherUser={otherUser} />
            {!hideBottomMeta && (
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[11px] text-gray-500 leading-none select-none">
                  {formatTime(message.createdAt)}
                </span>
                {isSender && <Tick status={message.status} />}
              </div>
            )}
          </div>

          {/* ChevronDown — RIGHT side for sent messages */}
          {isSender && (
            <button
              onClick={triggerPopup}
              className="hidden md:flex w-6 h-6 rounded-full bg-white shadow-sm border border-gray-200 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center hover:bg-gray-50"
              aria-label="Message options"
            >
              <ChevronDown size={13} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Reactions below bubble */}
        <div className={clsx("flex", isSender ? "justify-end" : "justify-start")}>
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
