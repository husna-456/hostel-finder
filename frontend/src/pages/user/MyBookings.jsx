import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { FaCreditCard, FaRedo } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { fetchClient } from "../../api/fetchClient";

// ── helpers ──────────────────────────────────────────────────────────────────

function unifiedStatus(booking) {
  const s  = booking.status;
  const ps = booking.payment?.status || booking.paymentStatus;

  if (s === "reserved" || ps === "verified")
    return { label: "Confirmed & Reserved", color: "emerald", icon: CheckCircle };
  if (s === "accepted" && (ps === "pending_verification"))
    return { label: "Payment Under Review", color: "blue",   icon: Clock };
  if (s === "accepted" && (ps === "paid"))
    return { label: "Paid — Awaiting Confirmation", color: "purple", icon: CreditCard };
  if (ps === "rejected")
    return { label: "Payment Rejected", color: "red",     icon: XCircle };
  if (s === "accepted")
    return { label: "Accepted — Pay Now",   color: "green",  icon: CheckCircle };
  if (s === "pending")
    return { label: "Pending Approval",    color: "amber",  icon: Clock };
  if (s === "rejected")
    return { label: "Rejected",            color: "red",    icon: XCircle };
  if (s === "cancelled")
    return { label: "Cancelled",           color: "gray",   icon: XCircle };
  if (s === "completed")
    return { label: "Completed",           color: "blue",   icon: CheckCircle };
  return { label: s, color: "gray", icon: AlertCircle };
}

const STRIP = {
  emerald: "bg-emerald-500",
  blue:    "bg-blue-500",
  purple:  "bg-purple-500",
  green:   "bg-green-500",
  amber:   "bg-amber-400",
  red:     "bg-red-400",
  gray:    "bg-gray-300",
};

const BADGE = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue:    "bg-blue-100 text-blue-700",
  purple:  "bg-purple-100 text-purple-700",
  green:   "bg-green-100 text-green-700",
  amber:   "bg-amber-100 text-amber-700",
  red:     "bg-red-100 text-red-700",
  gray:    "bg-gray-100 text-gray-600",
};

// ── BookingCard ───────────────────────────────────────────────────────────────

function BookingCard({ booking, onCancelSuccess }) {
  const navigate = useNavigate();
  const unified  = unifiedStatus(booking);
  const Icon     = unified.icon;

  const ps = booking.payment?.status || booking.paymentStatus;
  const s  = booking.status;

  const canCancel   = s === "pending";
  const canPayNow   = s === "accepted" && (!ps || ps === "unpaid");
  const canRetry    = ps === "rejected";

  const rejectionReason = booking.payment?.rejectionReason || booking.paymentRejectionReason;
  const advance         = booking.advanceAmount;
  const formattedDate   = new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Booking?",
      html: `<p class="text-gray-700">Cancel booking for <strong>${booking.hostelId?.name || "this hostel"}</strong>?</p><p class="text-sm text-gray-500 mt-1">This cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Keep It",
      reverseButtons: true,
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchClient(`/bookings/cancel/${booking._id}`, { method: "DELETE" });
      onCancelSuccess(booking._id);
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Color strip */}
      <div className={`h-1.5 ${STRIP[unified.color]}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-base leading-tight truncate">
              {booking.hostelId?.name || "Unknown Hostel"}
            </h3>
            {booking.roomType && (
              <p className="text-xs text-gray-500 mt-0.5">{booking.roomType}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${BADGE[unified.color]}`}>
            <Icon className="w-3 h-3" />
            {unified.label}
          </span>
        </div>

        {/* Detail row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-4">
          <span>{booking.people} {booking.people === 1 ? "person" : "people"}</span>
          <span>{formattedDate}</span>
          {advance ? (
            <span className="font-semibold text-purple-700">Advance: PKR {advance.toLocaleString()}</span>
          ) : null}
        </div>

        {/* Rejection reason */}
        {rejectionReason && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <strong>Rejection reason:</strong> {rejectionReason}
          </div>
        )}

        {/* Actions */}
        {(canPayNow || canRetry || canCancel) && (
          <div className="flex flex-wrap gap-2">
            {canPayNow && (
              <button
                onClick={() => navigate(`/user/payment/${booking._id}`)}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
              >
                <FaCreditCard className="text-xs" /> Pay Now
              </button>
            )}
            {canRetry && (
              <button
                onClick={() => navigate(`/user/payment/${booking._id}`)}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
              >
                <FaRedo className="text-xs" /> Retry Payment
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── MyBookings page ───────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "reserved", label: "Reserved" },
  { key: "rejected", label: "Rejected" },
];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchClient("/bookings/my")
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancelSuccess = (id) => setBookings(prev => prev.filter(b => b._id !== id));

  const filtered = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = [
    { label: "Total",    value: bookings.length },
    { label: "Pending",  value: bookings.filter(b => b.status === "pending").length },
    { label: "Accepted", value: bookings.filter(b => b.status === "accepted").length },
    { label: "Pay Now",  value: bookings.filter(b => b.status === "accepted" && (!b.paymentStatus || b.paymentStatus === "unpaid")).length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-6 md:p-6 md:pb-8 lg:p-8 lg:pb-10">
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your hostel bookings</p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => {
            const count = f.key === "all" ? bookings.length : bookings.filter(b => b.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.key
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
                }`}
              >
                {f.label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Bookings */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100"
          >
            <Calendar className="w-20 h-20 text-purple-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {filter !== "all" ? `No ${filter} bookings.` : "You haven't made any bookings yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancelSuccess={handleCancelSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
