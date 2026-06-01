import clsx from "clsx";


export default function ChatListItem({ conversation, active, onClick, mode }) {
  const otherUser =
    conversation.clientId?.name
      ? conversation.clientId
      : conversation.ownerId;

  return (
    <main 
    
     onClick={onClick}
      className={clsx(
        "flex px-4 py-3 cursor-pointer border-b border-[#9090902c] mt-[1.25rem] items-start  pb-3 pt-2",
        active ? "bg-purple-40" : "hover:bg-gray-50"
      )}
    >
     
       <button className="flex items-start justify-between w-[100%]">
      {/* Name + last msg */}
      <div className="flex items-start gap-3">
      <img
        src={otherUser?.avatar || "/avatar.png"}
        className="w-[40px] h-[40px] rounded-full object-cover"
        alt=""
      />
        <span className="font-semibold text-gray-800">
          <h2 className="p-0 font-semibold text-left text-[#2A3d39] text-[17px]">{otherUser?.name || "User"}</h2>
          <p className="p-0 font-light text-left text-[#2A3d39] text-[14px]">{conversation.lastMessage || "Hey there, How are you?"}</p>
        </span>
      </div>

      {/* Time + unread */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">
          {conversation.updatedAt
            ? new Date(conversation.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>

        {/* unread badge (optional) */}
        {conversation.unreadCount > 0 && (
          <span className="bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      </button>
    </main>
  );
}
