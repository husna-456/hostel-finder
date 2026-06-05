import { useState } from "react";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import { FaBars } from "react-icons/fa";

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OwnerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Content — on mobile no margin (sidebar is overlay); on desktop shift right */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <FaBars className="text-xl" />
          </button>
          <span className="text-base font-bold text-purple-600">Owner Panel</span>
        </div>

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
