import { useState, useEffect } from "react";
import { fetchClient } from "../api/fetchClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PendingPayments from "../components/PendingPayments";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient("/dashboard/owner")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { stats = {}, recentBookings = [], chartData = [], hostelStats = [] } = data || {};

  const statCards = [
    { label: "My Hostels",   value: stats.totalHostels  || 0, color: "bg-purple-500" },
    { label: "Total Bookings",value: stats.totalBookings || 0, color: "bg-blue-500" },
    { label: "Pending",       value: stats.pending       || 0, color: "bg-amber-500" },
    { label: "Accepted",      value: stats.accepted      || 0, color: "bg-green-500" },
    { label: "Reserved",      value: stats.reserved      || 0, color: "bg-emerald-500" },
    { label: "Revenue (PKR)", value: `${(stats.revenue || 0).toLocaleString()}`, color: "bg-indigo-500" },
  ];

  const statusStyle = (s) =>
    s === "accepted" || s === "reserved" ? "bg-green-100 text-green-700" :
    s === "pending"  ? "bg-amber-100 text-amber-700" :
    s === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your properties today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-8 h-8 ${s.color} rounded-lg mb-2`} />
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Hostel Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Monthly Bookings Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="bookings" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Hostels by Bookings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Hostels by Bookings</h3>
          {hostelStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hostel data yet</p>
          ) : (
            <div className="space-y-3">
              {hostelStats.slice(0, 5).map((h) => (
                <div key={h.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate">{h.name}</span>
                    <span className="text-purple-600 font-bold ml-2">{h.bookings}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (h.bookings / (hostelStats[0]?.bookings || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Recent Booking Requests</h3>
          <a href="/hostel_owner/bookings" className="text-sm text-purple-600 hover:underline font-medium">View All</a>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Guest</th>
                <th className="px-6 py-3 text-left">Hostel</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
              ) : recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{b.userId?.name || b.name || "—"}</p>
                    <p className="text-xs text-gray-400">{b.userId?.email || b.email || ""}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.hostelId?.name || "—"}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {recentBookings.map((b) => (
            <div key={b._id} className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{b.userId?.name || b.name || "—"}</p>
                <p className="text-xs text-gray-400 truncate">{b.hostelId?.name || "—"}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusStyle(b.status)}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Payments */}
      <PendingPayments />
    </div>
  );
}
