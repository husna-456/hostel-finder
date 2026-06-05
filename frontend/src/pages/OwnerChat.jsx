import { useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import EmptyChatState from "../components/chat/EmptyChatState";

export default function OwnerChat() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [mobileView,         setMobileView]         = useState("list");

  const handleSelect = (conv) => {
    setActiveConversation(conv);
    setMobileView("chat");
  };

  return (
    <div className="h-full flex overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      {/* ── Conversation list ── */}
      <div
        className={`h-full flex-col border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0
          ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <ChatList
          activeConversationId={activeConversation?._id}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Chat window ── */}
      <div
        className={`flex-1 h-full flex-col overflow-hidden min-h-0
          ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}
