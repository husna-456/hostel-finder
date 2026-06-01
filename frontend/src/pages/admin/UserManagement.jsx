import { useState } from "react";
import { Search, Filter, MoreVertical, ShieldOff, ShieldCheck, Eye } from "lucide-react";

const initialUsers = [
  { id: 1, name: "Ahmed Khan",   email: "ahmed@example.com",  role: "user",  totalBookings: 8,  activeBookings: 2, cancelled: 1, chats: 15, status: "active" },
  { id: 2, name: "Sara Ali",    email: "sara@example.com",   role: "owner", totalBookings: 0,  activeBookings: 0, cancelled: 0, chats: 47, status: "active" },
  { id: 3, name: "Bilal Hassan",email: "bilal@example.com",  role: "user",  totalBookings: 12, activeBookings: 1, cancelled: 3, chats: 23, status: "active" },
  { id: 4, name: "Zara Ahmed",  email: "zara@example.com",   role: "user",  totalBookings: 5,  activeBookings: 0, cancelled: 2, chats: 9,  status: "blocked" },
];

const statCards = (users) => [
  { label: "Total Users",   value: users.length },
  { label: "Active Users",  value: users.filter(u => u.status === "active").length },
  { label: "Blocked Users", value: users.filter(u => u.status === "blocked").length },
  { label: "Total Owners",  value: users.filter(u => u.role === "owner").length },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u
      )
    );
    setOpenMenu(null);
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards(users).map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Bookings</th>
                <th className="text-left px-4 py-3 font-medium">Active</th>
                <th className="text-left px-4 py-3 font-medium">Cancelled</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.totalBookings}</td>
                  <td className="px-4 py-3 text-gray-700">{u.activeBookings}</td>
                  <td className="px-4 py-3 text-gray-700">{u.cancelled}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {openMenu === u.id && (
                      <div className="absolute right-6 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-44 py-1">
                        <button onClick={() => toggleStatus(u.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                          {u.status === "active" ? <><ShieldOff size={14} className="text-red-500" /> Block</> : <><ShieldCheck size={14} className="text-green-500" /> Unblock</>}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {u.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Role: <strong className="text-gray-700">{u.role}</strong></span>
              <span>Bookings: <strong className="text-gray-700">{u.totalBookings}</strong></span>
              <span>Cancelled: <strong className="text-gray-700">{u.cancelled}</strong></span>
            </div>
            <button
              onClick={() => toggleStatus(u.id)}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition ${u.status === "active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
            >
              {u.status === "active" ? "Block User" : "Unblock User"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}