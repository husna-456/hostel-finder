import { useState } from "react";
import { Search, Filter, Eye, AlertTriangle, MessageSquare } from "lucide-react";

const chats = [
  { id: 1, user: "Ahmed Khan",   userEmail: "ahmed@example.com",  owner: "Muhammad Ali", hostel: "Elite Hostel",     messages: 23, lastMessage: "Thank you for the information", lastActivity: "2 hours ago",  status: "active",  flagged: false },
  { id: 2, user: "Bilal Hassan", userEmail: "bilal@example.com",  owner: "Ayesha Khan",  hostel: "Royal Inn",        messages: 41, lastMessage: "Is the room still available?",  lastActivity: "5 hours ago",  status: "active",  flagged: false },
  { id: 3, user: "Zara Ahmed",   userEmail: "zara@example.com",   owner: "Imran Sheikh", hostel: "Student Paradise", messages: 12, lastMessage: "This is unacceptable behavior", lastActivity: "1 day ago",    status: "active",  flagged: true  },
  { id: 4, user: "Hassan Ali",   userEmail: "hassan@example.com", owner: "Fatima Noor",  hostel: "Comfort Stay",     messages: 8,  lastMessage: "Booking confirmed, thanks!",    lastActivity: "2 days ago",   status: "inactive",flagged: false },
  { id: 5, user: "Sara Malik",   userEmail: "sara@example.com",   owner: "Usman Raza",   hostel: "Green Hostel",     messages: 19, lastMessage: "When can I move in?",           lastActivity: "3 hours ago",  status: "active",  flagged: false },
];

export default function ChatMonitoring() {
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);

  const filtered = chats.filter(
    (c) =>
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()) ||
      c.hostel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Chats",    value: chats.length,                                icon: MessageSquare, iconColor: "text-blue-500" },
          { label: "Active Chats",   value: chats.filter(c => c.status === "active").length, icon: MessageSquare, iconColor: "text-green-500" },
          { label: "Flagged Chats",  value: chats.filter(c => c.flagged).length,         icon: AlertTriangle, iconColor: "text-red-500" },
          { label: "Total Messages", value: chats.reduce((s, c) => s + c.messages, 0),   icon: MessageSquare, iconColor: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
            </div>
            <s.icon size={28} className={s.iconColor} />
          </div>
        ))}
      </div>

      {/* Read-Only Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-700">Read-Only Chat Monitoring</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Admin can view and monitor all conversations between users and owners but cannot participate in chats. This is for moderation and abuse detection purposes only.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, owner, or hostel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Hostel</th>
                <th className="text-left px-4 py-3 font-medium">Msgs</th>
                <th className="text-left px-4 py-3 font-medium">Last Message</th>
                <th className="text-left px-4 py-3 font-medium">Activity</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${c.flagged ? "bg-red-50/50" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800 flex items-center gap-1">
                      {c.user} {c.flagged && <AlertTriangle size={12} className="text-red-500" />}
                    </p>
                    <p className="text-gray-400 text-xs">{c.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.owner}</td>
                  <td className="px-4 py-3 text-gray-700">{c.hostel}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{c.messages}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate text-xs">{c.lastMessage}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.lastActivity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedChat(c)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition">
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-4 ${c.flagged ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-1 text-sm">
                  {c.user} {c.flagged && <AlertTriangle size={12} className="text-red-500" />}
                </p>
                <p className="text-xs text-gray-400">{c.owner} · {c.hostel}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {c.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 italic mb-3 line-clamp-1">"{c.lastMessage}"</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{c.messages} msgs · {c.lastActivity}</span>
              <button onClick={() => setSelectedChat(c)} className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition">
                <Eye size={12} /> View Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Viewer Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">{selectedChat.user} ↔ {selectedChat.owner}</p>
                <p className="text-xs text-gray-500">{selectedChat.hostel}</p>
              </div>
              <button onClick={() => setSelectedChat(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-xs">
                  <p className="text-xs text-gray-500 mb-1">{selectedChat.user}</p>
                  <p className="text-sm text-gray-800">Hi, is the room still available?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-tr-none px-4 py-2 max-w-xs">
                  <p className="text-xs text-blue-200 mb-1">{selectedChat.owner}</p>
                  <p className="text-sm text-white">Yes, we have rooms available. Would you like to book?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-xs">
                  <p className="text-xs text-gray-500 mb-1">{selectedChat.user}</p>
                  <p className="text-sm text-gray-800">{selectedChat.lastMessage}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">Read-only mode — Admin cannot send messages</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}