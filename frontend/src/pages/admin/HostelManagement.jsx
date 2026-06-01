import { useState } from "react";
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Ban, Eye, MapPin } from "lucide-react";

const initialHostels = [
  { id: 1, name: "Elite Hostel",     price: "Rs. 8,000 - 15,000",  owner: "Muhammad Ali", location: "Karachi, Sindh",  rooms: 25, seats: 8,  bookings: 234, status: "approved" },
  { id: 2, name: "Royal Inn",        price: "Rs. 10,000 - 18,000", owner: "Ayesha Khan",  location: "Lahore, Punjab",  rooms: 30, seats: 12, bookings: 198, status: "approved" },
  { id: 3, name: "Student Paradise", price: "Rs. 6,000 - 10,000",  owner: "Imran Sheikh", location: "Islamabad",       rooms: 20, seats: 5,  bookings: 145, status: "pending" },
  { id: 4, name: "Comfort Stay",     price: "Rs. 7,500 - 12,000",  owner: "Fatima Noor",  location: "Multan, Punjab",  rooms: 18, seats: 3,  bookings: 98,  status: "pending" },
  { id: 5, name: "Green Hostel",     price: "Rs. 5,000 - 9,000",   owner: "Usman Raza",   location: "Faisalabad",      rooms: 15, seats: 0,  bookings: 76,  status: "approved" },
  { id: 6, name: "City Lodge",       price: "Rs. 4,000 - 7,000",   owner: "Sana Malik",   location: "Karachi, Sindh",  rooms: 12, seats: 2,  bookings: 34,  status: "blocked" },
];

const TABS = ["All Hostels", "Pending", "Approved", "Blocked"];

const statusColors = {
  approved: "bg-gray-800 text-white",
  pending:  "bg-yellow-100 text-yellow-700",
  blocked:  "bg-red-100 text-red-600",
};

export default function HostelManagement() {
  const [hostels, setHostels] = useState(initialHostels);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All Hostels");
  const [openMenu, setOpenMenu] = useState(null);

  const changeStatus = (id, newStatus) => {
    setHostels((prev) => prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h)));
    setOpenMenu(null);
  };

  const filtered = hostels.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.owner.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "All Hostels" ||
      (tab === "Pending" && h.status === "pending") ||
      (tab === "Approved" && h.status === "approved") ||
      (tab === "Blocked" && h.status === "blocked");
    return matchSearch && matchTab;
  });

  const counts = {
    Pending:  hostels.filter(h => h.status === "pending").length,
    Approved: hostels.filter(h => h.status === "approved").length,
    Blocked:  hostels.filter(h => h.status === "blocked").length,
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Hostels",    value: hostels.length, color: "text-gray-800" },
          { label: "Approved",         value: counts.Approved, color: "text-green-600" },
          { label: "Pending Approval", value: counts.Pending,  color: "text-yellow-500" },
          { label: "Blocked",          value: counts.Blocked,  color: "text-red-500" },
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
            placeholder="Search by name, location, or owner..."
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
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              tab === t
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t}
            {t !== "All Hostels" && counts[t] != null && ` (${counts[t]})`}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">Hostel</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Rooms</th>
                <th className="text-left px-4 py-3 font-medium">Bookings</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{h.name}</p>
                    <p className="text-gray-400 text-xs">{h.price}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{h.owner}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-600 text-xs">
                      <MapPin size={11} className="text-gray-400 shrink-0" /> {h.location}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{h.rooms}</td>
                  <td className="px-4 py-3 text-gray-700">{h.bookings}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[h.status]}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === h.id ? null : h.id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {openMenu === h.id && (
                      <div className="absolute right-6 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-44 py-1">
                        {h.status !== "approved" && <button onClick={() => changeStatus(h.id, "approved")} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-green-600"><CheckCircle size={14} /> Approve</button>}
                        {h.status !== "blocked" && <button onClick={() => changeStatus(h.id, "blocked")} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-red-500"><Ban size={14} /> Block</button>}
                        {h.status === "blocked" && <button onClick={() => changeStatus(h.id, "approved")} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-blue-500"><CheckCircle size={14} /> Unblock</button>}
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
        {filtered.map((h) => (
          <div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{h.name}</p>
                <p className="text-xs text-gray-400">{h.price}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusColors[h.status]}`}>
                {h.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Owner: <strong className="text-gray-700">{h.owner}</strong></span>
              <span>Rooms: <strong className="text-gray-700">{h.rooms}</strong></span>
              <span>Bookings: <strong className="text-gray-700">{h.bookings}</strong></span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
              <MapPin size={11} /> {h.location}
            </p>
            <div className="flex gap-2">
              {h.status !== "approved" && (
                <button onClick={() => changeStatus(h.id, "approved")} className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition">Approve</button>
              )}
              {h.status !== "blocked" ? (
                <button onClick={() => changeStatus(h.id, "blocked")} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">Block</button>
              ) : (
                <button onClick={() => changeStatus(h.id, "approved")} className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition">Unblock</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}