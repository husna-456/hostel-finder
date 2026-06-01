import React from "react";
import AllHostels from "../AllHostels"; // AllHostels component ko import karo

export default function UserHostelListing() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* userPanel prop true pass kar rahe hain */}
      <AllHostels userPanel={true} />
    </div>
  );
}



