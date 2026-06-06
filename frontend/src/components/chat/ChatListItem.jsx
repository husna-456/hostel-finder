import clsx from "clsx";
import { Camera, Video, Mic, FileText, BarChart2 } from "lucide-react";

function parsePreview(str) {
  if (!str) return { Icon: null, text: null, italic: false };
  if (str.startsWith("📷")) return { Icon: Camera,     text: "Photo",                          italic: false };
  if (str.startsWith("🎥")) return { Icon: Video,      text: "Video",                          italic: false };
  if (str.startsWith("🎤")) return { Icon: Mic,        text: "Voice note",                     italic: false };
  if (str.startsWith("📄 ")) return { Icon: FileText,  text: str.slice(3) || "Document",       italic: false };
  if (str.startsWith("📊 ")) return { Icon: BarChart2, text: str.slice(3) || "Poll",           italic: false };
  if (str.startsWith("🚫")) return { Icon: null,       text: "This message was deleted",       italic: true  };
  return { Icon: null, text: str, italic: false };
}

export default function ChatListItem({
  conversation, active, onClick, isOnline, lastSenderIsMe,
}) {
  const otherUser = conversation.clientId?.name
    ? conversation.clientId
    : conversation.ownerId;

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();
  const hasUnread = conversation.unreadCount > 0;

  const { Icon, text, italic } = parsePreview(conversation.lastMessage);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 min-h-[64px] transition-colors",
        active ? "bg-purple-50" : "hover:bg-gray-50"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-base">
            {initial}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={clsx("text-[15px] text-gray-900 truncate", hasUnread ? "font-bold" : "font-semibold")}>
            {otherUser?.name || "User"}
          </span>
          <span className="text-xs text-gray-400 shrink-0">
            {conversation.updatedAt
              ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {/* Preview line: [You:] [Icon] [text] */}
          <div className={clsx(
            "text-sm flex items-center gap-1 min-w-0",
            hasUnread ? "text-gray-800 font-medium" : "text-gray-500"
          )}>
            {lastSenderIsMe && (
              <span className="shrink-0 font-normal">You:</span>
            )}
            {Icon && (
              <Icon size={13} className="shrink-0 opacity-70" />
            )}
            <span className={clsx("truncate", italic && "italic")}>
              {text || "Start a conversation"}
            </span>
          </div>

          {hasUnread && (
            <span className="bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0 font-medium">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
