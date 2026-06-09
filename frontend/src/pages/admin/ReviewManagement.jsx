import { useState, useEffect, useCallback } from "react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Star, CheckCircle2, XCircle, Clock, Trash2, Search, Filter,
  MessageSquare, TrendingUp, Eye,
} from "lucide-react";

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} fill={n <= value ? "#facc15" : "#e5e7eb"} stroke="none" />
      ))}
    </div>
  );
}

const STATUS_STYLES = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const loadStats = () =>
    fetchClient("/reviews/stats").then(setStats).catch(() => {});

  const loadReviews = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);

    fetchClient(`/reviews?${params}`)
      .then(({ reviews: list, pages }) => {
        setReviews(list || []);
        setTotalPages(pages || 1);
      })
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleApprove = async (id) => {
    try {
      await fetchClient(`/reviews/${id}/approve`, { method: "PATCH" });
      toast.success("Review approved");
      loadReviews();
      loadStats();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await fetchClient(`/reviews/${id}/reject`, { method: "PATCH" });
      toast.success("Review rejected");
      loadReviews();
      loadStats();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9333ea",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await fetchClient(`/reviews/admin/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      loadReviews();
      loadStats();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const statCards = [
    { label: "Total",    value: stats.total,    color: "bg-purple-500", Icon: MessageSquare },
    { label: "Pending",  value: stats.pending,  color: "bg-amber-500",  Icon: Clock },
    { label: "Approved", value: stats.approved, color: "bg-green-500",  Icon: CheckCircle2 },
    { label: "Rejected", value: stats.rejected, color: "bg-red-500",    Icon: XCircle },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user, hostel, or review text..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400 shrink-0" />
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition capitalize ${
                  statusFilter === s ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-50 animate-pulse flex gap-4">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="w-20 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <Star size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Hostel</th>
                    <th className="px-5 py-3 text-left">Rating</th>
                    <th className="px-5 py-3 text-left">Review</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">{r.userId?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{r.userId?.email || ""}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs max-w-[120px] truncate">
                        {r.hostelId?.name || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <StarDisplay value={r.rating} />
                      </td>
                      <td className="px-5 py-4 max-w-[240px]">
                        <p className={`text-gray-600 text-xs leading-relaxed ${expandedId === r._id ? "" : "line-clamp-2"}`}>
                          {r.reviewText}
                        </p>
                        {r.reviewText?.length > 100 && (
                          <button
                            onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                            className="text-purple-500 text-xs font-medium mt-0.5 flex items-center gap-1"
                          >
                            <Eye size={11} />
                            {expandedId === r._id ? "Less" : "More"}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || ""}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          {r.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(r._id)}
                              title="Approve"
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => handleReject(r._id)}
                              title="Reject"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r._id)}
                            title="Delete"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {reviews.map((r) => (
                <div key={r._id} className="px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.userId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{r.hostelId?.name || "Platform review"}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </div>
                  <StarDisplay value={r.rating} />
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{r.reviewText}</p>
                  <div className="flex gap-2 pt-1">
                    {r.status !== "approved" && (
                      <button onClick={() => handleApprove(r._id)} className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg">
                        Approve
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button onClick={() => handleReject(r._id)} className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">
                        Reject
                      </button>
                    )}
                    <button onClick={() => handleDelete(r._id)} className="flex-1 py-1.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
