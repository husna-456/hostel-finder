import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCog, Building2, CalendarCheck,
  MessageSquare, X, Settings,
} from "lucide-react";
import DashboardHeader from "../DashboardHeader";

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
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const currentLabel = navItems.find(
    n => n.path === location.pathname || location.pathname.startsWith(n.path + "/")
  )?.label || "Admin";

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
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${collapsed ? "w-16" : "w-60"} bg-white border-r border-gray-200 flex-col transition-all duration-300 shrink-0`}>
        {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-100">
            <span className="font-bold text-gray-800 text-base">Admin Panel</span>
          </div>
        )}
        <NavLinks onNavClick={() => {}} expanded={!collapsed} />
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
    </div>
  );
}
