import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, UserCog, Building2, Home, Clock,
  CalendarCheck, CalendarX, CalendarRange, MessageSquare, CalendarDays,
} from "lucide-react";

// ── KPI Data ──────────────────────────────────────────────────────────────────
const kpis = [
  { label: "Total Users",       value: "2,847", change: "+12.5%", up: true,  icon: Users,          color: "bg-blue-500" },
  { label: "Total Owners",      value: "324",   change: "+8.2%",  up: true,  icon: UserCog,         color: "bg-purple-500" },
  { label: "Total Hostels",     value: "456",   change: "+15.3%", up: true,  icon: Building2,       color: "bg-green-500" },
  { label: "Active Hostels",    value: "398",   change: "87.3%",  up: true,  icon: Home,            color: "bg-teal-500" },
  { label: "Pending Hostels",   value: "58",    change: "-4.1%",  up: false, icon: Clock,           color: "bg-yellow-500" },
  { label: "Total Bookings",    value: "8,942", change: "+23.1%", up: true,  icon: CalendarCheck,   color: "bg-indigo-500" },
  { label: "Active Bookings",   value: "1,234", change: "+18.7%", up: true,  icon: CalendarRange,   color: "bg-cyan-500" },
  { label: "Cancelled Bookings",value: "342",   change: "-5.3%",  up: false, icon: CalendarX,       color: "bg-red-500" },
  { label: "Total Chats",       value: "15,672",change: "+31.2%", up: true,  icon: MessageSquare,   color: "bg-pink-500" },
  { label: "Today's Bookings",  value: "47",    change: "+9 from yesterday", up: true, icon: CalendarDays, color: "bg-orange-500" },
];

// ── Chart Data ─────────────────────────────────────────────────────────────────
const weeklyBookings = [
  { day: "Mon", bookings: 45 },
  { day: "Tue", bookings: 52 },
  { day: "Wed", bookings: 48 },
  { day: "Thu", bookings: 61 },
  { day: "Fri", bookings: 55 },
  { day: "Sat", bookings: 67 },
  { day: "Sun", bookings: 43 },
];

const pieData = [
  { name: "Accepted", value: 78 },
  { name: "Rejected", value: 22 },
];
const PIE_COLORS = ["#22c55e", "#ef4444"];

const trendData = [
  { month: "Jan", bookings: 540, cancellations: 40 },
  { month: "Feb", bookings: 612, cancellations: 52 },
  { month: "Mar", bookings: 820, cancellations: 60 },
  { month: "Apr", bookings: 870, cancellations: 75 },
  { month: "May", bookings: 920, cancellations: 80 },
  { month: "Jun", bookings: 1080, cancellations: 95 },
];

const chatActivity = [
  { day: "Mon", chats: 240 },
  { day: "Tue", chats: 265 },
  { day: "Wed", chats: 310 },
  { day: "Thu", chats: 300 },
  { day: "Fri", chats: 280 },
  { day: "Sat", chats: 210 },
  { day: "Sun", chats: 180 },
];

const topHostels = [
  { name: "Elite Hostel",     bookings: 234 },
  { name: "Royal Inn",        bookings: 198 },
  { name: "Student Paradise", bookings: 176 },
  { name: "Comfort Stay",     bookings: 145 },
  { name: "Green Hostel",     bookings: 128 },
];

// ── Components ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, change, up, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-green-500" : "text-red-500"}`}>
          <span>{up ? "↑" : "↓"}</span> {change}
        </p>
      </div>
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
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

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Row 1: Bookings This Week + Acceptance vs Rejection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Bookings This Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyBookings}>
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
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-green-600 font-medium">Accepted: 78%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">Rejected: 22%</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Trend + Chat Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Bookings & Cancellations Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="bookings" />
              <Line type="monotone" dataKey="cancellations" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="cancellations" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Chat Activity This Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chatActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="chats" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Top Performing Hostels */}
      <ChartCard title="Top Performing Hostels">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topHostels} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}