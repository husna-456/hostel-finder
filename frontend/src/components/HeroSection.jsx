import SearchBox from "./SearchBox";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const CITIES = ["Rawalpindi", "Islamabad", "Lahore", "Karachi", "Peshawar", "Multan"];

export default function HeroSection({ onSearch, bannerImage }) {
  const bgImage = bannerImage || "/banner.jpg";
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    if (!onSearch) return;
    const t = setInterval(() => setCityIndex(i => (i + 1) % CITIES.length), 2800);
    return () => clearInterval(t);
  }, [onSearch]);

  return (
    <section
      className="relative bg-cover bg-center text-white overflow-hidden"
      style={{ backgroundImage: `url('${bgImage}')`, minHeight: onSearch ? "600px" : "280px" }}
    >
      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />

      {/* Subtle noise/grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center" style={{ minHeight: onSearch ? "600px" : "280px" }}>
        {onSearch ? (
          <>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-purple-600/25 backdrop-blur-sm border border-purple-400/30 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
              Pakistan's #1 Hostel Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-3"
            >
              Find Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                  Perfect Hostel
                </span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                >
                  <motion.path
                    d="M0 8 Q75 2 150 8 Q225 14 300 8"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </motion.h1>

            {/* Animated City Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mb-10 mt-4"
            >
              <span className="text-white/60 text-lg">Near</span>
              <div className="overflow-hidden h-8 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cityIndex}
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -32, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-purple-300 font-extrabold text-lg block"
                  >
                    {CITIES[cityIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-white/60 text-lg">& more cities</span>
            </motion.div>

            {/* SearchBox */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="w-full"
            >
              <SearchBox onSearch={onSearch} />
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-center gap-10 mt-10 flex-wrap"
            >
              {[["500+", "Hostels"], ["10K+", "Students Placed"], ["50+", "Cities Covered"]].map(([num, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="text-2xl font-extrabold text-white leading-none">{num}</p>
                  <p className="text-white/45 text-xs mt-1 tracking-wide">{lbl}</p>
                </div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-left"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-white pt-3 mb-4">
              SEARCH RESULTS
            </h1>
          </motion.div>
        )}
      </div>
    </section>
  );
}
