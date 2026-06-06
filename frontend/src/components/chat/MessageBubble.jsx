import { useState } from "react";
import { getUserId } from "../../utils/auth";
import clsx from "clsx";
import { Check, CheckCheck, FileText, Download } from "lucide-react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";

function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageMessage({ message }) {
  const [lightbox, setLightbox] = useState(false);
  return (
    <>
      <img
        src={message.fileUrl}
        alt={message.fileName}
        className="rounded-xl max-w-full cursor-pointer object-cover"
        onClick={() => setLightbox(true)}
      />
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-pointer"
          onClick={() => setLightbox(false)}
        >
          <img src={message.fileUrl} alt="full" className="max-w-[95vw] max-h-[95vh] object-contain" />
        </div>
      )}
    </>
  );
}

function PollMessage({ message, isSender }) {
  const currentUserId = getUserId();
  const [localPoll, setLocalPoll] = useState(message.poll);

  const totalVotes = localPoll?.options?.reduce((sum, o) => sum + (o.votes?.length || 0), 0) || 0;

  const userVotedIndex = localPoll?.options?.findIndex(
    (o) => o.votes?.some((v) => v?.toString() === currentUserId || v === currentUserId)
  );

  const handleVote = async (optIdx) => {
    try {
      const result = await fetchClient('/messages/' + message._id + '/vote', {
        method: 'POST',
        body: JSON.stringify({ optionIndex: optIdx }),
      });
      setLocalPoll(result.poll);
    } catch (err) {
      toast.error('Vote failed');
    }
  };

  return (
    <div className="min-w-[200px]">
      <p className="text-[14px] font-semibold text-gray-900 mb-2">{localPoll?.question}</p>
      <div className="space-y-2">
        {localPoll?.options?.map((opt, idx) => {
          const voteCount = opt.votes?.length || 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isVoted = idx === userVotedIndex;
          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              className={clsx(
                "w-full text-left rounded-xl px-3 py-2 transition-colors border",
                isVoted
                  ? "bg-purple-100 border-purple-300"
                  : "bg-white/60 border-gray-200 hover:bg-purple-50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-gray-800 font-medium">
                  {isVoted && <span className="mr-1 text-purple-600">✓</span>}
                  {opt.text}
                </span>
                <span className="text-[11px] text-gray-500 ml-2 shrink-0">{voteCount} · {pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
    </div>
  );
}

function MessageContent({ message, isSender }) {
  const type = message.type || 'text';

  if (type === 'image') {
    return <ImageMessage message={message} />;
  }

  if (type === 'video') {
    return (
      <video controls className="rounded-xl max-w-full" style={{ maxHeight: 300 }}>
        <source src={message.fileUrl} />
      </video>
    );
  }

  if (type === 'audio') {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-700 font-medium">{message.fileName}</p>
        <audio controls className="w-full" style={{ maxWidth: 280 }}>
          <source src={message.fileUrl} />
        </audio>
      </div>
    );
  }

  if (type === 'document') {
    return (
      <a
        href={message.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 transition"
      >
        <FileText size={22} className="text-purple-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{message.fileName}</p>
          <p className="text-xs text-gray-400">{formatSize(message.fileSize)}</p>
        </div>
        <Download size={16} className="text-gray-400 ml-auto shrink-0" />
      </a>
    );
  }

  if (type === 'poll') {
    return <PollMessage message={message} isSender={isSender} />;
  }

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] text-gray-900 leading-snug">
      {message.message}
    </p>
  );
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
        <MessageContent message={message} isSender={isSender} />

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
