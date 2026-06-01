import { useEffect, useState } from "react";
import {getUserConversations} from "../../api/conversation.api";
import ChatListItem from "./ChatListItem";
import { getUserId, getUserRole } from "../../utils/auth";
import { RiMore2Fill } from "react-icons/ri";
import SearchModal from "../SearchModal";


export default function ChatList({ activeConversationId, onSelect, isSidePanel }) {
  const [conversations, setConversations] = useState([]);
   const userId = getUserId();
  const role = getUserRole(); // "hostel_owner" | "client"
   useEffect(() => {
  const fetchConversations = async () => {
    try {
      const data = await getUserConversations();
      console.log("📦 conversations:", data);
      setConversations(data);
    } catch (err) {
      console.error("❌ ChatList fetch error:", err);
      setConversations([]);
    }
  };

  fetchConversations();
}, [role, userId,]);



  return (
    <section className={`relative ${isSidePanel? "hidden" : "lg:flex flex-col item-start justify-start bg-white h-[100vh] w-[100%] md:w-[600px]"}` }>
      <header className="flex items-center justify-between w-full h-16 px-4 border-b border-gray-300 sticky top-0 bg-white z-[100]">
        <h2 className="text-[24px] font-bold text-gray-900 tracking-wide p-2">
          Chats
        </h2>
        <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-between rounded-lg">
          <RiMore2Fill color="#01AA85" className=" w-[28px] h-[28px]" />
        </button>
      </header>

      <div className="w-full px-4 py-3">

        {/* SEARCH BAR */}
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <SearchModal />
          <input
            type="text"
            placeholder="Search or start a new chat"
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-500"
          />
        </div>

      </div>
<div className="flex flex-col flex-1 overflow-y-auto scrollbar-whatsapp">
      {conversations.length > 0 ? (
        conversations.map((c) => (
          <ChatListItem
            key={c._id}
            conversation={c}
            active={c._id === activeConversationId}
            onClick={() => onSelect(c)}
            mode={role}
          />
        ))
      ) : (
        <div className="p-4 text-sm text-gray-400">
          No conversations yet
        </div>
      )}
      </div>
    </section>
  );
}
