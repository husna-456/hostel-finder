import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, MapPin, Ban, CheckCircle, Trash2, Edit } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const TABS = ["All", "Active", "Blocked"];

export default function HostelManagement() {
  const [hostels, setHostels]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState("All");
  const [editHostel, setEditHostel] = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    fetchClient("/admin/hostels")
      .then(setHostels)
      .catch(() => toast.error("Failed to load hostels"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (hostel) => {
    const action = hostel.isBlocked ? "Unblock" : "Block";
    const result = await Swal.fire({ title: `${action} "${hostel.name}"?`, icon: "warning", showCancelButton: true, confirmButtonColor: hostel.isBlocked ? "#16a34a" : "#dc2626", confirmButtonText: action });
    if (!result.isConfirmed) return;
    try {
      const data = await fetchClient(`/admin/hostels/${hostel._id}/block`, { method: "PATCH" });
      setHostels(prev => prev.map(h => h._id === hostel._id ? { ...h, isBlocked: data.isBlocked } : h));
      toast.success(`Hostel ${data.isBlocked ? "blocked" : "unblocked"}`);
    } catch { toast.error("Action failed"); }
  };

  const deleteHostel = async (hostel) => {
    const result = await Swal.fire({ title: `Delete "${hostel.name}"?`, text: "All related bookings will be cancelled.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/admin/hostels/${hostel._id}`, { method: "DELETE" });
      setHostels(prev => prev.filter(h => h._id !== hostel._id));
      toast.success("Hostel deleted");
    } catch { toast.error("Delete failed"); }
  };

  const openEdit = (hostel) => {
    setEditHostel(hostel);
    setEditForm({ name: hostel.name, description: hostel.description || "", address: hostel.address || "", startingRent: hostel.startingRent || "" });
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      const updated = await fetchClient(`/admin/hostels/${editHostel._id}`, { method: "PUT", body: JSON.stringify(editForm) });
      setHostels(prev => prev.map(h => h._id === editHostel._id ? { ...h, ...editForm } : h));
      setEditHostel(null);
      toast.success("Hostel updated");
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  const filtered = hostels.filter(h => {
    const matchSearch = h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.ownerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "All" || (tab === "Active" && !h.isBlocked) || (tab === "Blocked" && h.isBlocked);
    return matchSearch && matchTab;
  });

  const stats = [
    { label: "Total Hostels", value: hostels.length },
    { label: "Active",        value: hostels.filter(h => !h.isBlocked).length },
    { label: "Blocked",       value: hostels.filter(h => h.isBlocked).length },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by name, owner, location..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">Hostel</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-center px-4 py-3">Rooms</th>
                <th className="text-center px-4 py-3">Bookings</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No hostels found</td></tr>
              ) : filtered.map(h => (
                <tr key={h._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{h.name}</p>
                    <p className="text-gray-400 text-xs capitalize">{h.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{h.ownerId?.name || "—"}</p>
                    <p className="text-gray-400 text-xs">{h.ownerId?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-600 text-xs"><MapPin size={11} /> {h.address || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{h.rooms?.length || 0}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{h.bookingCount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${h.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {h.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition"><Edit size={15} /></button>
                      <button onClick={() => toggleBlock(h)} className={`p-1.5 rounded-lg transition ${h.isBlocked ? "text-green-600 hover:bg-green-50" : "text-amber-500 hover:bg-amber-50"}`}>
                        {h.isBlocked ? <CheckCircle size={15} /> : <Ban size={15} />}
                      </button>
                      <button onClick={() => deleteHostel(h)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={15} /></button>
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
        {filtered.map(h => (
          <div key={h._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div><p className="font-semibold text-gray-800">{h.name}</p><p className="text-xs text-gray-400">{h.ownerId?.name} · {h.address}</p></div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${h.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>{h.isBlocked ? "Blocked" : "Active"}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Rooms: <strong>{h.rooms?.length || 0}</strong></span>
              <span>Bookings: <strong>{h.bookingCount || 0}</strong></span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(h)} className="flex-1 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">Edit</button>
              <button onClick={() => toggleBlock(h)} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${h.isBlocked ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{h.isBlocked ? "Unblock" : "Block"}</button>
              <button onClick={() => deleteHostel(h)} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editHostel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="font-bold">Edit Hostel (Admin Override)</h2>
              <button onClick={() => setEditHostel(null)} className="text-white/80 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[["Name", "name", "text"], ["Description", "description", "text"], ["Address", "address", "text"], ["Starting Rent", "startingRent", "number"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input type={type} value={editForm[key] || ""} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 outline-none" />
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => setEditHostel(null)} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
