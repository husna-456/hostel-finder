import { useEffect, useState, useRef } from "react";
import { getUserConversations, markAllRead, archiveAllConversations, unarchiveAllConversations } from "../../api/conversation.api";
import { fetchClient } from "../../api/fetchClient";
import ChatListItem from "./ChatListItem";
import { getUserId, getUserRole } from "../../utils/auth";
import { useSocketContext } from "../../context/SocketContext";
import { Search, MoreVertical, CheckCheck, BellOff, Archive, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ChatList({ activeConversationId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [onlineMap,     setOnlineMap]     = useState({});
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [showArchived,  setShowArchived]  = useState(false);

  const userId      = getUserId();
  const role        = getUserRole();
  const socket      = useSocketContext();
  const menuRef     = useRef(null);
  const activeConvRef = useRef(activeConversationId);

  useEffect(() => { activeConvRef.current = activeConversationId; }, [activeConversationId]);

  /* load conversations */
  useEffect(() => {
    getUserConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, [role, userId]);

  /* real-time unread count updates */
  useEffect(() => {
    if (!socket) return;
    const onUnreadUpdate = ({ conversationId, unreadCount, lastMessage }) => {
      const now = new Date().toISOString();
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId
            ? {
                ...c,
                unreadCount: c._id === activeConvRef.current ? 0 : unreadCount,
                ...(lastMessage !== undefined && { lastMessage }),
                updatedAt: now,
              }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };
    socket.on("unread_count_update", onUnreadUpdate);
    return () => socket.off("unread_count_update", onUnreadUpdate);
  }, [socket]);

  /* real-time online status */
  useEffect(() => {
    if (!socket) return;
    const h = ({ userId: uid, isOnline, lastSeen }) =>
      setOnlineMap((prev) => ({ ...prev, [uid]: { isOnline, lastSeen } }));
    socket.on("user_status_change", h);
    return () => socket.off("user_status_change", h);
  }, [socket]);

  /* close header menu on outside click */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q    = searchQuery.toLowerCase();
    const name = (c.clientId?.name || c.ownerId?.name || "").toLowerCase();
    const last = (c.lastMessage || "").toLowerCase();
    return name.includes(q) || last.includes(q);
  });

  const activeConversations   = filtered.filter(c => !c.isArchived);
  const archivedConversations = filtered.filter(c => c.isArchived);

  const getOtherUser = (conv) =>
    role === "hostel_owner" ? conv.clientId : conv.ownerId;

  const handleSelect = (conv) => {
    setConversations(prev =>
      prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)
    );
    onSelect(conv);
  };

  const handleMarkAllRead = async () => {
    setMenuOpen(false);
    try {
      await markAllRead();
      setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
      toast.success("All chats marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMuteNotifications = () => {
    setMenuOpen(false);
    const current = localStorage.getItem("chat_notifications_muted") === "true";
    localStorage.setItem("chat_notifications_muted", String(!current));
    toast.success(current ? "Notifications unmuted" : "Notifications muted");
  };

  const handleArchiveChats = () => {
    setMenuOpen(false);
    if (showArchived) {
      Swal.fire({
        title: "Unarchive all chats?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Unarchive all",
      }).then(async ({ isConfirmed }) => {
        if (!isConfirmed) return;
        try {
          await unarchiveAllConversations();
          setConversations(prev => prev.map(c => ({ ...c, isArchived: false })));
          setShowArchived(false);
          toast.success("All chats unarchived");
        } catch {
          toast.error("Failed to unarchive");
        }
      });
    } else {
      Swal.fire({
        title: "Archive all chats?",
        text: "Chats will be hidden from your main list.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Archive all",
      }).then(async ({ isConfirmed }) => {
        if (!isConfirmed) return;
        try {
          await archiveAllConversations();
          setConversations(prev => prev.map(c => ({ ...c, isArchived: true })));
          toast.success("All chats archived");
        } catch {
          toast.error("Failed to archive");
        }
      });
    }
  };

  const handleClearAll = () => {
    setMenuOpen(false);
    Swal.fire({
      title: "Clear all chats?",
      text: "Chat histories will be removed from your view only.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Clear all",
      cancelButtonText: "Cancel",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        conversations.forEach((c) =>
          localStorage.setItem(`chat_cleared_${c._id}`, Date.now().toString())
        );
        toast.success("All chats cleared.");
      }
    });
  };

  return (
    <section className="flex flex-col bg-white h-full w-full">

      {/* ── Header with 3-dot menu ── */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Chats</h2>

        <div ref={menuRef} className="relative">
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
                onClick={handleMarkAllRead}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCheck size={15} className="text-green-500 shrink-0" />
                Mark all as read
              </button>
              <button
                onClick={handleMuteNotifications}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BellOff size={15} className="text-yellow-500 shrink-0" />
                Mute notifications
              </button>
              <button
                onClick={handleArchiveChats}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Archive size={15} className="text-blue-500 shrink-0" />
                {showArchived ? "Unarchive chats" : "Archive chats"}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleClearAll}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} className="shrink-0" />
                Clear all chats
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Search ── */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeConversations.length > 0 ? (
          activeConversations.map((c) => {
            const other  = getOtherUser(c);
            const uid    = other?._id?.toString();
            const status = onlineMap[uid] ?? {
              isOnline: other?.isOnline || false,
              lastSeen: other?.lastSeen || null,
            };
            return (
              <ChatListItem
                key={c._id}
                conversation={c}
                active={c._id === activeConversationId}
                onClick={() => handleSelect(c)}
                isOnline={status.isOnline}
                lastSeen={status.lastSeen}
              />
            );
          })
        ) : (
          <p className="p-4 text-sm text-gray-400">
            {searchQuery ? "No results" : "No conversations yet"}
          </p>
        )}

        {archivedConversations.length > 0 && (
          <>
            <button
              onClick={() => setShowArchived(p => !p)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors"
            >
              <Archive size={14} className="shrink-0" />
              Archived ({archivedConversations.length})
            </button>
            {showArchived && archivedConversations.map((c) => {
              const other  = getOtherUser(c);
              const uid    = other?._id?.toString();
              const status = onlineMap[uid] ?? {
                isOnline: other?.isOnline || false,
                lastSeen: other?.lastSeen || null,
              };
              return (
                <ChatListItem
                  key={c._id}
                  conversation={c}
                  active={c._id === activeConversationId}
                  onClick={() => handleSelect(c)}
                  isOnline={status.isOnline}
                  lastSeen={status.lastSeen}
                />
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
