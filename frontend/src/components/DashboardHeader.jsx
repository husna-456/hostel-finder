import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, UserCog, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardHeader({ title, onMenuClick, profilePath, logoutPath = "/" }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const name    = user?.name || "User";
  const initial = name.charAt(0).toUpperCase();
  const avatar  = user?.profilePicture;

  useEffect(() => {
    const close = () => setShowDropdown(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const openDropdown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setShowDropdown(p => !p);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    logout();
    navigate(logoutPath);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center shrink-0 gap-3 sticky top-0 z-30">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-base font-semibold text-gray-800 flex-1">{title}</h1>

        <div className="flex items-center gap-1.5">
          <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition">
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
          </button>

          <button
            onClick={openDropdown}
            className="flex items-center gap-1.5 hover:bg-gray-100 rounded-xl px-2 py-1.5 transition ml-1"
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0 border-2 border-purple-100" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {initial}
              </div>
            )}
            <ChevronDown size={14} className={`text-gray-400 transition-transform hidden sm:block ${showDropdown ? "rotate-180" : ""}`} />
          </button>
        </div>
      </header>

      {showDropdown && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
          <div
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ top: menuPos.top, right: menuPos.right, minWidth: 180 }}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
            </div>
            {profilePath && (
              <button
                onClick={() => { setShowDropdown(false); navigate(profilePath); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <UserCog size={14} className="text-purple-500 shrink-0" /> Edit Profile
              </button>
            )}
            <div className="border-t border-gray-100" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} className="shrink-0" /> Logout
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
