import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaPlusCircle, FaBook, FaList, FaSignOutAlt, FaComment, FaUserEdit, FaChevronUp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function OwnerSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name    = user?.name  || "Owner";
  const email   = user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    function onOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    logout();
    navigate("/");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 px-5 py-3 rounded-lg text-gray-700 hover:bg-purple-50 transition ${
      isActive ? "bg-purple-600 text-white" : ""
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col justify-between bg-white shadow-md transition-all duration-300 fixed top-0 left-0 h-screen z-50 overflow-y-auto ${
          isOpen ? "w-80" : "w-0 md:w-20"
        }`}
      >
        {/* Top bar */}
        <div>
          <div className="flex items-center justify-between p-4 border-b">
            {isOpen && (
              <span className="text-xl font-bold text-purple-600">Owner Panel</span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl text-gray-700 hover:text-purple-600 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>

          <nav className="flex-1 mt-4 space-y-2 px-2">
            <NavLink to="/hostel_owner/dashboard" className={linkClass} onClick={handleNavClick}>
              <MdSpaceDashboard className="text-2xl shrink-0" />
              {isOpen && <span>Dashboard</span>}
            </NavLink>

            <NavLink to="/hostel_owner/add-hostel" className={linkClass} onClick={handleNavClick}>
              <FaPlusCircle className="text-2xl shrink-0" />
              {isOpen && <span>Add Hostel</span>}
            </NavLink>

            <NavLink to="/hostel_owner/bookings" className={linkClass} onClick={handleNavClick}>
              <FaBook className="text-2xl shrink-0" />
              {isOpen && <span>Bookings</span>}
            </NavLink>

            <NavLink to="/hostel_owner/hostels" className={linkClass} onClick={handleNavClick}>
              <FaList className="text-2xl shrink-0" />
              {isOpen && <span>Hostel Listing</span>}
            </NavLink>

            <NavLink to="/hostel_owner/chat" className={linkClass} onClick={handleNavClick}>
              <FaComment className="text-2xl shrink-0" />
              {isOpen && <span>Chat</span>}
            </NavLink>
          </nav>
        </div>

        {/* Bottom profile section */}
        <div className="relative border-t p-3" ref={dropdownRef}>

          {/* Upward dropdown */}
          {showDropdown && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <button
                onClick={() => { setShowDropdown(false); handleNavClick(); navigate("/hostel_owner/profile"); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <FaUserEdit className="text-purple-500" />
                Edit Profile
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}

          {/* Profile trigger button */}
          <button
            onClick={() => setShowDropdown(p => !p)}
            className="flex items-center gap-3 w-full hover:bg-gray-100 rounded-xl p-2.5 transition group"
          >
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {initial}
            </div>
            {isOpen && (
              <>
                <div className="flex flex-col text-left overflow-hidden flex-1">
                  <span className="font-semibold text-sm text-gray-800 truncate">{name}</span>
                  <span className="text-xs text-gray-400 truncate">{email}</span>
                </div>
                <FaChevronUp
                  className={`text-gray-400 text-xs transition-transform shrink-0 ${showDropdown ? "" : "rotate-180"}`}
                />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
