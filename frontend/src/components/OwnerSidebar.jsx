import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, BookOpen, List,
  MessageSquare, Menu, X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/hostel_owner/dashboard"  },
  { label: "Add Hostel",    icon: PlusCircle,      path: "/hostel_owner/add-hostel" },
  { label: "Bookings",      icon: BookOpen,        path: "/hostel_owner/bookings"   },
  { label: "Hostel Listing",icon: List,            path: "/hostel_owner/hostels"    },
  { label: "Chat",          icon: MessageSquare,   path: "/hostel_owner/chat"       },
];

export default function OwnerSidebar({ isOpen, setIsOpen }) {
  const handleNavClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 fixed top-0 left-0 h-screen z-50 overflow-x-hidden overflow-y-auto ${
        isOpen ? "w-60" : "w-0 md:w-16"
      }`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {isOpen && <span className="font-bold text-gray-800 text-base">Owner Panel</span>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Toggle sidebar">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="py-4 space-y-1 px-2 flex-1">
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
      </aside>
    </>
  );
}
