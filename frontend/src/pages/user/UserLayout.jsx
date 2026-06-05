import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function UserLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.endsWith("/chat");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {!sidebarOpen && !isChatPage && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-xl shadow-md text-gray-700 hover:text-purple-600 transition-colors"
        >
          ☰
        </button>
      )}

      <div
        className={`flex-1 min-h-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-0 md:ml-60" : "ml-0 md:ml-16"
        }`}
      >
        <main className={`flex-1 min-h-0 flex flex-col overflow-y-auto ${isChatPage ? "" : "p-4 md:p-6"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
