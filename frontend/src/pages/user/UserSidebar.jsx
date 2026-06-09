import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, List, BookOpen, CalendarCheck,
  CreditCard, MessageSquare, Menu, X, ChevronDown, UserCog, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/user/dashboard"      },
  { label: "Hostel Listing",icon: List,            path: "/user/hostel-listing" },
  { label: "Book a Hostel", icon: BookOpen,        path: "/user/book-hostel"    },
  { label: "My Bookings",   icon: CalendarCheck,   path: "/user/my-bookings"    },
  { label: "Payments",      icon: CreditCard,      path: "/user/payments"       },
  { label: "Messages",      icon: MessageSquare,   path: "/user/chat"           },
];

export default function UserSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuPos,      setMenuPos]      = useState({ bottom: 0, left: 0, width: 180 });

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

  /* Avatar node — reused in both states */
  const AvatarNode = ({ size = "w-9 h-9" }) => avatar ? (
    <img src={avatar} alt={name} className={`${size} rounded-full object-cover shrink-0 border-2 border-purple-100`} />
  ) : (
    <div className={`${size} rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 select-none`}>
      {initial}
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 fixed top-0 left-0 h-screen z-50 overflow-x-hidden overflow-y-auto ${
        isOpen ? "w-60" : "w-0 md:w-16"
      }`}>

        {/* ── Header ── */}
        <div className={`flex items-center border-b border-gray-100 px-4 py-4 ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && <span className="font-bold text-gray-800 text-base">User Panel</span>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 shrink-0"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="py-4 space-y-1 px-2 flex-1">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleNavClick}
              title={!isOpen ? label : ""}
              className={({ isActive }) =>
                `flex items-center py-2.5 rounded-xl text-sm font-medium transition-colors
                 ${isOpen ? "gap-3 px-3" : "justify-center px-0"}
                 ${isActive ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {isOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── Profile — desktop only (hidden on mobile via parent width logic) ── */}
        <div className="border-t border-gray-200 shrink-0">
          {!isOpen ? (
            /* Collapsed: perfectly centred avatar circle */
            <div className="flex justify-center items-center py-3">
              <button
                onClick={openDropdown}
                title={name}
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-purple-300 transition-all duration-200 focus:outline-none focus:ring-purple-400"
              >
                <AvatarNode size="w-9 h-9" />
              </button>
            </div>
          ) : (
            /* Expanded: avatar + name + role + chevron */
            <div className="p-3">
              <button
                onClick={openDropdown}
                className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <AvatarNode size="w-9 h-9" />
                <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
                  <span className="font-semibold text-sm text-gray-800 truncate leading-tight">{name}</span>
                  <span className="text-xs text-gray-400 leading-tight">Student</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Portal dropdown ── */}
      {showDropdown && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
          <div
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, minWidth: 180 }}
          >
            <button
              onClick={() => { setShowDropdown(false); navigate("/user/profile"); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <UserCog size={14} className="text-purple-500 shrink-0" /> Edit Profile
            </button>
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
