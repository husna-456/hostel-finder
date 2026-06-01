import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-xl shadow-md text-gray-700 hover:text-purple-600 transition-colors"
        >
          ☰
        </button>
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-0 md:ml-80" : "ml-0 md:ml-20"
        }`}
      >
        <main className="p-4 md:p-6 pt-16 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
