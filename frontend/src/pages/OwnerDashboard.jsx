import PendingPayments from "../components/PendingPayments";

const bookings = [
  { initials: "AJ", name: "Alex Johnson",  hostel: "Skyline Residence",  checkIn: "Sept 12, 2023", status: "Pending" },
  { initials: "SC", name: "Sarah Chen",    hostel: "Lavender Heights",   checkIn: "Sept 10, 2023", status: "Confirmed" },
  { initials: "MT", name: "Mark Taylor",   hostel: "The Urban Nest",     checkIn: "Sept 15, 2023", status: "Pending" },
];

const statusStyle = (status) =>
  status === "Confirmed"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">+12% vs last month</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">1,284</p>
          <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">3 New Units</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">42</p>
          <p className="text-sm text-gray-500 mt-1">Active Listings</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Occupancy Rate</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>

        {/* Premium Status */}
        <div className="bg-purple-600 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 rounded-full -translate-y-8 translate-x-8 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">Premium Status</span>
            </div>
            <h3 className="text-base font-bold mb-1">Property of the Month</h3>
            <p className="text-sm text-purple-200 leading-relaxed">
              Your hostel has been ranked #1 for student satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Booking Requests */}
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
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Hostel</th>
                <th className="px-6 py-3 text-left">Check In</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {b.initials}
                      </div>
                      <span className="font-medium text-gray-700">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{b.hostel}</td>
                  <td className="px-6 py-4 text-gray-500">{b.checkIn}</td>
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
          {bookings.map((b, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {b.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.hostel} · {b.checkIn}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusStyle(b.status)}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Payment Verifications */}
      <PendingPayments />
    </div>
  );
}
