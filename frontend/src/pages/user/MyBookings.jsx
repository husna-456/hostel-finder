import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import BookingRow from "../../components/BookingRow";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchClient } from "../../api/fetchClient";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchClient("/bookings/my");
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelSuccess = (deletedId) => {
    setBookings((prev) => prev.filter((b) => b._id !== deletedId));
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter || b.paymentStatus === filter);

  const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
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
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-gray-500 text-sm mt-1">View and manage your hostel bookings</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.key
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100"
            >
              <Calendar className="w-20 h-20 text-purple-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {filter !== "all"
                  ? `No ${filter} bookings available.`
                  : "You haven't made any bookings yet. Start by exploring hostels!"}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-purple-900">Hostel</th>
                        <th className="px-6 py-4 text-center font-semibold text-purple-900">People</th>
                        <th className="px-6 py-4 text-center font-semibold text-purple-900">Payment</th>
                        <th className="px-6 py-4 text-center font-semibold text-purple-900">Status</th>
                        <th className="px-6 py-4 text-center font-semibold text-purple-900">Booked On</th>
                        <th className="px-6 py-4 text-center font-semibold text-purple-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((booking) => (
                        <BookingRow
                          key={booking._id}
                          booking={booking}
                          onCancelSuccess={handleCancelSuccess}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filtered.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    onCancelSuccess={handleCancelSuccess}
                    mobile
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
