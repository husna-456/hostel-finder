import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, UserCog, Building2,
  CalendarCheck, MessageSquare, Menu, X, Settings, ChevronDown,
} from "lucide-react";
import { FaBars, FaUserEdit, FaSignOutAlt } from "react-icons/fa";

const navItems = [
  { label: "Dashboard",         icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "User Management",   icon: Users,           path: "/admin/users" },
  { label: "Owner Management",  icon: UserCog,         path: "/admin/owners" },
  { label: "Hostel Management", icon: Building2,       path: "/admin/hostels" },
  { label: "Booking Management",icon: CalendarCheck,   path: "/admin/bookings" },
  { label: "Chat Monitoring",   icon: MessageSquare,   path: "/admin/chats" },
  { label: "Settings",          icon: Settings,        path: "/admin/settings" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName  = storedUser?.name  || "Admin User";
  const adminEmail = storedUser?.email || "";
  const initial    = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    function onOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
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
    navigate("/admin-login");
  };
  const currentLabel = navItems.find((n) => n.path === location.pathname)?.label || "Admin";

  const NavContent = ({ onNavClick }) => (
    <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
      {navItems.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + "/");
        return (
          <Link
            key={path}
            to={path}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={collapsed ? label : ""}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (overlay) */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-bold text-purple-700 text-base">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <NavContent onNavClick={() => setMobileOpen(false)} />
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-sm bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop sidebar (inline) */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} bg-white border-r border-gray-200 flex-col transition-all duration-300 shrink-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && <span className="font-bold text-gray-800 text-base">Admin Panel</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
        <NavContent onNavClick={() => {}} />
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className={`w-full text-sm bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition font-medium ${collapsed ? "px-0" : "px-3"}`}
          >
            {collapsed ? "✕" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              <FaBars className="text-lg" />
            </button>
            <h1 className="text-base font-semibold text-gray-800">{currentLabel}</h1>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(p => !p)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-2.5 py-1.5 transition"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{adminName}</p>
                <p className="text-xs text-gray-400">{adminEmail || "admin"}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {initial}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <button
                  onClick={() => { setShowProfile(false); navigate("/admin/profile"); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <FaUserEdit className="text-purple-500 text-xs" />
                  Edit Profile
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="text-xs" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
