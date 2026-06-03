import { useState, useEffect, useRef } from "react";
import { fetchClient } from "../api/fetchClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MoreVertical, Search, X, CheckCircle, XCircle, Phone, Mail, Eye } from "lucide-react";
import { createPortal } from "react-dom";

const TABS = ["All", "Pending", "Accepted", "Reserved", "Rejected", "Completed"];

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-800",
  accepted:  "bg-green-100 text-green-800",
  reserved:  "bg-emerald-100 text-emerald-800",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-800",
};

const PAY_BADGE = {
  unpaid:               "bg-gray-100 text-gray-600",
  pending:              "bg-yellow-100 text-yellow-800",
  pending_verification: "bg-blue-100 text-blue-800",
  paid:                 "bg-purple-100 text-purple-800",
  verified:             "bg-green-100 text-green-800",
  rejected:             "bg-red-100 text-red-700",
};

const PAY_LABEL = {
  unpaid:               "Unpaid",
  pending:              "Pending",
  pending_verification: "Under Review",
  paid:                 "Paid (Card)",
  verified:             "Verified",
  rejected:             "Rejected",
};

function LightboxModal({ src, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition"><X size={20} /></button>
      <img src={src} alt="Receipt" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
    </div>
  );
}

function ActionsMenu({ booking, onAction }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef          = useRef(null);

  const toggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left - 160 });
    setOpen(p => !p);
  };

  const items = [];
  if (booking.status === "pending")   items.push({ label: "Accept Booking",    action: "accept",   cls: "text-green-700 hover:bg-green-50" });
  if (booking.status === "pending")   items.push({ label: "Reject Booking",    action: "reject",   cls: "text-red-600  hover:bg-red-50" });
  if (booking.payment?.status === "pending_verification") {
    items.push({ label: "Verify Payment",  action: "verify",  cls: "text-emerald-700 hover:bg-emerald-50" });
    items.push({ label: "Reject Payment",  action: "rejectPay", cls: "text-red-600 hover:bg-red-50" });
  }
  if (booking.status === "reserved")  items.push({ label: "Mark Completed",   action: "complete", cls: "text-blue-700 hover:bg-blue-50" });
  items.push({ label: "Copy Phone",  action: "copyPhone", cls: "text-gray-700 hover:bg-gray-50" });

  if (items.length === 0) return <span className="text-gray-400 text-xs">—</span>;

  return (
    <>
      <button ref={btnRef} onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
        <MoreVertical size={16} className="text-gray-600" />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="fixed z-[9999] bg-white shadow-2xl rounded-2xl border border-gray-100 w-48 py-1 overflow-hidden" style={{ top: pos.top, left: pos.left }}>
            {items.map(item => (
              <button key={item.action} onClick={() => { setOpen(false); onAction(booking, item.action); }}
                className={`block w-full text-left px-4 py-3 text-sm font-medium transition ${item.cls}`}>
                {item.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState("All");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchClient("/bookings/owner")
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (booking, action) => {
    try {
      if (action === "accept") {
        await fetchClient(`/bookings/${booking._id}/status`, { method: "PATCH", body: JSON.stringify({ status: "accepted" }) });
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "accepted" } : b));
        toast.success("Booking accepted");

      } else if (action === "reject") {
        await fetchClient(`/bookings/${booking._id}/status`, { method: "PATCH", body: JSON.stringify({ status: "rejected" }) });
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "rejected" } : b));
        toast.success("Booking rejected");

      } else if (action === "verify") {
        await fetchClient(`/payments/${booking.payment._id}/verify`, { method: "PATCH" });
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "reserved", paymentStatus: "verified", payment: { ...b.payment, status: "verified" } } : b));
        toast.success("Payment verified — seat reserved!");

      } else if (action === "rejectPay") {
        const { value: reason } = await Swal.fire({ title: "Rejection Reason", input: "text", inputPlaceholder: "Enter reason...", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Reject" });
        if (reason === undefined) return;
        await fetchClient(`/payments/${booking.payment._id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, paymentStatus: "rejected", payment: { ...b.payment, status: "rejected", rejectionReason: reason } } : b));
        toast.success("Payment rejected");

      } else if (action === "complete") {
        await fetchClient(`/bookings/${booking._id}/complete`, { method: "PATCH" });
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "completed" } : b));
        toast.success("Marked as completed");

      } else if (action === "copyPhone") {
        navigator.clipboard.writeText(booking.contactNo || "");
        toast.info("Phone copied!");
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  const now  = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenue = bookings
    .filter(b => b.payment?.status === "verified" && new Date(b.createdAt) >= mStart)
    .reduce((s, b) => s + (b.payment?.amount || 0), 0);

  const stats = [
    { label: "Total Bookings", value: bookings.length },
    { label: "Pending",        value: bookings.filter(b => b.status === "pending").length },
    { label: "Reserved",       value: bookings.filter(b => b.status === "reserved").length },
    { label: "This Month Rev", value: `PKR ${revenue.toLocaleString()}` },
  ];

  const filtered = bookings.filter(b => {
    const matchTab    = tab === "All" || b.status === tab.toLowerCase();
    const matchSearch = !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.hostelId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Booking Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Tabs */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search by student name, email or hostel..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${tab === t ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 text-xs">
                  <th className="text-left px-5 py-4">Student</th>
                  <th className="text-left px-4 py-4">Hostel / Room</th>
                  <th className="text-center px-4 py-4">People</th>
                  <th className="text-center px-4 py-4">Advance</th>
                  <th className="text-left px-4 py-4">Receipt</th>
                  <th className="text-left px-4 py-4">Payment</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-center px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No bookings found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{b.name}</p>
                      <p className="text-gray-400 text-xs">{b.email}</p>
                      <p className="text-gray-400 text-xs">{b.contactNo}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{b.hostelId?.name || "—"}</p>
                      <p className="text-gray-400 text-xs capitalize">{b.roomType || "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700">{b.people || "—"}</td>
                    <td className="px-4 py-4 text-center font-bold text-purple-700">
                      {b.advanceAmount ? `PKR ${b.advanceAmount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {b.payment?.receiptScreenshot ? (
                        <button onClick={() => setLightbox(b.payment.receiptScreenshot)} className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 rounded-lg px-2 py-1 hover:bg-purple-50 transition">
                          <Eye size={12} /> View
                        </button>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PAY_BADGE[b.payment?.status || b.paymentStatus || "unpaid"] || "bg-gray-100 text-gray-600"}`}>
                        {PAY_LABEL[b.payment?.status || b.paymentStatus || "unpaid"] || "Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ActionsMenu booking={b} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filtered.map(b => (
            <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1.5 ${STATUS_BADGE[b.status]?.includes("amber") ? "bg-amber-400" : STATUS_BADGE[b.status]?.includes("green") ? "bg-green-500" : STATUS_BADGE[b.status]?.includes("emerald") ? "bg-emerald-500" : STATUS_BADGE[b.status]?.includes("blue") ? "bg-blue-500" : STATUS_BADGE[b.status]?.includes("red") ? "bg-red-400" : "bg-gray-300"}`} />
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.hostelId?.name} · {b.roomType || "—"}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_BADGE[b.status] || "bg-gray-100"}`}>
                    {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1"><Phone size={11} />{b.contactNo}</div>
                  <div className="flex items-center gap-1"><Mail size={11} />{b.email}</div>
                  <div>People: <strong className="text-gray-700">{b.people}</strong></div>
                  <div>Advance: <strong className="text-purple-700">{b.advanceAmount ? `PKR ${b.advanceAmount.toLocaleString()}` : "—"}</strong></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAY_BADGE[b.payment?.status || b.paymentStatus || "unpaid"] || "bg-gray-100"}`}>
                    {PAY_LABEL[b.payment?.status || b.paymentStatus || "unpaid"] || "Unpaid"}
                  </span>
                  <div className="flex gap-2">
                    {b.payment?.receiptScreenshot && (
                      <button onClick={() => setLightbox(b.payment.receiptScreenshot)} className="text-xs text-purple-600 border border-purple-200 rounded-lg px-2 py-1 hover:bg-purple-50 transition flex items-center gap-1">
                        <Eye size={11} /> Receipt
                      </button>
                    )}
                    <ActionsMenu booking={b} onAction={handleAction} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && <LightboxModal src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
