import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaBookOpen, FaList, FaSignOutAlt, FaCreditCard, FaUserEdit, FaChevronUp } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

export default function UserSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuPos, setMenuPos] = useState({ bottom: 0, left: 0, width: 180 });
  const profileBtnRef = useRef(null);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const name    = user?.name  || "User";
  const email   = user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    const close = () => setShowDropdown(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const openDropdown = () => {
    if (profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setMenuPos({
        bottom: window.innerHeight - rect.top + 8,
        left:   rect.left,
        width:  Math.max(rect.width, 180),
      });
    }
    setShowDropdown(p => !p);
  };

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
      {/* Mobile overlay */}
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
              <span className="text-xl font-bold text-purple-600">User Panel</span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>

          <nav className="flex-1 mt-4 space-y-2 px-2">
            <NavLink to="/user/dashboard" className={linkClass} onClick={handleNavClick}>
              <MdSpaceDashboard className="text-2xl" />
              {isOpen && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/user/hostel-listing" className={linkClass} onClick={handleNavClick}>
              <FaList className="text-2xl" />
              {isOpen && <span>Hostel Listing</span>}
            </NavLink>
            <NavLink to="/user/book-hostel" className={linkClass} onClick={handleNavClick}>
              <FaBookOpen className="text-2xl" />
              {isOpen && <span>Book a Hostel</span>}
            </NavLink>
            <NavLink to="/user/my-bookings" className={linkClass} onClick={handleNavClick}>
              <FaCalendarCheck className="text-2xl" />
              {isOpen && <span>My Bookings</span>}
            </NavLink>
            <NavLink to="/user/payments" className={linkClass} onClick={handleNavClick}>
              <FaCreditCard className="text-2xl" />
              {isOpen && <span>Payments</span>}
            </NavLink>
            <NavLink to="/user/chat" className={linkClass} onClick={handleNavClick}>
              <MdMessage className="text-2xl" />
              {isOpen && <span>Messages</span>}
            </NavLink>
          </nav>
        </div>

        {/* Profile trigger */}
        <div className="border-t p-3">
          <button
            ref={profileBtnRef}
            onClick={openDropdown}
            className="flex items-center gap-3 w-full hover:bg-gray-100 rounded-xl p-2.5 transition"
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

      {/* Portal dropdown — renders at document.body, escapes sidebar overflow */}
      {showDropdown && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
          <div
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, minWidth: 180 }}
          >
            <button
              onClick={() => { setShowDropdown(false); handleNavClick(); navigate("/user/profile"); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <FaUserEdit className="text-purple-500" /> Edit Profile
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
