import { useState } from "react";
import { Search, Filter, MoreVertical, XCircle, Eye } from "lucide-react";

const initialBookings = [
  { id: "BKG-2024-001", date: "2024-01-15", user: "Ahmed Khan",   email: "ahmed@example.com",  hostel: "Elite Hostel",     owner: "Muhammad Ali", roomType: "Single AC",  from: "2024-02-01", to: "2024-07-31", amount: "Rs. 45,000", status: "confirmed", payment: "paid" },
  { id: "BKG-2024-002", date: "2024-01-20", user: "Bilal Hassan", email: "bilal@example.com",  hostel: "Royal Inn",        owner: "Ayesha Khan",  roomType: "Double AC",  from: "2024-02-15", to: "2024-08-15", amount: "Rs. 54,000", status: "confirmed", payment: "paid" },
  { id: "BKG-2024-003", date: "2024-02-01", user: "Zara Ahmed",   email: "zara@example.com",   hostel: "Student Paradise", owner: "Imran Sheikh", roomType: "Single Non-AC", from: "2024-03-01", to: "2024-09-01", amount: "Rs. 36,000", status: "pending",   payment: "unpaid" },
  { id: "BKG-2024-004", date: "2024-02-10", user: "Hassan Ali",   email: "hassan@example.com", hostel: "Comfort Stay",     owner: "Fatima Noor",  roomType: "Double Non-AC", from: "2024-03-01", to: "2024-06-01", amount: "Rs. 22,500", status: "completed", payment: "paid" },
  { id: "BKG-2024-005", date: "2024-02-15", user: "Sara Malik",   email: "sara@example.com",   hostel: "Green Hostel",     owner: "Usman Raza",   roomType: "Single AC",  from: "2024-03-01", to: "2024-05-01", amount: "Rs. 14,000", status: "cancelled", payment: "refunded" },
];

const TABS = ["All Bookings", "Pending", "Confirmed", "Completed", "Cancelled"];

const statusStyle = {
  confirmed: "bg-gray-800 text-white",
  pending:   "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const paymentStyle = {
  paid:     "bg-gray-800 text-white",
  unpaid:   "bg-orange-100 text-orange-600",
  refunded: "bg-blue-100 text-blue-600",
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All Bookings");
  const [openMenu, setOpenMenu] = useState(null);

  const forceCancel = (id) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    setOpenMenu(null);
  };

  const counts = {
    Pending:   bookings.filter(b => b.status === "pending").length,
    Confirmed: bookings.filter(b => b.status === "confirmed").length,
    Completed: bookings.filter(b => b.status === "completed").length,
    Cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.user.toLowerCase().includes(search.toLowerCase()) ||
      b.hostel.toLowerCase().includes(search.toLowerCase());
    const tabKey = tab.replace("All Bookings", "").trim();
    const matchTab = tab === "All Bookings" || b.status === tabKey.toLowerCase();
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length, color: "text-gray-800" },
          { label: "Pending",        value: counts.Pending,   color: "text-yellow-500" },
          { label: "Confirmed",      value: counts.Confirmed, color: "text-blue-600" },
          { label: "Completed",      value: counts.Completed, color: "text-green-600" },
          { label: "Cancelled",      value: counts.Cancelled, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, user, or hostel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => {
          const key = t.replace("All Bookings", "").trim();
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tab === t
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t}{counts[key] != null ? ` (${counts[key]})` : ""}
            </button>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">Booking ID</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Hostel</th>
                <th className="text-left px-4 py-3 font-medium">Room</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800 text-xs">{b.id}</p>
                    <p className="text-gray-400 text-xs">{b.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.user}</p>
                    <p className="text-gray-400 text-xs">{b.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.hostel}</p>
                    <p className="text-gray-400 text-xs">{b.owner}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{b.roomType}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{b.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentStyle[b.payment]}`}>{b.payment}</span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {openMenu === b.id && (
                      <div className="absolute right-6 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-44 py-1">
                        {b.status !== "cancelled" && (
                          <button onClick={() => forceCancel(b.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-500">
                            <XCircle size={14} /> Force Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{b.user}</p>
                <p className="text-xs text-gray-400">{b.hostel}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusStyle[b.status]}`}>
                {b.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Room: <strong className="text-gray-700">{b.roomType}</strong></span>
              <span>Amount: <strong className="text-gray-700">{b.amount}</strong></span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${paymentStyle[b.payment]}`}>{b.payment}</span>
            </div>
            {b.status !== "cancelled" && (
              <button
                onClick={() => forceCancel(b.id)}
                className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
              >
                Force Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}