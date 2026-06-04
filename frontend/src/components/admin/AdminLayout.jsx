import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, UserCog, Building2, CalendarCheck,
  MessageSquare, Menu, X, Settings, ChevronDown, UserCog as UserEdit,
  LogOut,
} from "lucide-react";
import { FaBars } from "react-icons/fa";

const navItems = [
  { label: "Dashboard",          icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "User Management",    icon: Users,           path: "/admin/users"     },
  { label: "Owner Management",   icon: UserCog,         path: "/admin/owners"    },
  { label: "Hostel Management",  icon: Building2,       path: "/admin/hostels"   },
  { label: "Booking Management", icon: CalendarCheck,   path: "/admin/bookings"  },
  { label: "Chat Monitoring",    icon: MessageSquare,   path: "/admin/chats"     },
  { label: "Settings",           icon: Settings,        path: "/admin/settings"  },
];

export default function AdminLayout() {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [menuPos,      setMenuPos]      = useState({ bottom: 0, left: 0, width: 180 });

  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName  = storedUser?.name  || "Admin";
  const initial    = adminName.charAt(0).toUpperCase();

  // Close dropdown on scroll
  useEffect(() => {
    const close = () => setShowProfile(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, []);

  const openDropdown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left, width: Math.max(rect.width, 180) });
    setShowProfile(p => !p);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    logout();
    navigate("/admin-login");
  };

  const currentLabel = navItems.find(n => n.path === location.pathname)?.label || "Admin";

  // Shared nav links — collapsed controls text visibility
  const NavLinks = ({ onNavClick, expanded }) => (
    <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
      {navItems.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + "/");
        return (
          <Link
            key={path}
            to={path}
            onClick={onNavClick}
            title={!expanded ? label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {expanded && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  // Shared profile button
  const ProfileButton = ({ expanded, onClick }) => (
    <div className="border-t border-gray-200 p-3">
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full hover:bg-gray-100 rounded-xl p-2.5 transition"
      >
        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initial}
        </div>
        {expanded && (
          <>
            <div className="flex flex-col text-left overflow-hidden flex-1">
              <span className="font-semibold text-sm text-gray-800 truncate">{adminName}</span>
              <span className="text-xs text-gray-400">Administrator</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${showProfile ? "rotate-180" : ""}`} />
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`md:hidden fixed top-0 left-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-bold text-purple-700 text-base">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <NavLinks onNavClick={() => setMobileOpen(false)} expanded={true} />
        <ProfileButton expanded={true} onClick={openDropdown} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} bg-white border-r border-gray-200 flex-col transition-all duration-300 shrink-0`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && <span className="font-bold text-gray-800 text-base">Admin Panel</span>}
          <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
        <NavLinks onNavClick={() => {}} expanded={!collapsed} />
        <ProfileButton expanded={!collapsed} onClick={openDropdown} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center shrink-0 gap-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
            <FaBars className="text-lg" />
          </button>
          <h1 className="text-base font-semibold text-gray-800">{currentLabel}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Portal dropdown */}
      {showProfile && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowProfile(false)} />
          <div className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, minWidth: 180 }}>
            <button
              onClick={() => { setShowProfile(false); navigate("/admin/profile"); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <UserEdit size={14} className="text-purple-500 shrink-0" /> Edit Profile
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
    </div>
  );
}
