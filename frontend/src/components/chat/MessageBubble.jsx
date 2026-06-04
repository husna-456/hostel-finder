import { getUserId } from "../../utils/auth";
import clsx from "clsx";
import { Check, CheckCheck } from "lucide-react";

function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function MessageBubble({ message, highlight, isCurrentResult }) {
  const currentUserId = getUserId();
  const isSender =
    message.senderId?.toString() === currentUserId ||
    message.senderId === currentUserId;

  return (
    <div
      className={clsx(
        "flex mb-2",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "relative max-w-[75%] md:max-w-[65%] px-3 py-2 text-base shadow rounded-lg",
          isSender ? "bg-[#DCF8C6] text-gray-900 rounded-br-none" : "bg-white text-gray-900 rounded-bl-none",
          highlight && !isCurrentResult && "ring-2 ring-yellow-300",
          isCurrentResult && "ring-2 ring-yellow-500 bg-yellow-50"
        )}
      >
        {/* Message text */}
        <p className="whitespace-pre-wrap break-words pr-14 text-base font-sans">
          {message.message}
        </p>

        {/* Time + ticks */}
        <div className={clsx(
          "absolute bottom-1.5 right-2 flex items-center gap-0.5",
          "text-[11px] font-medium tracking-wide",
          isSender ? "text-gray-500" : "text-gray-400"
        )}>
          <span>{formatTime(message.createdAt)}</span>

          {/* Ticks — sender side only */}
          {isSender && (
            <>
              {message.status === "read" ? (
                <CheckCheck size={14} className="text-blue-500 ml-0.5" />
              ) : message.status === "delivered" ? (
                <CheckCheck size={14} className="text-gray-400 ml-0.5" />
              ) : (
                <Check size={14} className="text-gray-400 ml-0.5" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
