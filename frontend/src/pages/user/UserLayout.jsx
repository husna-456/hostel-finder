import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import DashboardHeader from "../../components/DashboardHeader";

const titleMap = {
  "/user/dashboard":      "Dashboard",
  "/user/hostel-listing": "Hostel Listing",
  "/user/book-hostel":    "Book a Hostel",
  "/user/my-bookings":    "My Bookings",
  "/user/payments":       "Payments",
  "/user/chat":           "Messages",
  "/user/profile":        "My Profile",
  "/user/reviews":        "My Reviews",
};

export default function UserLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.endsWith("/chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = Object.entries(titleMap).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + "/")
  )?.[1] || "User Panel";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}>
        {!isChatPage && (
          <DashboardHeader
            title={title}
            onMenuClick={() => setSidebarOpen(p => !p)}
            profilePath="/user/profile"
            logoutPath="/"
          />
        )}
        <main className={`flex-1 min-h-0 flex flex-col overflow-y-auto ${isChatPage ? "" : "px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8"}`}>
          <Outlet />
          {!isChatPage && <div className="shrink-0 h-16 md:h-10" aria-hidden="true" />}
        </main>
      </div>
    </div>
  );
}
