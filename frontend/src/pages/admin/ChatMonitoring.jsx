import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, Eye, MessageSquare, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ChatMonitoring() {
  const [convos, setConvos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchClient("/admin/conversations")
      .then(setConvos)
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = convos.filter(c =>
    c.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.ownerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.hostelId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMessages = convos.reduce((s, c) => s + (c.messageCount || 0), 0);
  const activeCount   = convos.filter(c => c.isActive).length;

  const stats = [
    { label: "Total Conversations", value: convos.length,  icon: MessageSquare },
    { label: "Active (7 days)",      value: activeCount,    icon: MessageSquare },
    { label: "Total Messages",       value: totalMessages,  icon: MessageSquare },
  ];

  const formatTime = (date) => new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p></div>
            <s.icon size={28} className="text-purple-400" />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 font-medium">
        🔒 Read-only mode — Admin can view conversations but cannot send messages.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-2">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input type="text" placeholder="Search by user, owner or hostel..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Hostel</th>
                <th className="text-center px-4 py-3">Messages</th>
                <th className="text-left px-4 py-3">Last Message</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No conversations found</td></tr>
              ) : filtered.map(c => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{c.clientId?.name || "—"}</p>
                    <p className="text-gray-400 text-xs">{c.clientId?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.ownerId?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.hostelId?.name || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{c.messageCount || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">{c.lastMessage || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition">
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
        {filtered.map(c => (
          <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{c.clientId?.name || "—"}</p>
                <p className="text-xs text-gray-400">{c.ownerId?.name} · {c.hostelId?.name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {c.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {c.lastMessage && <p className="text-xs text-gray-500 italic mb-3 line-clamp-1">"{c.lastMessage}"</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{c.messageCount || 0} messages</span>
              <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition">
                <Eye size={12} /> View Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-semibold text-gray-800">{selected.clientId?.name} ↔ {selected.ownerId?.name}</p>
                <p className="text-xs text-gray-500">{selected.hostelId?.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {(selected.recentMessages || []).length === 0 ? (
                <p className="text-center text-gray-400 text-sm">No messages</p>
              ) : (selected.recentMessages || []).map((m, i) => {
                const isUser = m.senderId?.role === "user";
                return (
                  <div key={i} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isUser ? "bg-white text-gray-800 rounded-tl-none border border-gray-200" : "bg-purple-600 text-white rounded-tr-none"}`}>
                      <p className={`text-xs font-medium mb-1 ${isUser ? "text-gray-500" : "text-purple-200"}`}>{m.senderId?.name || "Unknown"}</p>
                      <p>{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl shrink-0">
              <p className="text-xs text-gray-400 text-center">🔒 Read-only — Admin cannot send messages</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
