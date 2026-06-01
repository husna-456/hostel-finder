import { useState } from "react";
import { Search, Filter, MoreVertical, ShieldOff, ShieldCheck, Eye } from "lucide-react";

const initialOwners = [
  { id: 1, name: "Muhammad Ali",  email: "ali@hostel.com",    contact: "+92 300 1234567", hostels: "3 / 3", totalBookings: 234, acceptanceRate: 85, responseTime: "2.5 hrs", status: "active" },
  { id: 2, name: "Ayesha Khan",   email: "ayesha@hostel.com", contact: "+92 301 7654321", hostels: "4 / 5", totalBookings: 456, acceptanceRate: 92, responseTime: "1.8 hrs", status: "active" },
  { id: 3, name: "Imran Sheikh",  email: "imran@hostel.com",  contact: "+92 302 9876543", hostels: "1 / 2", totalBookings: 145, acceptanceRate: 78, responseTime: "4.2 hrs", status: "suspended" },
  { id: 4, name: "Fatima Noor",   email: "fatima@hostel.com", contact: "+92 303 4567890", hostels: "2 / 2", totalBookings: 98,  acceptanceRate: 88, responseTime: "3.0 hrs", status: "active" },
];

function RateBar({ value }) {
  const color = value >= 90 ? "bg-green-500" : value >= 75 ? "bg-green-400" : "bg-yellow-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-600">{value}%</span>
    </div>
  );
}

export default function OwnerManagement() {
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setOwners((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "active" ? "suspended" : "active" }
          : o
      )
    );
    setOpenMenu(null);
  };

  const avgRate = Math.round(owners.reduce((s, o) => s + o.acceptanceRate, 0) / owners.length);

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Owners",     value: owners.length },
          { label: "Active Owners",    value: owners.filter(o => o.status === "active").length },
          { label: "Suspended Owners", value: owners.filter(o => o.status === "suspended").length },
          { label: "Avg Acceptance Rate", value: `${avgRate}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="text-left px-5 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Hostels</th>
                <th className="text-left px-4 py-3 font-medium">Bookings</th>
                <th className="text-left px-4 py-3 font-medium">Acceptance</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{o.name}</p>
                    <p className="text-gray-400 text-xs">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.contact}</td>
                  <td className="px-4 py-3 text-gray-700">{o.hostels}</td>
                  <td className="px-4 py-3 text-gray-700">{o.totalBookings}</td>
                  <td className="px-4 py-3"><RateBar value={o.acceptanceRate} /></td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === o.id ? null : o.id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {openMenu === o.id && (
                      <div className="absolute right-6 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-44 py-1">
                        <button onClick={() => toggleStatus(o.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                          {o.status === "active" ? <><ShieldOff size={14} className="text-red-500" /> Suspend</> : <><ShieldCheck size={14} className="text-green-500" /> Activate</>}
                        </button>
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
        {filtered.map((o) => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{o.name}</p>
                <p className="text-xs text-gray-400">{o.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${o.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {o.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
              <span>Hostels: <strong className="text-gray-700">{o.hostels}</strong></span>
              <span>Bookings: <strong className="text-gray-700">{o.totalBookings}</strong></span>
              <span>Acceptance: <strong className="text-gray-700">{o.acceptanceRate}%</strong></span>
            </div>
            <button
              onClick={() => toggleStatus(o.id)}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition ${o.status === "active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
            >
              {o.status === "active" ? "Suspend Owner" : "Activate Owner"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}