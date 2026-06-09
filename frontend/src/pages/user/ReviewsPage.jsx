import { useState, useEffect, useRef } from "react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Star, PenLine, Trash2, Clock, CheckCircle2, XCircle,
  Plus, Building2, MapPin, Search, ChevronDown, X,
} from "lucide-react";

const STATUS_BADGE = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700",  Icon: Clock },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700",  Icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700",      Icon: XCircle },
};

const TYPE_LABEL = {
  boys:   { label: "Boys",   cls: "bg-blue-100 text-blue-700" },
  girls:  { label: "Girls",  cls: "bg-pink-100 text-pink-700" },
  mixed:  { label: "Mixed",  cls: "bg-teal-100 text-teal-700" },
  family: { label: "Family", cls: "bg-orange-100 text-orange-700" },
};

/* ─── Searchable hostel dropdown ─────────────────────────────────────────── */
function HostelSelect({ value, onChange, allHostels, reviewedHostelIds, disabled }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const containerRef          = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const reviewed = new Set(reviewedHostelIds);
  const filtered = allHostels.filter((h) => {
    const alreadyDone = reviewed.has(h._id) && h._id !== value;
    const matchQ      = !query || h.name.toLowerCase().includes(query.toLowerCase()) ||
                        (h.address || "").toLowerCase().includes(query.toLowerCase());
    return !alreadyDone && matchQ;
  });

  const selected = allHostels.find((h) => h._id === value);
  const typeInfo = selected ? (TYPE_LABEL[selected.type] || TYPE_LABEL.boys) : null;

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  if (disabled) {
    return (
      <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
        <Building2 size={14} className="text-gray-400 shrink-0" />
        {selected ? (
          <span className="truncate">{selected.name}{selected.address ? ` · ${selected.address}` : ""}</span>
        ) : (
          <span className="text-gray-400">General Platform Review</span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-left flex items-center gap-2 transition focus:outline-none
          ${open ? "border-purple-400 ring-2 ring-purple-100" : "border-gray-300 hover:border-purple-300"}`}
      >
        {selected ? (
          <>
            <Building2 size={14} className="text-purple-500 shrink-0" />
            <span className="flex-1 truncate font-medium text-gray-800">{selected.name}</span>
            {typeInfo && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeInfo.cls}`}>
                {typeInfo.label}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSelect(""); }}
              className="p-0.5 text-gray-400 hover:text-gray-600 transition shrink-0"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <Building2 size={14} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-gray-400">General Platform Review</span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:bg-white transition">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hostel name or location..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {/* General option */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-purple-50 transition
                  ${!value ? "bg-purple-50" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Star size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className={`font-semibold ${!value ? "text-purple-700" : "text-gray-700"}`}>General Platform Review</p>
                  <p className="text-xs text-gray-400">Not about a specific hostel</p>
                </div>
                {!value && <CheckCircle2 size={14} className="text-purple-500 ml-auto shrink-0" />}
              </button>
            </li>

            {/* Divider */}
            <li className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 mt-1">
              All Hostels ({filtered.length})
            </li>

            {filtered.length === 0 ? (
              <li className="px-4 py-4 text-sm text-gray-400 text-center">No hostels found</li>
            ) : (
              filtered.map((h) => {
                const t = TYPE_LABEL[h.type] || TYPE_LABEL.boys;
                const isSelected = h._id === value;
                return (
                  <li key={h._id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(h._id)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50 transition
                        ${isSelected ? "bg-purple-50" : ""}`}
                    >
                      {/* Hostel image or icon */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-purple-100">
                        {h.images?.[0] ? (
                          <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={14} className="text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-purple-700" : "text-gray-800"}`}>
                          {h.name}
                        </p>
                        {h.address && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate mt-0.5">
                            <MapPin size={10} className="shrink-0" /> {h.address}
                          </p>
                        )}
                      </div>

                      {/* Type badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${t.cls}`}>
                        {t.label}
                      </span>

                      {isSelected && <CheckCircle2 size={14} className="text-purple-500 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Star rating ─────────────────────────────────────────────────────────── */
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
          <Star size={size} fill={(hovered || value) >= n ? "#facc15" : "#e5e7eb"} stroke="none" />
        </button>
      ))}
    </div>
  );
}

/* ─── Review form ─────────────────────────────────────────────────────────── */
function ReviewForm({ initial, allHostels, reviewedHostelIds, onSubmit, onCancel, loading }) {
  const [rating,   setRating]   = useState(initial?.rating || 0);
  const [text,     setText]     = useState(initial?.reviewText || "");
  const [hostelId, setHostelId] = useState(
    initial?.hostelId?._id || (typeof initial?.hostelId === "string" ? initial.hostelId : "") || ""
  );

  const isEditing = !!initial;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating)      return toast.error("Please select a star rating");
    if (!text.trim()) return toast.error("Please write your review");
    onSubmit({ rating, reviewText: text.trim(), hostelId: hostelId || null });
  };

  const selectedHostel = allHostels.find((h) => h._id === hostelId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hostel picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Select Hostel
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Choose a hostel to review, or select "General Platform Review" for an overall experience
        </p>
        <HostelSelect
          value={hostelId}
          onChange={setHostelId}
          allHostels={allHostels}
          reviewedHostelIds={reviewedHostelIds}
          disabled={isEditing}
        />
        {isEditing && (
          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
            Hostel cannot be changed when editing a review.
          </p>
        )}
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm font-bold text-purple-600">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={
            selectedHostel
              ? `Share your experience at ${selectedHostel.name} — rooms, facilities, management, location...`
              : "Share your overall experience with the HostelFinder platform..."
          }
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{text.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
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

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function ReviewsPage() {
  const [reviews,     setReviews]     = useState([]);
  const [allHostels,  setAllHostels]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchClient("/reviews/my"),
      fetchClient("/hostels/list"),
    ])
      .then(([reviewData, hostelData]) => {
        setReviews(Array.isArray(reviewData) ? reviewData : []);
        setAllHostels(Array.isArray(hostelData) ? hostelData : []);
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

  const reviewedHostelIds = reviews.map((r) => r.hostelId?._id || r.hostelId).filter(Boolean);
  const hasGeneralReview  = reviews.some((r) => !r.hostelId);
  const canWriteMore      = !hasGeneralReview || reviewedHostelIds.length < allHostels.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Share your hostel experience to help other students</p>
        </div>
        {!showForm && canWriteMore && !loading && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
          >
            <Plus size={16} /> Write Review
          </button>
        )}
      </div>

      {/* New review form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">Write a Review</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted reviews go live on the homepage after admin approval
              </p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 transition">
              <X size={18} />
            </button>
          </div>
          <ReviewForm
            allHostels={allHostels}
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
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-12 bg-purple-50" />
              <div className="p-5 space-y-3">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <div key={j} className="w-5 h-5 bg-gray-200 rounded" />)}</div>
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Star size={48} className="text-purple-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-5">Help other students by sharing your experience</p>
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
            const badge      = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
            const hostelName = r.hostelId?.name;
            const hostelAddr = r.hostelId?.address;
            const hostelType = r.hostelId?.type;
            const typeInfo   = hostelType ? (TYPE_LABEL[hostelType] || TYPE_LABEL.boys) : null;

            return (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Hostel banner */}
                <div className={`px-5 py-3 flex items-center gap-3 ${hostelName ? "bg-purple-50 border-b border-purple-100" : "bg-gray-50 border-b border-gray-100"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hostelName ? "bg-purple-100" : "bg-gray-200"}`}>
                    <Building2 size={15} className={hostelName ? "text-purple-600" : "text-gray-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {hostelName ? (
                      <>
                        <p className="text-sm font-bold text-purple-800 truncate">{hostelName}</p>
                        {hostelAddr && (
                          <p className="text-xs text-purple-400 flex items-center gap-1 truncate mt-0.5">
                            <MapPin size={10} className="shrink-0" /> {hostelAddr}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-gray-500">General Platform Review</p>
                    )}
                  </div>
                  {typeInfo && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeInfo.cls}`}>
                      {typeInfo.label}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  {editingId === r._id ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-700 mb-4">Edit Review</h3>
                      <ReviewForm
                        initial={r}
                        allHostels={allHostels}
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
