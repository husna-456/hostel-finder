import { useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import EmptyChatState from "../components/chat/EmptyChatState";

export default function OwnerChat() {
  const [activeConversation, setActiveConversation] = useState(null);
console.log("ACTIVE CONVERSATION:", activeConversation);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT — Conversations */}
      <ChatList
        activeConversationId={activeConversation?._id}
        onSelect={setActiveConversation}
        mode="hostel_owner"   // 👈 important
      />

      {/* RIGHT — Chat Window */}
      {activeConversation ? (
        <ChatWindow conversation={activeConversation} />
      ) : (
          <EmptyChatState />
      )}
    </div>
  );
}
