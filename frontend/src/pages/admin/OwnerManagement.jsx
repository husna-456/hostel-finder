import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, ShieldOff, ShieldCheck, Trash2, Pencil, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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

function RateBar({ value }) {
  const color = value >= 80 ? "bg-green-500" : value >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-600">{value}%</span>
    </div>
  );
}

export default function OwnerManagement() {
  const [owners, setOwners]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [editTarget, setEditTarget]   = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const handleEdited = (id, updates) =>
    setOwners(prev => prev.map(o => o._id === id ? { ...o, ...updates } : o));

  useEffect(() => {
    fetchClient("/admin/owners")
      .then(setOwners)
      .catch(() => toast.error("Failed to load owners"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (owner) => {
    const action = owner.isBlocked ? "Unblock" : "Block";
    const result = await Swal.fire({ title: `${action} ${owner.name}?`, icon: "warning", showCancelButton: true, confirmButtonColor: owner.isBlocked ? "#16a34a" : "#dc2626", confirmButtonText: action });
    if (!result.isConfirmed) return;
    try {
      const data = await fetchClient(`/admin/owners/${owner._id}/block`, { method: "PATCH" });
      setOwners(prev => prev.map(o => o._id === owner._id ? { ...o, isBlocked: data.isBlocked } : o));
      toast.success(`Owner ${data.isBlocked ? "blocked" : "unblocked"}`);
    } catch { toast.error("Action failed"); }
  };

  const deleteOwner = async (owner) => {
    const result = await Swal.fire({ title: `Delete ${owner.name}?`, text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/admin/owners/${owner._id}`, { method: "DELETE" });
      setOwners(prev => prev.filter(o => o._id !== owner._id));
      toast.success("Owner deleted");
    } catch { toast.error("Delete failed"); }
  };

  const filtered = owners.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Owners",  value: owners.length },
    { label: "Active",        value: owners.filter(o => !o.isBlocked).length },
    { label: "Blocked",       value: owners.filter(o => o.isBlocked).length },
    { label: "Total Hostels", value: owners.reduce((s, o) => s + (o.hostelCount || 0), 0) },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">Owner</th>
                <th className="text-left px-4 py-3">Hostels</th>
                <th className="text-left px-4 py-3">Bookings</th>
                <th className="text-left px-4 py-3">Acceptance</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No owners found</td></tr>
              ) : filtered.map(o => (
                <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{o.name}</p>
                    <p className="text-gray-400 text-xs">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.hostelCount || 0}</td>
                  <td className="px-4 py-3 text-gray-700">{o.totalBookings || 0}</td>
                  <td className="px-4 py-3"><RateBar value={o.acceptanceRate || 0} /></td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${o.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {o.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditTarget(o)} title="Edit Profile" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"><Pencil size={15} /></button>
                      <button onClick={() => setResetTarget(o)} title="Reset Password" className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"><KeyRound size={15} /></button>
                      <button onClick={() => toggleBlock(o)} className={`p-1.5 rounded-lg transition ${o.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}>
                        {o.isBlocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                      </button>
                      <button onClick={() => deleteOwner(o)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
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
        {filtered.map(o => (
          <div key={o._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div><p className="font-semibold text-gray-800">{o.name}</p><p className="text-xs text-gray-400">{o.email}</p></div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${o.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>{o.isBlocked ? "Blocked" : "Active"}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Hostels: <strong className="text-gray-700">{o.hostelCount || 0}</strong></span>
              <span>Bookings: <strong className="text-gray-700">{o.totalBookings || 0}</strong></span>
              <span>Acceptance: <strong className="text-gray-700">{o.acceptanceRate || 0}%</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button onClick={() => setEditTarget(o)} className="py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">Edit Profile</button>
              <button onClick={() => setResetTarget(o)} className="py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">Password</button>
              <button onClick={() => toggleBlock(o)} className={`py-2 rounded-lg text-xs font-semibold transition ${o.isBlocked ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{o.isBlocked ? "Unblock" : "Block"}</button>
              <button onClick={() => deleteOwner(o)} className="py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editTarget && (
        <EditProfileModal
          target={editTarget}
          endpointBase="/admin/owners"
          onClose={() => setEditTarget(null)}
          onUpdated={handleEdited}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          endpointBase="/admin/owners"
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
