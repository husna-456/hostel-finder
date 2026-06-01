import { getUserId } from "../../utils/auth";
import clsx from "clsx";

export default function MessageBubble({ message }) {
  const currentUserId = getUserId();
  const isSender = message.senderId === currentUserId;

  return (
    <div
      className={clsx(
        "flex mb-2",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "relative max-w-[70%] px-3 py-2 text-base shadow",
          "rounded-lg",
          isSender
            ? "bg-[#DCF8C6] text-gray-900 rounded-br-none"
            : "bg-white text-gray-900 rounded-bl-none"
        )}
      >
        {/* Message text */}
        <p className="whitespace-pre-wrap break-words pr-12 text-base font-sans">
          {message.message}
        </p>

        <div
          className={clsx(
            "absolute bottom-1.5 right-2.5",
            "text-[11px] font-medium tracking-wide",
            isSender ? "text-gray-600" : "text-gray-500"
          )}
        >
          {formatTime(message.createdAt)}
        </div>

      </div>
    </div>
  );
}

/* 🔧 Helper */
function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
