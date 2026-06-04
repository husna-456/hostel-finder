import { useEffect, useState } from "react";
import { getUserConversations } from "../../api/conversation.api";
import ChatListItem from "./ChatListItem";
import { getUserId, getUserRole } from "../../utils/auth";
import { useSocketContext } from "../../context/SocketContext";
import { Search } from "lucide-react";

export default function ChatList({ activeConversationId, onSelect, isSidePanel }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [onlineMap,     setOnlineMap]     = useState({});

  const userId = getUserId();
  const role   = getUserRole();
  const socket = useSocketContext();

  // Load conversations
  useEffect(() => {
    getUserConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, [role, userId]);

  // Real-time online status
  useEffect(() => {
    if (!socket) return;
    const handleStatus = ({ userId: uid, isOnline, lastSeen }) => {
      setOnlineMap((prev) => ({ ...prev, [uid]: { isOnline, lastSeen } }));
    };
    socket.on("user_status_change", handleStatus);
    return () => socket.off("user_status_change", handleStatus);
  }, [socket]);

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q    = searchQuery.toLowerCase();
    const name = (c.clientId?.name || c.ownerId?.name || "").toLowerCase();
    const last = (c.lastMessage || "").toLowerCase();
    return name.includes(q) || last.includes(q);
  });

  const getOtherUser = (conv) =>
    role === "hostel_owner" ? conv.clientId : conv.ownerId;

  return (
    <section className="flex flex-col bg-white h-full w-full">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-bold text-gray-900">Chats</h2>
      </header>

      {/* Search */}
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

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((c) => {
            const other  = getOtherUser(c);
            const uid    = other?._id?.toString();
            const status = onlineMap[uid] ?? {
              isOnline: other?.isOnline  || false,
              lastSeen: other?.lastSeen  || null,
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
