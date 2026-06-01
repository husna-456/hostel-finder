import { useState, useEffect } from "react";
import { fetchClient } from "../api/fetchClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";

const PAYMENT_BADGE = {
  unpaid:               "bg-yellow-100 text-yellow-800",
  pending:              "bg-yellow-100 text-yellow-800",
  pending_verification: "bg-blue-100 text-blue-800",
  paid:                 "bg-purple-100 text-purple-800",
  verified:             "bg-green-100 text-green-800",
  rejected:             "bg-red-100 text-red-800",
};

const PAYMENT_LABEL = {
  unpaid:               "Unpaid",
  pending:              "Pending",
  pending_verification: "Under Review",
  paid:                 "Paid (Card)",
  verified:             "Verified",
  rejected:             "Rejected",
};

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [popup, setPopup] = useState({ show: false, id: null, decision: null });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchClient("/bookings/owner");
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmPopup = (id, decision) => {
    setPopup({ show: true, id, decision });
    setOpenMenu(null);
  };

  const confirmDecision = async () => {
    try {
      const updated = await fetchClient(`/bookings/${popup.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: popup.decision }),
      });
      setBookings((prev) => prev.map((b) => (b._id === popup.id ? { ...b, ...updated } : b)));
      toast.success(`Booking ${popup.decision}!`);
    } catch {
      toast.error("Failed to update booking");
    }
    setPopup({ show: false, id: null, decision: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No bookings yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold text-purple-900">ID</th>
                      <th className="px-5 py-4 text-left font-semibold text-purple-900">Hostel</th>
                      <th className="px-5 py-4 text-left font-semibold text-purple-900">Guest</th>
                      <th className="px-5 py-4 text-left font-semibold text-purple-900">Contact</th>
                      <th className="px-5 py-4 text-center font-semibold text-purple-900">Advance</th>
                      <th className="px-5 py-4 text-center font-semibold text-purple-900">Payment</th>
                      <th className="px-5 py-4 text-center font-semibold text-purple-900">Status</th>
                      <th className="px-5 py-4 text-center font-semibold text-purple-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((b) => {
                      const locked = b.status === "accepted" || b.status === "rejected" || b.status === "reserved";
                      const payBadge = PAYMENT_BADGE[b.paymentStatus] || "bg-yellow-100 text-yellow-800";
                      const payLabel = PAYMENT_LABEL[b.paymentStatus] || "Unpaid";

                      return (
                        <tr key={b._id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="px-5 py-4 font-mono text-purple-700 text-xs">{b._id.slice(-8)}</td>
                          <td className="px-5 py-4 font-medium text-gray-800">{b.hostelId?.name || "—"}</td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-800">{b.name}</p>
                            <p className="text-xs text-gray-500">{b.userId?.email || b.email}</p>
                          </td>
                          <td className="px-5 py-4 text-gray-600 text-xs">{b.contactNo}</td>
                          <td className="px-5 py-4 text-center font-bold text-purple-700">
                            {b.advanceAmount != null
                              ? `PKR ${Number(b.advanceAmount).toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${payBadge}`}>
                              {payLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              b.status === "pending"   ? "bg-amber-100 text-amber-800" :
                              b.status === "accepted"  ? "bg-green-100 text-green-800" :
                              b.status === "reserved"  ? "bg-emerald-100 text-emerald-800" :
                              b.status === "rejected"  ? "bg-red-100 text-red-800" :
                                                         "bg-gray-100 text-gray-600"
                            }`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center relative">
                            {!locked ? (
                              <button
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuPos({ top: rect.bottom + 8, left: rect.left - 110 });
                                  setOpenMenu(openMenu === b._id ? null : b._id);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">—</span>
                            )}

                            {openMenu === b._id && createPortal(
                              <div
                                className="bg-white shadow-2xl rounded-2xl border border-gray-200 w-44 z-[9999] overflow-hidden"
                                style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
                              >
                                <button
                                  onClick={() => openConfirmPopup(b._id, "accepted")}
                                  className="block w-full text-left px-5 py-3.5 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
                                >
                                  Accept
                                </button>
                                <div className="h-px bg-gray-100" />
                                <button
                                  onClick={() => openConfirmPopup(b._id, "rejected")}
                                  className="block w-full text-left px-5 py-3.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
                                >
                                  Reject
                                </button>
                              </div>,
                              document.body
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {bookings.map((b) => {
                const locked = b.status === "accepted" || b.status === "rejected" || b.status === "reserved";
                const payBadge = PAYMENT_BADGE[b.paymentStatus] || "bg-yellow-100 text-yellow-800";
                const payLabel = PAYMENT_LABEL[b.paymentStatus] || "Unpaid";

                return (
                  <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.hostelId?.name}</p>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === "pending"   ? "bg-amber-100 text-amber-800" :
                        b.status === "accepted"  ? "bg-green-100 text-green-800" :
                        b.status === "reserved"  ? "bg-emerald-100 text-emerald-800" :
                        b.status === "rejected"  ? "bg-red-100 text-red-800" :
                                                   "bg-gray-100 text-gray-600"
                      }`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                      <div><span className="text-gray-400">Contact:</span> {b.contactNo}</div>
                      <div><span className="text-gray-400">People:</span> {b.people}</div>
                      <div>
                        <span className="text-gray-400">Advance:</span>{" "}
                        <span className="font-bold text-purple-700">
                          {b.advanceAmount != null ? `PKR ${Number(b.advanceAmount).toLocaleString()}` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${payBadge}`}>
                          {payLabel}
                        </span>
                      </div>
                    </div>

                    {!locked && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmPopup(b._id, "accepted")}
                          className="flex-1 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openConfirmPopup(b._id, "rejected")}
                          className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirm popup */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {popup.decision === "accepted" ? "Accept this booking?" : "Reject this booking?"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">This will update the booking status and notify the guest.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPopup({ show: false, id: null, decision: null })}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecision}
                className={`px-6 py-2.5 rounded-xl font-bold text-white text-sm transition ${
                  popup.decision === "accepted" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {popup.decision === "accepted" ? "Accept" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer autoClose={2500} position="top-right" />
    </div>
  );
}
