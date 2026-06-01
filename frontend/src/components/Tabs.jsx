// src/components/Tabs.jsx
import React from "react";

const Tabs = ({ activeTab, setActiveTab, context = "signup" }) => {
  const titles = {
    signup: {
      user: "User",
      hostelOwner: "Hostel Owner"
    },
    login: {
      user: "User",
      hostelOwner: "Hostel Owner"
    }
  };

  return (
    <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
      <button
        type="button"
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === "user"
            ? "bg-white text-purple-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => setActiveTab("user")}
      >
        {titles[context].user}
      </button>
      <button
        type="button"
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === "hostelOwner"
            ? "bg-white text-purple-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => setActiveTab("hostelOwner")}
      >
        {titles[context].hostelOwner}
      </button>
    </div>
  );
};

export default Tabs;