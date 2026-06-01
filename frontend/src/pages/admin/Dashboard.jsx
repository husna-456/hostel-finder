import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, UserCog, Building2, CalendarCheck, CalendarX,
  MessageSquare, CalendarDays, TrendingUp, DollarSign,
} from "lucide-react";

const PIE_COLORS = ["#22c55e", "#ef4444"];

function KPICard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient("/dashboard/admin")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const {
    stats = {},
    weeklyData = [],
    trendData = [],
    topHostels = [],
    pieData = [{ name: "Accepted", value: 0 }, { name: "Rejected", value: 0 }],
  } = data || {};

  const kpis = [
    { label: "Total Users",        value: stats.users         || 0, icon: Users,          color: "bg-blue-500" },
    { label: "Total Owners",       value: stats.owners        || 0, icon: UserCog,         color: "bg-purple-500" },
    { label: "Total Hostels",      value: stats.hostels       || 0, icon: Building2,       color: "bg-green-500" },
    { label: "Total Bookings",     value: stats.totalBookings || 0, icon: CalendarCheck,   color: "bg-indigo-500" },
    { label: "Pending Bookings",   value: stats.pending       || 0, icon: CalendarDays,    color: "bg-amber-500" },
    { label: "Reserved",           value: stats.reserved      || 0, icon: TrendingUp,      color: "bg-emerald-500" },
    { label: "Cancelled",          value: stats.cancelled     || 0, icon: CalendarX,       color: "bg-red-500" },
    { label: "Total Chats",        value: stats.conversations || 0, icon: MessageSquare,   color: "bg-pink-500" },
    { label: "Today's Bookings",   value: stats.todayBookings || 0, icon: CalendarDays,    color: "bg-orange-500" },
    { label: "Revenue (PKR)",      value: `${(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-teal-500" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Row 1: Weekly Bookings + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Bookings This Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Acceptance vs Rejection Rate">
          <div className="flex items-center justify-center gap-8 h-[220px]">
            <PieChart width={180} height={180}>
              <Pie data={pieData} cx={85} cy={85} outerRadius={80} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">Accepted: {pieData[0]?.value || 0}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">Rejected: {pieData[1]?.value || 0}%</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Trend */}
      <ChartCard title="Bookings & Cancellations Trend (Last 6 Months)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings"      stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 3: Top Hostels */}
      {topHostels.length > 0 && (
        <ChartCard title="Top Performing Hostels">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topHostels} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
