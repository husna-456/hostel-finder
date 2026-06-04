import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, BookOpen, List,
  MessageSquare, Menu, X, ChevronDown, UserCog, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/hostel_owner/dashboard"  },
  { label: "Add Hostel",    icon: PlusCircle,      path: "/hostel_owner/add-hostel" },
  { label: "Bookings",      icon: BookOpen,        path: "/hostel_owner/bookings"   },
  { label: "Hostel Listing",icon: List,            path: "/hostel_owner/hostels"    },
  { label: "Chat",          icon: MessageSquare,   path: "/hostel_owner/chat"       },
];

export default function OwnerSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuPos,      setMenuPos]      = useState({ bottom: 0, left: 0, width: 180 });

  const name    = user?.name  || "Owner";
  const initial = name.charAt(0).toUpperCase();
  const avatar  = user?.profilePicture;

  useEffect(() => {
    const close = () => setShowDropdown(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const openDropdown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left, width: Math.max(rect.width, 180) });
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

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`flex flex-col justify-between bg-white border-r border-gray-200 shadow-sm transition-all duration-300 fixed top-0 left-0 h-screen z-50 overflow-y-auto ${
        isOpen ? "w-60" : "w-0 md:w-16"
      }`}>
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            {isOpen && <span className="font-bold text-gray-800 text-base">Owner Panel</span>}
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Toggle sidebar">
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="py-4 space-y-1 px-2">
            {navItems.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={handleNavClick}
                title={!isOpen ? label : ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Profile section */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={openDropdown}
            className="flex items-center gap-3 w-full hover:bg-gray-100 rounded-xl p-2.5 transition"
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-purple-100" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {initial}
              </div>
            )}
            {isOpen && (
              <>
                <div className="flex flex-col text-left overflow-hidden flex-1">
                  <span className="font-semibold text-sm text-gray-800 truncate">{name}</span>
                  <span className="text-xs text-gray-400">Hostel Owner</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${showDropdown ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </div>
      </aside>

      {showDropdown && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
          <div className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, minWidth: 180 }}>
            <button
              onClick={() => { setShowDropdown(false); handleNavClick(); navigate("/hostel_owner/profile"); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <UserCog size={14} className="text-purple-500 shrink-0" /> Edit Profile
            </button>
            <div className="border-t border-gray-100" />
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={14} className="shrink-0" /> Logout
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
