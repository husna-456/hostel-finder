import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { getMyPayments } from "../../api/payment.api";

const STATUS_META = {
  // ── success states ──
  verified:             { icon: FaCheckCircle, color: "bg-green-100 text-green-700",  label: "Verified" },
  paid:                 { icon: FaCheckCircle, color: "bg-green-100 text-green-700",  label: "Paid (Card)" },
  reserved:             { icon: FaCheckCircle, color: "bg-green-100 text-green-700",  label: "Confirmed" },
  // ── review / waiting ──
  pending_verification: { icon: FaClock,       color: "bg-blue-100 text-blue-700",    label: "Under Review" },
  "payment-submitted":  { icon: FaClock,       color: "bg-blue-100 text-blue-700",    label: "Under Review" },
  // ── not yet paid ──
  pending:              { icon: FaClock,       color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  "pending-payment":    { icon: FaClock,       color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  unpaid:               { icon: FaClock,       color: "bg-yellow-100 text-yellow-700", label: "Unpaid" },
  // ── failures ──
  rejected:             { icon: FaTimesCircle, color: "bg-red-100 text-red-700",      label: "Rejected" },
  "payment-rejected":   { icon: FaTimesCircle, color: "bg-red-100 text-red-700",      label: "Rejected" },
  failed:               { icon: FaTimesCircle, color: "bg-red-100 text-red-700",      label: "Failed" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyPayments();
        setPayments(Array.isArray(data) ? data : data.payments || []);
      } catch (err) {
        if (err?.status === 404) {
          setPayments([]);
        } else {
          console.error(err);
          setError(err.message || "Could not load payment history");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return "—"; }
  };

  const formatAmount = (amount) =>
    amount ? `PKR ${Number(amount).toLocaleString()}` : "—";

  const getStatus = (status) => STATUS_META[status] || STATUS_META.pending;

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Payments</h1>
            <p className="text-gray-500 text-sm mt-1">Track your payment history and status</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 mb-6"
          >
            <FaExclamationTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Something went wrong</h3>
            <p className="text-gray-500">{error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!error && payments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100"
          >
            <FaCreditCard className="w-20 h-20 text-purple-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No payments yet</h3>
            <p className="text-gray-500">
              You haven't made any payments. Book a hostel to get started!
            </p>
          </motion.div>
        )}

        {/* Desktop Table */}
        {!error && payments.length > 0 && (
          <>
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-purple-900">Hostel</th>
                      <th className="px-6 py-4 text-center font-semibold text-purple-900">Amount</th>
                      <th className="px-6 py-4 text-center font-semibold text-purple-900">Method</th>
                      <th className="px-6 py-4 text-center font-semibold text-purple-900">Status</th>
                      <th className="px-6 py-4 text-center font-semibold text-purple-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p, i) => {
                      const statusMeta = getStatus(p.status);
                      const StatusIcon = statusMeta.icon;
                      return (
                        <motion.tr
                          key={p._id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {p.hostelName || p.bookingId?.hostelId?.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-gray-800">
                            {formatAmount(p.amount || p.bookingId?.advanceAmount)}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500 capitalize">
                            {p.method === "jazzcash" ? "JazzCash" : p.method === "easypaisa" ? "Easypaisa" : p.method === "card" ? "Card" : p.method || "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500">
                            {formatDate(p.createdAt)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {payments.map((p, i) => {
                const statusMeta = getStatus(p.status);
                const StatusIcon = statusMeta.icon;
                return (
                  <motion.div
                    key={p._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-base">
                        {p.hostelName || p.bookingId?.hostelId?.name || "—"}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <span className="font-semibold text-gray-700">{formatAmount(p.amount || p.bookingId?.advanceAmount)}</span>
                      <span className="capitalize">
                        {p.method === "jazzcash" ? "JazzCash" : p.method === "easypaisa" ? "Easypaisa" : p.method === "card" ? "Card" : p.method || "—"}
                      </span>
                      <span>{formatDate(p.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
