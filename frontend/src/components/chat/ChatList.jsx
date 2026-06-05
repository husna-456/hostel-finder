import { useEffect, useState, useRef } from "react";
import { getUserConversations } from "../../api/conversation.api";
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

  const userId      = getUserId();
  const role        = getUserRole();
  const socket      = useSocketContext();
  const menuRef     = useRef(null);

  /* load conversations */
  useEffect(() => {
    getUserConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, [role, userId]);

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

  const getOtherUser = (conv) =>
    role === "hostel_owner" ? conv.clientId : conv.ownerId;

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
                onClick={() => { setMenuOpen(false); toast.success("All chats marked as read"); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCheck size={15} className="text-green-500 shrink-0" />
                Mark all as read
              </button>
              <button
                onClick={() => { setMenuOpen(false); toast.info("Notifications muted"); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BellOff size={15} className="text-yellow-500 shrink-0" />
                Mute notifications
              </button>
              <button
                onClick={() => { setMenuOpen(false); toast.info("Chats archived"); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Archive size={15} className="text-blue-500 shrink-0" />
                Archive chats
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
        {filtered.length > 0 ? (
          filtered.map((c) => {
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
                onClick={() => onSelect(c)}
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
      </div>
    </section>
  );
}
