import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, ShieldOff, ShieldCheck, Trash2, Plus, UserCog, Pencil, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ROLE_BADGE = {
  user:         "bg-blue-100 text-blue-700",
  hostel_owner: "bg-purple-100 text-purple-700",
  admin:        "bg-gray-800 text-white",
};
const ROLE_LABEL = { user: "Client", hostel_owner: "Owner", admin: "Admin" };

function EditProfileModal({ target, endpointBase, onClose, onUpdated }) {
  const [form, setForm]     = useState({ name: target.name, email: target.email });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast.error("Enter a valid email"); return; }
    try {
      setSaving(true);
      await fetchClient(`${endpointBase}/${target._id}/edit`, {
        method: "PATCH",
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });
      toast.success("Profile updated");
      onUpdated(target._id, { name: form.name.trim(), email: form.email.trim() });
      onClose();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg mx-4">
        <div className="bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="font-bold text-base">Edit Profile — {target.name}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[["Full Name","name","text"],["Email","email","email"]].map(([label,key,type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input type={type} required value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ target, endpointBase, onClose }) {
  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const mismatch = form.confirm && form.password !== form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    try {
      setSaving(true);
      await fetchClient(`${endpointBase}/${target._id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ password: form.password }),
      });
      toast.success("Password reset successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Reset failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg mx-4">
        <div className="bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="font-bold text-base">Reset Password — {target.name}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[["New Password","password"],["Confirm Password","confirm"]].map(([label,key]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input type="password" required value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={key === "password" ? "Min. 6 characters" : "Re-enter password"}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none" />
            </div>
          ))}
          {mismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={saving || !!mismatch} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-60">
              {saving ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "user" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = await fetchClient("/admin/users", { method: "POST", body: JSON.stringify(form) });
      toast.success("User created!");
      onCreated(data.user);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl mx-4">
        <div className="bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="font-bold text-base">Add New User</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[["Full Name","name","text"],["Email","email","email"],["Password","password","password"]].map(([label,key,type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input type={type} required value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none bg-white">
              <option value="user">Client (User)</option>
              <option value="hostel_owner">Hostel Owner</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-60">
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  useEffect(() => {
    fetchClient("/admin/users")
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (user) => {
    const action = user.isBlocked ? "Unblock" : "Block";
    const result = await Swal.fire({ title: `${action} ${user.name}?`, icon: "warning", showCancelButton: true, confirmButtonColor: user.isBlocked ? "#16a34a" : "#dc2626", confirmButtonText: action });
    if (!result.isConfirmed) return;
    try {
      const data = await fetchClient(`/admin/users/${user._id}/block`, { method: "PATCH" });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBlocked: data.isBlocked } : u));
      toast.success(`User ${data.isBlocked ? "blocked" : "unblocked"}`);
    } catch { toast.error("Action failed"); }
  };

  const deleteUser = async (user) => {
    const result = await Swal.fire({ title: `Delete ${user.name}?`, text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/admin/users/${user._id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success("User deleted");
    } catch { toast.error("Delete failed"); }
  };

  const changeRole = async (user) => {
    const { value: newRole } = await Swal.fire({
      title: `Change role for ${user.name}`,
      input: "select",
      inputOptions: { user: "Client (User)", hostel_owner: "Hostel Owner", admin: "Admin" },
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Change Role",
    });
    if (!newRole || newRole === user.role) return;
    try {
      await fetchClient(`/admin/users/${user._id}/role`, { method: "PATCH", body: JSON.stringify({ role: newRole }) });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast.success(`Role changed to ${ROLE_LABEL[newRole]}`);
    } catch { toast.error("Role change failed"); }
  };

  const handleEdited = (id, updates) =>
    setUsers(prev => prev.map(u => u._id === id ? { ...u, ...updates } : u));

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
    { label: "Total Users",      value: users.length },
    { label: "Active",           value: users.filter(u => !u.isBlocked).length },
    { label: "Blocked",          value: users.filter(u => u.isBlocked).length },
    { label: "Joined This Month",value: thisMonth },
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

      {/* Search + Add */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition w-full sm:w-auto">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
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
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditTarget(u)} title="Edit Profile" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"><Pencil size={15} /></button>
                      <button onClick={() => setResetTarget(u)} title="Reset Password" className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"><KeyRound size={15} /></button>
                      <button onClick={() => changeRole(u)} title="Change Role" className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"><UserCog size={15} /></button>
                      <button onClick={() => toggleBlock(u)} className={`p-1.5 rounded-lg transition ${u.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}>
                        {u.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                      </button>
                      <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"><Trash2 size={15} /></button>
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
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role] || "bg-gray-100"}`}>{ROLE_LABEL[u.role] || u.role}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>{u.isBlocked ? "Blocked" : "Active"}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button onClick={() => setEditTarget(u)} className="py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">Edit</button>
              <button onClick={() => setResetTarget(u)} className="py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">Password</button>
              <button onClick={() => changeRole(u)} className="py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">Role</button>
              <button onClick={() => toggleBlock(u)} className={`py-2 rounded-lg text-xs font-semibold col-span-1 ${u.isBlocked ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{u.isBlocked ? "Unblock" : "Block"}</button>
              <button onClick={() => deleteUser(u)} className="py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold col-span-2">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={u => setUsers(prev => [u, ...prev])} />}

      {editTarget && (
        <EditProfileModal
          target={editTarget}
          endpointBase="/admin/users"
          onClose={() => setEditTarget(null)}
          onUpdated={handleEdited}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          endpointBase="/admin/users"
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
