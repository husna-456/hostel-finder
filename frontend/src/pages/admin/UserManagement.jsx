import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function UserManagement() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClient("/admin/users")
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (user) => {
    const action = user.isBlocked ? "Unblock" : "Block";
    const result = await Swal.fire({
      title: `${action} ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: user.isBlocked ? "#16a34a" : "#dc2626",
      confirmButtonText: action,
    });
    if (!result.isConfirmed) return;
    try {
      const data = await fetchClient(`/admin/users/${user._id}/block`, { method: "PATCH" });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBlocked: data.isBlocked } : u));
      toast.success(`User ${data.isBlocked ? "blocked" : "unblocked"}`);
    } catch { toast.error("Action failed"); }
  };

  const deleteUser = async (user) => {
    const result = await Swal.fire({
      title: `Delete ${user.name}?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/admin/users/${user._id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success("User deleted");
    } catch { toast.error("Delete failed"); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const thisMonth = users.filter(u => {
    const d = new Date(u.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: "Total Users",    value: users.length },
    { label: "Active",         value: users.filter(u => !u.isBlocked).length },
    { label: "Blocked",        value: users.filter(u => u.isBlocked).length },
    { label: "Joined This Month", value: thisMonth },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleBlock(u)} className={`p-1.5 rounded-lg transition ${u.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}>
                        {u.isBlocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                      </button>
                      <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(u => (
          <div key={u._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                {u.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleBlock(u)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${u.isBlocked ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
              <button onClick={() => deleteUser(u)} className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
