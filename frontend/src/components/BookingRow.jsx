import { useEffect, useState } from "react";
import { FaUsers, FaCalendarAlt, FaRedo, FaCreditCard } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";

export default function BookingRow({ booking, onCancelSuccess, mobile = false }) {
  const [liveStatus, setLiveStatus] = useState(booking.status);
  const [livePaymentStatus, setLivePaymentStatus] = useState(booking.paymentStatus || null);
  const navigate = useNavigate();

  useEffect(() => {
    let prev = liveStatus;
    let prevPay = livePaymentStatus;

    const interval = setInterval(async () => {
      try {
        const data = await fetchClient(`/bookings/${booking._id}`);
        if (!data?.status) return;

        if (data.status !== prev) {
          prev = data.status;
          setLiveStatus(data.status);
          if (data.status === "accepted") toast.info("Your booking has been accepted!");
          else if (data.status === "rejected") toast.error("Your booking was rejected.");
        }

        if (data.paymentStatus && data.paymentStatus !== prevPay) {
          prevPay = data.paymentStatus;
          setLivePaymentStatus(data.paymentStatus);
          if (data.paymentStatus === "verified") toast.success("Your payment has been verified! Seat reserved.");
          else if (data.paymentStatus === "rejected") toast.error("Your payment was rejected.");
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [booking._id]);

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Booking?",
      html: `
        <p class="text-gray-700">Are you sure you want to cancel this booking for</p>
        <p class="font-bold text-purple-600 text-lg">${booking.hostelId?.name || "Hostel"}</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Keep It",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl",
        cancelButton: "bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await fetchClient(`/bookings/cancel/${booking._id}`, { method: "DELETE" });
      onCancelSuccess(booking._id);
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const handlePayNow = () => navigate(`/user/payment/${booking._id}`);

  // Cancel only allowed while pending
  const canCancel = liveStatus === "pending";
  // Pay Now appears when accepted and not yet paid/under review
  const canPayNow =
    liveStatus === "accepted" &&
    (!livePaymentStatus || livePaymentStatus === "unpaid");
  // Retry appears when payment was rejected
  const canRetry =
    livePaymentStatus === "rejected" || livePaymentStatus === "payment-rejected";

  const getStatusBadge = () => {
    const base = "px-3 py-1 rounded-full text-xs font-bold";
    switch (liveStatus) {
      case "accepted":  return `${base} bg-green-100 text-green-700`;
      case "reserved":  return `${base} bg-emerald-100 text-emerald-700`;
      case "pending":   return `${base} bg-amber-100 text-amber-700`;
      case "rejected":  return `${base} bg-red-100 text-red-700`;
      case "cancelled": return `${base} bg-gray-100 text-gray-600`;
      default:          return `${base} bg-gray-100 text-gray-500`;
    }
  };

  const getPaymentBadge = () => {
    const base = "px-3 py-1 rounded-full text-xs font-bold";
    const ps = livePaymentStatus;
    if (!ps || ps === "unpaid") return `${base} bg-yellow-100 text-yellow-700`;
    if (ps === "pending" || ps === "pending-payment") return `${base} bg-yellow-100 text-yellow-700`;
    if (ps === "pending_verification") return `${base} bg-blue-100 text-blue-700`;
    if (ps === "paid") return `${base} bg-purple-100 text-purple-700`;
    if (ps === "verified") return `${base} bg-green-100 text-green-700`;
    if (ps === "rejected" || ps === "payment-rejected") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-gray-100 text-gray-500`;
  };

  const getPaymentLabel = () => {
    const ps = livePaymentStatus;
    if (!ps || ps === "unpaid") return "Unpaid";
    if (ps === "pending" || ps === "pending-payment") return "Pending";
    if (ps === "pending_verification") return "Under Review";
    if (ps === "paid") return "Paid";
    if (ps === "verified") return "Verified";
    if (ps === "rejected" || ps === "payment-rejected") return "Rejected";
    return ps;
  };

  const formattedDate = new Date(booking.createdAt).toLocaleDateString("en-GB");

  const ActionButtons = () => (
    <div className="flex gap-2 flex-wrap">
      {canPayNow && (
        <button
          onClick={handlePayNow}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          <FaCreditCard className="text-xs" /> Pay Now
        </button>
      )}
      {canRetry && (
        <button
          onClick={handlePayNow}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          <FaRedo className="text-xs" /> Retry Payment
        </button>
      )}
      {canCancel && (
        <button
          onClick={handleCancel}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          Cancel
        </button>
      )}
      {!canPayNow && !canRetry && !canCancel && (
        <span className="text-gray-400 text-sm italic">—</span>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-base">
            {booking.hostelId?.name || "Unknown Hostel"}
          </h3>
          <span className={getStatusBadge()}>
            {liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1)}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1"><FaUsers className="text-gray-400" /> {booking.people}</span>
          <span className="flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> {formattedDate}</span>
          <span className={getPaymentBadge()}>{getPaymentLabel()}</span>
        </div>
        {(livePaymentStatus === "rejected" || livePaymentStatus === "payment-rejected") && booking.paymentRejectionReason && (
          <p className="text-xs text-red-500 mb-3">Reason: {booking.paymentRejectionReason}</p>
        )}
        <ActionButtons />
      </div>
    );
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-800">
        {booking.hostelId?.name || "Unknown Hostel"}
      </td>
      <td className="px-6 py-4 text-center text-gray-700">{booking.people}</td>
      <td className="px-6 py-4 text-center">
        <span className={getPaymentBadge()}>{getPaymentLabel()}</span>
        {(livePaymentStatus === "rejected" || livePaymentStatus === "payment-rejected") && booking.paymentRejectionReason && (
          <p className="text-xs text-red-500 mt-1">{booking.paymentRejectionReason}</p>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={getStatusBadge()}>
          {liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-gray-600">{formattedDate}</td>
      <td className="px-6 py-4 text-center">
        <ActionButtons />
      </td>
    </tr>
  );
}
