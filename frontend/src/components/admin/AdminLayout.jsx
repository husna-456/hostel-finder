import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, UserCog, Building2, CalendarCheck,
  MessageSquare, X, Settings, ChevronDown, LogOut, FileText,
} from "lucide-react";
import DashboardHeader from "../DashboardHeader";

const navItems = [
  { label: "Dashboard",          icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "User Management",    icon: Users,           path: "/admin/users"     },
  { label: "Owner Management",   icon: UserCog,         path: "/admin/owners"    },
  { label: "Hostel Management",  icon: Building2,       path: "/admin/hostels"   },
  { label: "Booking Management", icon: CalendarCheck,   path: "/admin/bookings"  },
  { label: "Chat Monitoring",    icon: MessageSquare,   path: "/admin/chats"        },
  { label: "Site Content",       icon: FileText,        path: "/admin/site-content" },
  { label: "Settings",           icon: Settings,        path: "/admin/settings"     },
];

export default function AdminLayout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [menuPos,     setMenuPos]     = useState({ bottom: 0, left: 0, width: 180 });

  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  const adminName = user?.name || "Admin";
  const initial   = adminName.charAt(0).toUpperCase();
  const avatar    = user?.profilePicture;

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

  const currentLabel = navItems.find(
    n => n.path === location.pathname || location.pathname.startsWith(n.path + "/")
  )?.label || "Admin";

  /* Avatar node — reused in both states */
  const AvatarNode = ({ size = "w-9 h-9" }) => avatar ? (
    <img src={avatar} alt={adminName} className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 select-none`}>
      {initial}
    </div>
  );

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
            className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-colors
              ${expanded ? "gap-3 px-3" : "justify-center px-0"}
              ${active ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <Icon size={18} className="shrink-0" />
            {expanded && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
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
        {/* Mobile sidebar bottom profile */}
        <div className="border-t border-gray-200 p-3 shrink-0">
          <button
            onClick={openDropdown}
            className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <AvatarNode size="w-9 h-9" />
            <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-800 truncate leading-tight">{adminName}</span>
              <span className="text-xs text-gray-400 leading-tight">Administrator</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ${showProfile ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} bg-white border-r border-gray-200 flex-col transition-all duration-300 shrink-0`}>
        {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-100 shrink-0">
            <span className="font-bold text-gray-800 text-base">Admin Panel</span>
          </div>
        )}
        <NavLinks onNavClick={() => {}} expanded={!collapsed} />

        {/* Desktop profile — collapsed vs expanded */}
        <div className="border-t border-gray-200 shrink-0">
          {collapsed ? (
            /* Collapsed: perfectly centred avatar circle */
            <div className="flex justify-center items-center py-3">
              <button
                onClick={openDropdown}
                title={adminName}
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
                  <span className="font-semibold text-sm text-gray-800 truncate leading-tight">{adminName}</span>
                  <span className="text-xs text-gray-400 leading-tight">Administrator</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${showProfile ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title={currentLabel}
          onMenuClick={() => {
            if (window.innerWidth < 768) setMobileOpen(p => !p);
            else setCollapsed(p => !p);
          }}
          profilePath="/admin/profile"
          logoutPath="/admin-login"
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Portal dropdown — shared for desktop + mobile sidebar profile */}
      {showProfile && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowProfile(false)} />
          <div
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            style={{ bottom: menuPos.bottom, left: menuPos.left, width: menuPos.width, minWidth: 180 }}
          >
            <button
              onClick={() => { setShowProfile(false); navigate("/admin/profile"); }}
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
    </div>
  );
}
