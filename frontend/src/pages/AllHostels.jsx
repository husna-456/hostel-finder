import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import HostelCard from "../components/HostelCard";
import SlideText from "../components/SlideText";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { ChevronRight } from "lucide-react";

export default function AllHostels({ userPanel = false }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isUserPanel = userPanel || location.pathname.startsWith("/user/");

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const hostelsPerPage = 6;

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${BASE}/hostels/list`)
      .then(r => r.json())
      .then(data => setHostels(Array.isArray(data) ? data : []))
      .catch(() => setHostels([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? hostels.filter(h =>
        h.name?.toLowerCase().includes(search.toLowerCase()) ||
        h.location?.area?.toLowerCase().includes(search.toLowerCase()) ||
        h.address?.toLowerCase().includes(search.toLowerCase())
      )
    : hostels;

  const indexOfLast   = page * hostelsPerPage;
  const indexOfFirst  = indexOfLast - hostelsPerPage;
  const currentHostels = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages    = Math.ceil(filtered.length / hostelsPerPage);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      {/* ── Banner: public route only ── */}
      {!isUserPanel ? (
        <div className="relative h-48 md:h-80 flex items-center justify-center overflow-hidden">
          <img
            src="/images/hostels-banner.jpg"
            alt="Hostels in Gujranwala"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 z-10" />
          <div className="relative text-center text-white z-20 space-y-3 px-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">Hostels in Gujranwala</h1>
            <SlideText
              text="Find the best hostels in Gujranwala for students and professionals"
              className="text-sm md:text-lg font-medium text-white/90"
              speed={10}
            />
          </div>
        </div>
      ) : (
        /* ── User panel: minimal header ── */
        <div className="px-4 md:px-6 pt-6 pb-2">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <button onClick={() => navigate("/user/dashboard")} className="hover:text-purple-600 transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">Browse Hostels</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Find Your Perfect Hostel</h1>
          <p className="text-sm text-gray-500 mt-1">Browse verified hostels across Gujranwala</p>
        </div>
      )}

      {/* Search bar */}
      <div className={`max-w-7xl mx-auto px-4 md:px-6 ${!isUserPanel ? "-mt-5 relative z-20" : "mt-4"}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-4 flex items-center gap-3">
          <FaSearch className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search hostels by name or location..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {currentHostels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {currentHostels.map((h, i) => (
              <motion.div key={h._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <HostelCard hostel={h} userPanel={isUserPanel} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <FaSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {search ? "No hostels match your search" : "No hostels available"}
            </h3>
            <p className="text-gray-400">{search ? "Try a different search term." : "Check back later for new listings."}</p>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-10 flex-wrap px-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`text-sm px-4 py-2 rounded-xl font-semibold border transition-all ${
                page === i + 1
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {!isUserPanel && (
        <div className="flex justify-center pb-10">
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium">
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
