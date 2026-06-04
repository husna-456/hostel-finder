// src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useSocketContext } from "../../context/SocketContext";
import { getMessages } from "../../api/message.api";
import { getUserId, getUserRole } from "../../utils/auth";
import {
  ArrowLeft, MoreVertical, Search, Trash2, Ban, X, ChevronUp, ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

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

  const otherUser = role === "hostel_owner"
    ? conversation.clientId || {}
    : conversation.ownerId  || {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages,   setMessages]   = useState([]);
  const [isTyping,   setIsTyping]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [contactStatus, setContactStatus] = useState({
    isOnline: otherUser?.isOnline || false,
    lastSeen: otherUser?.lastSeen || null,
  });

  // Chat search
  const [showSearch,    setShowSearch]    = useState(false);
  const [chatSearch,    setChatSearch]    = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchIdx,     setSearchIdx]     = useState(0);

  const messagesEndRef = useRef(null);
  const menuRef        = useRef(null);

  // ── Load messages ──────────────────────────────────────────────────────────
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

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Join conversation room ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit("join_conversation", conversation._id);
    return () => socket.emit("leave_conversation", conversation._id);
  }, [socket, conversation?._id]);

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onReceive = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => [...prev, message]);
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
      if (convId === conversation._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?.toString() === currentUserId && m.status !== "read"
              ? { ...m, status: "read" }
              : m
          )
        );
      }
    };

    const onTyping    = ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(true);  };
    const onStopType  = ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(false); };

    const onStatus = ({ userId, isOnline, lastSeen }) => {
      if (userId === otherUser?._id?.toString() || userId === otherUser?._id) {
        setContactStatus({ isOnline, lastSeen });
      }
    };

    socket.on("receive_message",  onReceive);
    socket.on("message_ack",      onAck);
    socket.on("message_delivered",onDelivered);
    socket.on("messages_seen",    onSeen);
    socket.on("user_typing",      onTyping);
    socket.on("user_stop_typing", onStopType);
    socket.on("user_status_change", onStatus);

    return () => {
      socket.off("receive_message",  onReceive);
      socket.off("message_ack",      onAck);
      socket.off("message_delivered",onDelivered);
      socket.off("messages_seen",    onSeen);
      socket.off("user_typing",      onTyping);
      socket.off("user_stop_typing", onStopType);
      socket.off("user_status_change", onStatus);
    };
  }, [socket, conversation._id, currentUserId, otherUser?._id]);

  // ── Chat search ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatSearch.trim()) { setSearchResults([]); return; }
    const q = chatSearch.toLowerCase();
    setSearchResults(messages.filter((m) => m.message?.toLowerCase().includes(q)));
    setSearchIdx(0);
  }, [chatSearch, messages]);

  useEffect(() => {
    if (searchResults.length === 0) return;
    const target = searchResults[searchIdx];
    if (target) {
      document.getElementById(`msg-${target._id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchIdx, searchResults]);

  // ── Close menu on outside click ────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSend = (msg) => setMessages((prev) => [...prev, msg]);

  const handleClearChat = () => {
    if (window.confirm("Clear this chat? Messages are only removed from your view.")) {
      localStorage.setItem(`chat_cleared_${conversation._id}`, Date.now().toString());
      setMessages([]);
      setMenuOpen(false);
    }
  };

  const handleBlockUser = () => {
    if (window.confirm(`Block ${otherUser?.name || "this user"}? They won't be able to send you messages.`)) {
      toast.info("User blocked.");
      setMenuOpen(false);
    }
  };

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();

  return (
    <section
      className="flex flex-col h-full w-full"
      style={{ backgroundImage: "url('/chat-bg.jpg')", backgroundRepeat: "repeat", backgroundSize: "300px" }}
    >
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="w-full h-16 px-3 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0 relative z-10">
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar */}
        {otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
            {initial}
          </div>
        )}

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
            {otherUser?.name || "User"}
          </p>
          {contactStatus.isOnline ? (
            <p className="text-xs text-green-500 font-medium">Online</p>
          ) : contactStatus.lastSeen ? (
            <p className="text-xs text-gray-400">{formatLastSeen(contactStatus.lastSeen)}</p>
          ) : (
            <p className="text-xs text-gray-400">Offline</p>
          )}
        </div>

        {/* Three-dots menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <button
                onClick={() => { setShowSearch((p) => !p); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Search size={14} className="text-purple-500" />
                Search in chat
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleClearChat}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Trash2 size={14} className="text-orange-500" />
                Clear chat
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleBlockUser}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Ban size={14} />
                Block user
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════ CHAT SEARCH BAR ═══════════════════ */}
      {showSearch && (
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 shrink-0">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          {searchResults.length > 0 && (
            <span className="text-xs text-gray-400 shrink-0">
              {searchIdx + 1}/{searchResults.length}
            </span>
          )}
          <button
            onClick={() => setSearchIdx((p) => Math.max(0, p - 1))}
            disabled={searchIdx === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => setSearchIdx((p) => Math.min(searchResults.length - 1, p + 1))}
            disabled={searchIdx >= searchResults.length - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => { setShowSearch(false); setChatSearch(""); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ═══════════════════ MESSAGES ═══════════════════ */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div id={`msg-${msg._id}`} key={msg._id || Math.random()}>
              <MessageBubble
                message={msg}
                isOwn={msg.senderId?.toString() === currentUserId || msg.senderId === currentUserId}
                highlight={
                  chatSearch.trim() !== "" &&
                  searchResults.some((r) => r._id === msg._id)
                }
                isCurrentResult={
                  chatSearch.trim() !== "" &&
                  searchResults[searchIdx]?._id === msg._id
                }
              />
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No messages yet
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white px-4 py-2 rounded-2xl text-sm text-gray-500 shadow">
              Typing…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ═══════════════════ INPUT ═══════════════════ */}
      <MessageInput
        conversationId={conversation?._id}
        onSend={handleSend}
      />
    </section>
  );
}
