import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { Search, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const TABS = ["All", "Pending", "Accepted", "Reserved", "Cancelled", "Rejected"];

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-800",
  accepted:  "bg-green-100 text-green-800",
  reserved:  "bg-emerald-100 text-emerald-800",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const PAY_BADGE = {
  unpaid:               "bg-yellow-100 text-yellow-800",
  pending:              "bg-yellow-100 text-yellow-800",
  pending_verification: "bg-blue-100 text-blue-800",
  paid:                 "bg-purple-100 text-purple-800",
  verified:             "bg-green-100 text-green-800",
  rejected:             "bg-red-100 text-red-700",
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState("All");

  useEffect(() => {
    fetchClient("/admin/bookings")
      .then(setBookings)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const forceCancel = async (booking) => {
    const result = await Swal.fire({ title: "Force Cancel?", text: `Cancel booking for ${booking.userId?.name || booking.name}?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Force Cancel" });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/admin/bookings/${booking._id}/force-cancel`, { method: "PATCH" });
      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.hostelId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "All" || b.status === tab.toLowerCase();
    return matchSearch && matchTab;
  });

  const counts = { Pending: 0, Accepted: 0, Reserved: 0, Cancelled: 0, Rejected: 0 };
  bookings.forEach(b => { const k = b.status?.charAt(0).toUpperCase() + b.status?.slice(1); if (counts[k] !== undefined) counts[k]++; });

  const stats = [
    { label: "Total",     value: bookings.length },
    { label: "Pending",   value: counts.Pending },
    { label: "Accepted",  value: counts.Accepted },
    { label: "Reserved",  value: counts.Reserved },
    { label: "Cancelled", value: counts.Cancelled },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by user, hostel..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${tab === t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t}{t !== "All" && counts[t] != null ? ` (${counts[t]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="text-left px-5 py-3">Guest</th>
                <th className="text-left px-4 py-3">Hostel</th>
                <th className="text-center px-4 py-3">People</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-center px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{b.userId?.name || b.name || "—"}</p>
                    <p className="text-gray-400 text-xs">{b.userId?.email || b.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.hostelId?.name || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{b.people || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-500"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAY_BADGE[b.paymentStatus] || PAY_BADGE[b.paymentStatusDetail] || "bg-gray-100 text-gray-500"}`}>
                      {b.paymentStatus || "unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 text-xs">
                    {b.paymentAmount ? `PKR ${b.paymentAmount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    {b.status !== "cancelled" && (
                      <button onClick={() => forceCancel(b)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 transition">
                        <XCircle size={12} /> Cancel
                      </button>
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
        {filtered.map(b => (
          <div key={b._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{b.userId?.name || b.name}</p>
                <p className="text-xs text-gray-400">{b.hostelId?.name || "—"}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-500"}`}>{b.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>People: <strong>{b.people}</strong></span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${PAY_BADGE[b.paymentStatus] || "bg-gray-100 text-gray-500"}`}>{b.paymentStatus || "unpaid"}</span>
              {b.paymentAmount && <span>PKR {b.paymentAmount.toLocaleString()}</span>}
            </div>
            {b.status !== "cancelled" && (
              <button onClick={() => forceCancel(b)} className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold">Force Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
