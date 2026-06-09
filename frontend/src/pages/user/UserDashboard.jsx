import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import {
  Home, Clock, MessageSquare, Plus, List,
  BookOpen, CalendarCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

function Avatar({ name }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-rose-500", "bg-amber-500"];
  return (
    <div className={`w-8 h-8 text-xs ${colors[name.charCodeAt(0) % colors.length]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    accepted:  "bg-green-100 text-green-700",
    reserved:  "bg-emerald-100 text-emerald-700",
    pending:   "bg-yellow-100 text-yellow-700",
    rejected:  "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export default function UserDashboard() {
  const [userName, setUserName] = useState("User");
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ activeStays: 0, pending: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchClient("/dashboard/user");
        const name = data.user?.name || "User";
        setUserName(name);
        setStats({
          activeStays: data.stats?.accepted || 0,
          pending:     data.stats?.pending  || 0,
          messages:    0,
        });
        setRecentBookings(data.recentBookings || []);
        setChartData(data.chartData || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const statCards = [
    { icon: Home,         label: "Active Stays", value: String(stats.activeStays).padStart(2,"0"), color: "bg-purple-500" },
    { icon: Clock,        label: "Pending",       value: String(stats.pending).padStart(2,"0"),     color: "bg-amber-500" },
    { icon: MessageSquare,label: "Messages",      value: String(stats.messages).padStart(2,"0"),    color: "bg-sky-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {userName}.</p>
        </div>
        <button
          onClick={() => navigate("/user/book-hostel")}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#f5f3ff" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "13px" }}
              />
              <Bar dataKey="bookings" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { icon: BookOpen,      label: "Book a Hostel",  color: "bg-purple-50 text-purple-600", path: "/user/book-hostel" },
              { icon: CalendarCheck, label: "My Bookings",    color: "bg-blue-50 text-blue-600",     path: "/user/my-bookings" },
              { icon: MessageSquare, label: "Messages",       color: "bg-sky-50 text-sky-600",       path: "/user/chat" },
              { icon: List,          label: "Browse Hostels", color: "bg-amber-50 text-amber-600",   path: "/user/hostel-listing" },
            ].map(({ icon: Icon, label, color, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Recent Bookings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your latest hostel reservations</p>
          </div>
          <button
            onClick={() => navigate("/user/my-bookings")}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition"
          >
            View All
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No bookings yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    {["Guest", "Hostel", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={b.name || userName} />
                          <span className="font-medium text-gray-800">{b.name || userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{b.hostelId?.name || "—"}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(b.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {recentBookings.map((b) => (
                <div key={b._id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={b.name || userName} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{b.hostelId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
