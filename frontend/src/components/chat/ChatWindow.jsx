// src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useSocketContext } from "../../context/SocketContext";
import { useCallContext } from "../../context/CallContext";
import { getMessages } from "../../api/message.api";
import { getUserId, getUserRole } from "../../utils/auth";
import {
  ArrowLeft, MoreVertical, Search, Trash2, Ban, X,
  ChevronUp, ChevronDown, Phone, BellOff,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "";
  const date    = new Date(lastSeen);
  const now     = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1)  return "Last seen just now";
  if (diffMin < 60) return `Last seen ${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    const t = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `Last seen today at ${t}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Last seen yesterday";
  return `Last seen ${date.toLocaleDateString()}`;
}

export default function ChatWindow({ conversation, onBack }) {
  const socket        = useSocketContext();
  const currentUserId = getUserId();
  const role          = getUserRole();

  const { startCall, callStatus } = useCallContext?.() || {};

  const otherUser = role === "hostel_owner"
    ? conversation.clientId || {}
    : conversation.ownerId  || {};

  /* ── state ── */
  const [messages,      setMessages]      = useState([]);
  const [isTyping,      setIsTyping]      = useState(false);
  const [menuOpen,          setMenuOpen]          = useState(false);
  const [muted,             setMuted]             = useState(false);
  const [replyTo,           setReplyTo]           = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [contactStatus, setContactStatus] = useState({
    isOnline: otherUser?.isOnline || false,
    lastSeen: otherUser?.lastSeen || null,
  });

  /* chat search */
  const [showSearch,    setShowSearch]    = useState(false);
  const [chatSearch,    setChatSearch]    = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchIdx,     setSearchIdx]     = useState(0);

  const messagesEndRef = useRef(null);
  const menuRef        = useRef(null);

  /* ── prevent body scroll while chat is open (mobile stability) ── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── load messages ── */
  useEffect(() => {
    if (!conversation?._id) return;
    getMessages(conversation._id).then((msgs) => {
      const clearedAt = localStorage.getItem(`chat_cleared_${conversation._id}`);
      setMessages(
        clearedAt
          ? msgs.filter((m) => new Date(m.createdAt) > new Date(parseInt(clearedAt)))
          : msgs
      );
    });
  }, [conversation?._id]);

  /* ── auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── join room ── */
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit("join_conversation", conversation._id);
    return () => socket.emit("leave_conversation", conversation._id);
  }, [socket, conversation?._id]);

  /* ── socket listeners ── */
  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit("mark_seen", { conversationId: conversation._id, messageId: msg._id });
      }
    };

    const onAck = (realMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === realMsg.tempId ? realMsg : m))
      );
    };

    const onDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === messageId ? { ...m, status: "delivered" } : m
        )
      );
    };

    const onSeen = ({ conversationId: convId }) => {
      if (convId === conversation._id)
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?.toString() === currentUserId && m.status !== "read"
              ? { ...m, status: "read" }
              : m
          )
        );
    };

    const onTyping   = ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(true);  };
    const onStopType = ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(false); };

    const onStatus = ({ userId, isOnline, lastSeen }) => {
      if (userId === otherUser?._id?.toString() || userId === otherUser?._id)
        setContactStatus({ isOnline, lastSeen });
    };

    const onPollUpdated = ({ messageId, poll }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === messageId || m._id === messageId
            ? { ...m, poll }
            : m
        )
      );
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === messageId || m._id === messageId
            ? { ...m, isDeleted: true, message: "", fileUrl: "", reactions: [] }
            : m
        )
      );
    };

    const onReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === messageId || m._id === messageId
            ? { ...m, reactions }
            : m
        )
      );
    };

    socket.on("receive_message",   onReceive);
    socket.on("message_ack",       onAck);
    socket.on("message_delivered", onDelivered);
    socket.on("messages_seen",     onSeen);
    socket.on("user_typing",       onTyping);
    socket.on("user_stop_typing",  onStopType);
    socket.on("user_status_change",onStatus);
    socket.on("poll_updated",      onPollUpdated);
    socket.on("message_deleted",   onDeleted);
    socket.on("message_reaction",  onReaction);

    return () => {
      socket.off("receive_message",   onReceive);
      socket.off("message_ack",       onAck);
      socket.off("message_delivered", onDelivered);
      socket.off("messages_seen",     onSeen);
      socket.off("user_typing",       onTyping);
      socket.off("user_stop_typing",  onStopType);
      socket.off("user_status_change",onStatus);
      socket.off("poll_updated",      onPollUpdated);
      socket.off("message_deleted",   onDeleted);
      socket.off("message_reaction",  onReaction);
    };
  }, [socket, conversation._id, currentUserId, otherUser?._id]);

  /* ── chat search ── */
  useEffect(() => {
    if (!chatSearch.trim()) { setSearchResults([]); return; }
    const q = chatSearch.toLowerCase();
    setSearchResults(messages.filter((m) => m.message?.toLowerCase().includes(q)));
    setSearchIdx(0);
  }, [chatSearch, messages]);

  useEffect(() => {
    if (!searchResults.length) return;
    document
      .getElementById(`msg-${searchResults[searchIdx]?._id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchIdx, searchResults]);

  /* ── close header menu on outside click ── */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── close message popup when clicking outside (desktop) ── */
  useEffect(() => {
    if (!selectedMessageId) return;
    const h = () => setSelectedMessageId(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [selectedMessageId]);

  /* ── handlers ── */
  const handleSend = (msg) => {
    setMessages((prev) => [...prev, msg]);
    requestAnimationFrame(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) textarea.focus();
    });
  };

  const handleSelfDelete = (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const handleMarkDeleted = (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, message: "", fileUrl: "", reactions: [] }
          : m
      )
    );
  };

  const handleClearChat = () => {
    setMenuOpen(false);
    Swal.fire({
      title: "Clear chat?",
      text: "Messages will only be removed from your view.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Clear",
      cancelButtonText: "Cancel",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        localStorage.setItem(`chat_cleared_${conversation._id}`, Date.now().toString());
        setMessages([]);
      }
    });
  };

  const handleBlockUser = () => {
    setMenuOpen(false);
    Swal.fire({
      title: `Block ${otherUser?.name || "user"}?`,
      text: "They won't be able to send you messages.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Block",
      cancelButtonText: "Cancel",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) toast.info(`${otherUser?.name || "User"} blocked.`);
    });
  };

  const handleMute = () => {
    setMuted((p) => !p);
    setMenuOpen(false);
    toast.success(muted ? "Notifications unmuted" : "Notifications muted");
  };

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();

  /* ── visible messages (filter deleted-for-me) ── */
  const visibleMessages = messages.filter(
    (m) => !m.deletedFor?.some(
      (id) => id?.toString() === currentUserId || id === currentUserId
    )
  );

  return (
    <section
      className="flex flex-col w-full
                 max-md:fixed max-md:inset-0
                 md:relative md:h-full"
      style={{
        backgroundImage: "url('/chat-bg.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "300px",
      }}
    >
      {/* ══ HEADER ══ */}
      <header className="w-full h-16 px-3 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0 z-10">

        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {otherUser?.profilePicture ? (
          <img src={otherUser.profilePicture} alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0">
            {initial}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[16px] leading-tight truncate">
            {otherUser?.name || "User"}
          </p>
          {contactStatus.isOnline ? (
            <p className="text-xs text-green-500 font-medium leading-none mt-0.5">Online</p>
          ) : contactStatus.lastSeen ? (
            <p className="text-xs text-gray-400 leading-none mt-0.5">{formatLastSeen(contactStatus.lastSeen)}</p>
          ) : (
            <p className="text-xs text-gray-400 leading-none mt-0.5">Offline</p>
          )}
        </div>

        {/* Voice call button */}
        <button
          onClick={() => startCall?.(otherUser._id, otherUser.name, otherUser.profilePicture)}
          disabled={callStatus && callStatus !== "idle"}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0 disabled:opacity-40"
          aria-label="Voice call"
        >
          <Phone size={18} />
        </button>

        {/* Three-dots menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
              <button
                onClick={() => { setShowSearch((p) => !p); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Search size={15} className="text-purple-500 shrink-0" />
                Search in chat
              </button>
              <button
                onClick={handleMute}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BellOff size={15} className="text-yellow-500 shrink-0" />
                {muted ? "Unmute notifications" : "Mute notifications"}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleClearChat}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              >
                <Trash2 size={15} className="text-orange-500 shrink-0" />
                Clear chat
              </button>
              <button
                onClick={handleBlockUser}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Ban size={15} className="shrink-0" />
                Block user
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══ SEARCH BAR ══ */}
      {showSearch && (
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            autoFocus type="text" value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          {searchResults.length > 0 && (
            <span className="text-xs text-gray-400 shrink-0">
              {searchIdx + 1}/{searchResults.length}
            </span>
          )}
          <button onClick={() => setSearchIdx((p) => Math.max(0, p - 1))} disabled={searchIdx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => setSearchIdx((p) => Math.min(searchResults.length - 1, p + 1))} disabled={searchIdx >= searchResults.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
          <button onClick={() => { setShowSearch(false); setChatSearch(""); }} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ══ MESSAGES ══ */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-2">
        {visibleMessages.length > 0 ? (
          visibleMessages.map((msg) => (
            <div id={`msg-${msg._id}`} key={msg._id || Math.random()}>
              <MessageBubble
                message={msg}
                highlight={chatSearch.trim() !== "" && searchResults.some((r) => r._id === msg._id)}
                isCurrentResult={chatSearch.trim() !== "" && searchResults[searchIdx]?._id === msg._id}
                onReply={setReplyTo}
                onSelfDelete={handleSelfDelete}
                onMarkDeleted={handleMarkDeleted}
                otherUser={otherUser}
                isSelected={selectedMessageId === msg._id}
                onSelect={() => setSelectedMessageId(msg._id)}
                onClose={() => setSelectedMessageId(null)}
              />
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No messages yet. Say hello! 👋
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white px-4 py-2 rounded-2xl text-sm text-gray-500 shadow-sm">
              Typing…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ══ INPUT ══ */}
      <MessageInput
        conversationId={conversation?._id}
        onSend={handleSend}
        replyTo={replyTo}
        clearReply={() => setReplyTo(null)}
      />
    </section>
  );
}
