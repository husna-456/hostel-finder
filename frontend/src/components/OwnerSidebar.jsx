import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaPlusCircle, FaBook, FaList, FaSignOutAlt, FaComment } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function OwnerSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
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

        {/* Bottom profile */}
        <div className="relative border-t p-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 w-full hover:bg-gray-100 rounded-lg p-2 transition"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "O"}
            </div>
            {isOpen && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="font-semibold text-sm truncate">{user?.name}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email}</span>
              </div>
            )}
          </button>

          {showMenu && (
            <div className="absolute bottom-16 left-3 right-3 bg-white shadow-lg rounded-lg border z-50">
              <button
                onClick={() => { setShowProfile(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition"
              >
                ⚙️ Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Profile modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-xl mx-4">
            <h2 className="text-xl font-bold text-center text-gray-800">Profile Settings</h2>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-3xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : "O"}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:border-purple-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:border-purple-500 outline-none text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProfile(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
