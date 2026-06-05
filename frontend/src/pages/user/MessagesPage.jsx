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
  const isSidePanel      = searchParams.get("isSidePanel");

  const [conversation, setConversation] = useState(null);
  const [mobileView,   setMobileView]   = useState("list");

  useEffect(() => {
    if (isSidePanel) setMobileView("chat");
  }, [isSidePanel]);

  useEffect(() => {
    if (hostelId && ownerId) {
      createConversation({ hostelId, ownerId }).then((conv) => {
        setConversation(conv);
        setMobileView("chat");
      });
    }
  }, [hostelId, ownerId]);

  const handleSelect = (chat) => {
    setConversation(chat);
    setMobileView("chat");
  };

  return (
    <div className="flex h-full md:h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      {/* ── Conversation list ── */}
      <div
        className={`flex-col border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0
          ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <ChatList
          activeConversationId={conversation?._id}
          onSelect={handleSelect}
          isSidePanel={isSidePanel}
        />
      </div>

      {/* ── Chat window ── */}
      <div
        className={`flex-1 flex-col
          ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {conversation ? (
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
