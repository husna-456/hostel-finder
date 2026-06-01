import {
  FaSignInAlt, FaUserPlus, FaBars, FaTimes,
  FaSearch, FaTachometerAlt, FaChevronDown,
} from "react-icons/fa";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/all-hostels", label: "All Hostels" },
  { to: "/advanced-search", label: "Advanced Search" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, role, lastAuthRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  console.log("Navbar Auth State:", { isAuthenticated, role, lastAuthRole, path: location.pathname });

  // Owner logged in → no navbar
  if (isAuthenticated && role === "hostel_owner") return null;

  const isOwnerLogout = !isAuthenticated && lastAuthRole === "hostel_owner";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5"
            : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-18">

          {/* ── LOGO ── */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
            <Link to="/" className="flex items-center gap-2 select-none group">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/50 group-hover:shadow-purple-600/50 transition-shadow">
                <span className="text-white font-black text-sm">HF</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-white">Hostel</span>
                <span className="text-purple-400">{isOwnerLogout ? "Finder Owner" : "Finder"}</span>
              </span>
            </Link>
          </motion.div>

          {/* ── DESKTOP LINKS ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i + 0.2 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/8"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* ── RIGHT BUTTONS ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated && role === "user" && (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/user/dashboard">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm shadow-lg shadow-purple-900/40 transition-all duration-200">
                    <FaTachometerAlt className="text-xs" /> Dashboard
                  </button>
                </Link>
              </motion.div>
            )}
            {!isAuthenticated && (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/login">
                    <button className="flex items-center gap-2 border border-white/20 text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/8 font-medium rounded-lg px-5 py-2.5 text-sm transition-all duration-200">
                      <FaSignInAlt className="text-lg text-purple-400" /> Sign In
                    </button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/signup">
                    <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm shadow-lg shadow-purple-900/50 transition-all duration-200">
                      <FaUserPlus className="text-lg" /> Sign Up
                    </button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* ── HAMBURGER ── */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><FaTimes /></motion.div>
                : <motion.div key="b" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><FaBars /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-5 flex flex-col gap-1">
                {NAV_LINKS.map(({ to, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? "bg-purple-600/20 text-white border border-purple-500/30" : "text-gray-300 hover:bg-white/8 hover:text-white"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
                <div className="border-t border-white/10 mt-3 pt-4 flex flex-col gap-2">
                  {isAuthenticated && role === "user" && (
                    <Link to="/user/dashboard" onClick={() => setMenuOpen(false)}>
                      <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2">
                        <FaTachometerAlt /> Dashboard
                      </button>
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <>
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <button className="w-full border border-white/20 text-gray-300 hover:text-white rounded-xl py-3 text-lg font-medium">Sign In</button>
                      </Link>
                      <Link to="/signup" onClick={() => setMenuOpen(false)}>
                        <button className="w-full bg-purple-600 text-white rounded-xl py-3 text-lg font-semibold">Sign Up</button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
