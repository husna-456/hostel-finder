import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import DashboardHeader from "../components/DashboardHeader";

const titleMap = {
  "/hostel_owner/dashboard":  "Dashboard",
  "/hostel_owner/add-hostel": "Add Hostel",
  "/hostel_owner/bookings":   "Bookings",
  "/hostel_owner/hostels":    "Hostel Listing",
  "/hostel_owner/chat":       "Messages",
  "/hostel_owner/profile":    "My Profile",
};

export default function OwnerLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.endsWith("/chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = Object.entries(titleMap).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + "/")
  )?.[1] || "Owner Panel";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OwnerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>
        {!isChatPage && (
          <DashboardHeader
            title={title}
            onMenuClick={() => setSidebarOpen(p => !p)}
            profilePath="/hostel_owner/profile"
            logoutPath="/"
          />
        )}
        <main className={`flex-1 min-h-0 flex flex-col overflow-y-auto ${isChatPage ? "" : "p-4 md:p-6"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
