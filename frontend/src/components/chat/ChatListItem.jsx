import clsx from "clsx";

export default function ChatListItem({ conversation, active, onClick, isOnline, lastSeen }) {
  const otherUser = conversation.clientId?.name
    ? conversation.clientId
    : conversation.ownerId;

  const initial = (otherUser?.name || "?").charAt(0).toUpperCase();

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
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base">
            {initial}
          </div>
        )}
        {/* Online dot */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-semibold text-gray-800 text-sm truncate">
            {otherUser?.name || "User"}
          </span>
          <span className="text-[11px] text-gray-400 shrink-0">
            {conversation.updatedAt
              ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-gray-500 truncate">
            {conversation.lastMessage || "Start a conversation"}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-purple-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
