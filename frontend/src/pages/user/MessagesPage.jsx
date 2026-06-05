// src/pages/user/MessagesPage.jsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createConversation } from "../../api/conversation.api";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import EmptyChatState from "../../components/chat/EmptyChatState";

export default function MessagesPage() {
  const { hostelId, ownerId } = useParams();
  const [searchParams]   = useSearchParams();
  const isSidePanel      = searchParams.get("isSidePanel") === "true";

  const [conversation,  setConversation]  = useState(null);
  const [loadingConv,   setLoadingConv]   = useState(!!(hostelId && ownerId));
  // Open directly into chat window when launched from "Chat with Owner" (params present)
  const [mobileView, setMobileView] = useState(
    (hostelId && ownerId) || isSidePanel ? "chat" : "list"
  );

  useEffect(() => {
    if (hostelId && ownerId) {
      setLoadingConv(true);
      createConversation({ hostelId, ownerId })
        .then((conv) => {
          setConversation(conv);
          setMobileView("chat");
        })
        .finally(() => setLoadingConv(false));
    }
  }, [hostelId, ownerId]);

  const handleSelect = (chat) => {
    setConversation(chat);
    setMobileView("chat");
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* ── Conversation list — hidden entirely when opened as side panel ── */}
      {!isSidePanel && (
        <div
          className={`h-full flex-col border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
        >
          <ChatList
            activeConversationId={conversation?._id}
            onSelect={handleSelect}
          />
        </div>
      )}

      {/* ── Chat window ── */}
      <div
        className={`flex-1 h-full flex-col overflow-hidden min-h-0
          ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {loadingConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : conversation ? (
          <ChatWindow
            conversation={conversation}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}
