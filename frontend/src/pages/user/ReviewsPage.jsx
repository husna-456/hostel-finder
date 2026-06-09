import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Star, PenLine, Trash2, Clock, CheckCircle2, XCircle, Plus, Building2, MapPin } from "lucide-react";

const STATUS_BADGE = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700",  Icon: Clock },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700",  Icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700",      Icon: XCircle },
};

function StarRating({ value, onChange, readonly = false, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            size={size}
            fill={(hovered || value) >= n ? "#facc15" : "#e5e7eb"}
            stroke="none"
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ initial, bookedHostels, reviewedHostelIds, onSubmit, onCancel, loading }) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [text, setText] = useState(initial?.reviewText || "");
  const [hostelId, setHostelId] = useState(initial?.hostelId?._id || initial?.hostelId || "");

  // Available options: hostels not yet reviewed (plus current hostel if editing)
  const alreadyReviewed = new Set(reviewedHostelIds);
  const availableHostels = bookedHostels.filter(
    (h) => !alreadyReviewed.has(h._id) || h._id === hostelId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a star rating");
    if (!text.trim()) return toast.error("Please write your review");
    onSubmit({ rating, reviewText: text.trim(), hostelId: hostelId || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hostel selector — disabled when editing (can't change hostel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Hostel <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">Select the hostel you're reviewing, or leave blank for a general platform review</p>
        <select
          value={hostelId}
          onChange={(e) => setHostelId(e.target.value)}
          disabled={!!initial}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">General Platform Review</option>
          {availableHostels.map((h) => (
            <option key={h._id} value={h._id}>{h.name} — {h.address || h.type}</option>
          ))}
          {/* If editing and hostel not in list (e.g. no bookings loaded), still show it */}
          {initial?.hostelId && !availableHostels.find(h => h._id === (initial.hostelId?._id || initial.hostelId)) && (
            <option value={initial.hostelId?._id || initial.hostelId}>
              {initial.hostelId?.name || "Selected Hostel"}
            </option>
          )}
        </select>
        {initial && (
          <p className="text-xs text-amber-600 mt-1">Hostel cannot be changed when editing a review.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={hostelId
            ? "Share your experience with this hostel — rooms, facilities, management, location..."
            : "Share your overall experience with the HostelFinder platform..."
          }
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{text.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : initial ? "Update Review" : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [bookedHostels, setBookedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchClient("/reviews/my"),
      fetchClient("/bookings/my"),
    ])
      .then(([reviewData, bookingData]) => {
        setReviews(Array.isArray(reviewData) ? reviewData : []);

        // Extract unique hostels from bookings
        const seen = new Set();
        const hostels = [];
        (Array.isArray(bookingData) ? bookingData : bookingData?.bookings || []).forEach((b) => {
          const h = b.hostelId;
          if (h && h._id && !seen.has(h._id)) {
            seen.add(h._id);
            hostels.push(h);
          }
        });
        setBookedHostels(hostels);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    try {
      setSubmitting(true);
      await fetchClient("/reviews", { method: "POST", body: JSON.stringify(form) });
      toast.success("Review submitted for approval!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      setSubmitting(true);
      await fetchClient(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(form) });
      toast.success("Review updated and re-submitted for approval");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9333ea",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await fetchClient(`/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  // IDs of hostels the user has already reviewed (to exclude from new review dropdown)
  const reviewedHostelIds = reviews
    .map((r) => r.hostelId?._id || r.hostelId)
    .filter(Boolean);

  // Can still write a new review if they have un-reviewed hostels OR haven't written a general review
  const hasGeneralReview = reviews.some((r) => !r.hostelId);
  const unreviewedHostels = bookedHostels.filter((h) => !reviewedHostelIds.includes(h._id));
  const canWriteMore = unreviewedHostels.length > 0 || !hasGeneralReview;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Share your experience to help other students</p>
        </div>
        {!showForm && canWriteMore && !loading && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition"
          >
            <Plus size={16} /> Write Review
          </button>
        )}
      </div>

      {/* New review form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">Write a Review</h2>
          <p className="text-xs text-gray-400 mb-5">
            Your review will be visible on the homepage after admin approval.
          </p>
          <ReviewForm
            bookedHostels={bookedHostels}
            reviewedHostelIds={reviewedHostelIds}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={submitting}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-2/5" />
              <div className="flex gap-1">{[...Array(5)].map((_, j) => <div key={j} className="w-5 h-5 bg-gray-200 rounded" />)}</div>
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Star size={48} className="text-purple-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-5">Share your experience with other students</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition text-sm"
          >
            Write Your First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
            const hostelName = r.hostelId?.name;
            const hostelAddr = r.hostelId?.address;
            return (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Hostel name banner */}
                <div className={`px-5 py-3 flex items-center gap-2 ${hostelName ? "bg-purple-50 border-b border-purple-100" : "bg-gray-50 border-b border-gray-100"}`}>
                  <Building2 size={15} className={hostelName ? "text-purple-500 shrink-0" : "text-gray-400 shrink-0"} />
                  <div className="min-w-0">
                    {hostelName ? (
                      <>
                        <p className="text-sm font-bold text-purple-700 truncate">{hostelName}</p>
                        {hostelAddr && (
                          <p className="text-xs text-purple-400 flex items-center gap-1 truncate">
                            <MapPin size={10} /> {hostelAddr}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-gray-500">General Platform Review</p>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {editingId === r._id ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-700 mb-4">Edit Review</h3>
                      <ReviewForm
                        initial={r}
                        bookedHostels={bookedHostels}
                        reviewedHostelIds={reviewedHostelIds}
                        onSubmit={(form) => handleUpdate(r._id, form)}
                        onCancel={() => setEditingId(null)}
                        loading={submitting}
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <StarRating value={r.rating} readonly />
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                          <badge.Icon size={12} /> {badge.label}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.reviewText}"</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {r.status !== "approved" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(r._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition"
                            >
                              <PenLine size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
