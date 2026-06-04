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
    <div className={clsx("flex", isSender ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] md:max-w-[65%] px-3 py-2 rounded-2xl shadow-sm",
          isSender ? "bg-[#DCF8C6] rounded-br-sm" : "bg-white rounded-bl-sm",
          highlight && !isCurrentResult && "ring-2 ring-yellow-300",
          isCurrentResult && "ring-2 ring-yellow-500"
        )}
      >
        {/* Message text — font/size unchanged per spec, text always dark */}
        <p className="whitespace-pre-wrap break-words text-[15px] text-gray-900 leading-snug">
          {message.message}
        </p>

        {/* Time + ticks: below the text, right-aligned, never overlaps */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-gray-500 leading-none select-none">
            {formatTime(message.createdAt)}
          </span>

          {isSender && (
            message.status === "read" ? (
              <CheckCheck size={13} className="text-blue-500 shrink-0" />
            ) : message.status === "delivered" ? (
              <CheckCheck size={13} className="text-gray-400 shrink-0" />
            ) : (
              <Check size={13} className="text-gray-400 shrink-0" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
