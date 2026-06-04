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
    /*
     * OwnerLayout/main has: sticky top-bar (~48px) + p-4 on mobile  → ~64px = 4rem
     *                       p-6 on desktop                          → 48px  = 3rem
     * No negative margins — parent padding keeps chat off the edges.
     */
    <div
      className="flex overflow-hidden rounded-2xl border border-gray-100 shadow-sm
                 h-[calc(100vh-4rem)] md:h-[calc(100vh-3rem)]"
    >
      {/* ── Conversation list ── */}
      <div
        className={`flex-col border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0
          ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <ChatList
          activeConversationId={activeConversation?._id}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Chat window ── */}
      <div
        className={`flex-1 flex-col
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
