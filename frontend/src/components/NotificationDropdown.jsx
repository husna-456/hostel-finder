import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, CheckCheck, Calendar, MessageSquare, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60_000)        return "just now";
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000)   return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(date).toLocaleDateString();
}

const TYPE_CONFIG = {
  BOOKING_REQUEST:   { Icon: Calendar,      bg: "bg-blue-100",   text: "text-blue-600"   },
  BOOKING_ACCEPTED:  { Icon: CheckCircle,   bg: "bg-green-100",  text: "text-green-600"  },
  BOOKING_REJECTED:  { Icon: XCircle,       bg: "bg-red-100",    text: "text-red-500"    },
  NEW_MESSAGE:       { Icon: MessageSquare, bg: "bg-purple-100", text: "text-purple-600" },
  PAYMENT_SUBMITTED: { Icon: CreditCard,    bg: "bg-orange-100", text: "text-orange-600" },
  PAYMENT_VERIFIED:  { Icon: CheckCircle,   bg: "bg-green-100",  text: "text-green-600"  },
  PAYMENT_REJECTED:  { Icon: XCircle,       bg: "bg-red-100",    text: "text-red-500"    },
};

const DEFAULT_CONFIG = { Icon: Bell, bg: "bg-gray-100", text: "text-gray-500" };

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItemClick = async (n) => {
    if (!n.isRead) await markRead(n._id);
    if (n.link)   navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none select-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="fixed left-2 right-2 top-[62px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[calc(100vh-80px)] sm:max-h-[500px]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-semibold px-2 py-1 rounded-lg hover:bg-purple-50 transition"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Bell size={28} className="opacity-30" />
                <p className="text-sm font-medium">You're all caught up!</p>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || DEFAULT_CONFIG;
                const { Icon } = cfg;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                      !n.isRead ? "bg-purple-50/60" : ""
                    }`}
                  >
                    {/* Avatar or type icon */}
                    <div className="shrink-0 mt-0.5">
                      {n.senderId?.profilePicture ? (
                        <img
                          src={n.senderId.profilePicture}
                          alt={n.senderId.name || ""}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                          <Icon size={16} />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <p className={`text-[12px] font-semibold leading-tight mb-0.5 truncate ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {n.title}
                        </p>
                      )}
                      <p className={`text-[12px] leading-snug ${!n.isRead ? "text-gray-700" : "text-gray-500"}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Unread dot + delete */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                        className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400"
                        aria-label="Delete notification"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
