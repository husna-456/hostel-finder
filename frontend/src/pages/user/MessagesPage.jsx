// src/pages/user/MessagesPage.jsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createConversation } from "../../api/conversation.api";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import EmptyChatState from "../../components/chat/EmptyChatState";



export default function MessagesPage() {
  const { hostelId, ownerId } = useParams();
  const [searchParams] = useSearchParams();
  const isSidePanel = searchParams.get("isSidePanel");
  const [conversation, setConversation] = useState(null);

  // 🔥 OPTION-B: chat open → conversation create
  useEffect(() => {
    if (hostelId && ownerId) {
      (async () => {
        const conv = await createConversation({ hostelId, ownerId });
        setConversation(conv);
      })();
    }
  }, [hostelId, ownerId]);


  // ✅ jab chat list se click ho
  const handleSelect = (chat) => {
    setConversation(chat); // 🔥 bas itna hi
  };


  return (
    <div className="flex h-screen bg-gray-50 ">
      {/* LEFT – Conversation list */}
      <ChatList
        activeConversationId={conversation?._id}
        onSelect={handleSelect}
        isSidePanel={isSidePanel}
      />

      {/* RIGHT – Chat window */}
      {conversation ? (
        <ChatWindow conversation={conversation} />
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
}