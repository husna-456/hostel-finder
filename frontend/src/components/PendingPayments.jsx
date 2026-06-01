import { useState, useEffect } from "react";
import { getPendingManualPayments, verifyPayment, rejectPayment } from "../api/payment.api";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaImage, FaSpinner } from "react-icons/fa";

export default function PendingPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getPendingManualPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load pending payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    const result = await Swal.fire({
      title: "Verify Payment?",
      text: "This will mark the payment as verified and confirm the booking.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Verify",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await verifyPayment(paymentId);
      toast.success("Payment verified");
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
    } catch (err) {
      toast.error(err.message || "Failed to verify");
    }
  };

  const handleReject = async (paymentId) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Payment",
      input: "text",
      inputLabel: "Rejection reason",
      inputPlaceholder: "Enter reason for rejection...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#dc2626",
      inputValidator: (value) => {
        if (!value) return "Please enter a rejection reason";
        return null;
      },
    });

    if (!reason) return;

    try {
      await rejectPayment(paymentId, reason);
      toast.success("Payment rejected");
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
    } catch (err) {
      toast.error(err.message || "Failed to reject");
    }
  };

  const formatAmount = (amount) =>
    amount ? `PKR ${Number(amount).toLocaleString()}` : "—";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <FaSpinner className="animate-spin" />
          <span>Loading pending payments...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Pending Payment Verifications</h3>
          <span className="text-sm text-purple-600 font-medium">
            {payments.length} pending
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p className="text-lg font-medium">No pending payments</p>
            <p className="text-sm">All payments have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Hostel</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Method</th>
                  <th className="px-6 py-3 text-left">Receipt</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {p.bookingId?.name || p.userName || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.bookingId?.hostelId?.name || p.hostelName || "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatAmount(p.amount || p.bookingId?.advanceAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.method === "jazzcash"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.method === "jazzcash" ? "JazzCash" : "Easypaisa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.receiptUrl ? (
                        <button
                          onClick={() => setLightbox(p.receiptUrl)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <FaImage className="w-4 h-4" />
                          <span className="text-xs">View</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(p._id)}
                          className="w-8 h-8 rounded-full border border-green-300 text-green-500 hover:bg-green-50 flex items-center justify-center transition"
                          title="Verify Payment"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(p._id)}
                          className="w-8 h-8 rounded-full border border-red-300 text-red-400 hover:bg-red-50 flex items-center justify-center transition"
                          title="Reject Payment"
                        >
                          <FaTimesCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Receipt"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
