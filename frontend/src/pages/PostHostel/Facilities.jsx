import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Facilities({ onPrevious, onComplete }) {
  const facilitiesList = [
    "Free Wifi", "Free Parking", "Shared Kitchen", "TV Room", "Air Conditioning",
    "Lockers", "Breakfast Included", "Gym", "Swimming Pool", "Laundry Service",
    "Co-Working Space", "24/7 Reception",
  ];

  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("facilitiesData") || "[]");
    setSelectedFacilities(saved);
  }, []);

  const handleCheckboxChange = (facility) => {
    setSelectedFacilities((prev) => {
      let updated;

      if (prev.includes(facility)) {
        // Remove facility
        updated = prev.filter((f) => f !== facility);
      } else {
        // Add facility
        updated = [...prev, facility];
      }

      // Save updated list to localStorage
      localStorage.setItem("facilitiesData", JSON.stringify(updated));

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Load saved data from localStorage
      const generalDetails = JSON.parse(localStorage.getItem("generalDetailsData") || "{}");
      const specifications = JSON.parse(localStorage.getItem("specificationsData") || "{}");
      const hostelImages = JSON.parse(localStorage.getItem("hostelImageUrls")) || [];
      const roomImagesFromSpecs = JSON.parse(localStorage.getItem("specificationsData") || "{}").rooms || [];


      const savedFacilities = selectedFacilities || [];

      // 🔹 Prepare coordinates (fallback to default if missing)
      //const coordinates = generalDetails.coordinates || { lat: 31.5204, lng: 74.3587 }; // fallback: Lahore
      // 🔹 Prepare floors and rooms as arrays
      const floors = specifications.floors || [];
      const rooms = specifications.rooms || [];

      const roomsWithImages = rooms.map((room) => {
        const matchedRoom = roomImagesFromSpecs.find(
          r => r.roomId === room.roomId
        );

        return {
          roomId: room.roomId,
          title: room.roomTitle,
          type: room.roomType,
          floorId: room.floor,
          floorNumber: Number(room.floorNumber),
          seatPrice: Number(room.seatPrice),
          monthlyTotal: Number(room.monthlyTotal),
          firstMonthCharge: Number(room.firstMonthCharge),
          advanceAmount: Number(room.advanceAmount) || 0,
          features: room.features || [],
          images: matchedRoom?.roomImages || [] // ✅ NOW WORKS
        };
      });

      // 🔹 Build final payload
      const finalPayload = {
        hostelName: generalDetails.hostelName || "",
        ownerName: generalDetails.ownerName || "",
        hostelType: generalDetails.hostelType || "boys",
        contactPhone: generalDetails.contactPhone || "",
        address: generalDetails.address || "",
        description: generalDetails.description || "",
        hostelSpecs: specifications.hostelSpecs || {},
        floors,
        rooms: roomsWithImages,   // ✅ ROOM IMAGES INCLUDED
        facilities: savedFacilities,
        images: hostelImages,
        jazzCashNumber: generalDetails.jazzCashNumber || "",
        easypaisaNumber: generalDetails.easypaisaNumber || "",

      };

      console.log("Submitting payload:", finalPayload);

      // 🔹 Send POST request
      const token = localStorage.getItem("token");
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${BASE}/hostels/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Server responded with an error");
      }

      const result = await response.json();
      console.log("Server Response →", result);

      toast.success("✅ Hostel Added Successfully!");
      onComplete(); // Reset steps

    } catch (err) {
      console.error("Submit error:", err);
      toast.error("❌ Failed to add hostel. " + err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <form
      className="bg-white rounded-lg shadow-md border border-gray-200 p-8"
      onSubmit={handleSubmit}
    >
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Hostel Facilities</h1>
        <p className="text-gray-600 text-base">Select all available facilities and amenities</p>
      </div>

      {/* Facilities checkboxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {facilitiesList.map((facility, idx) => (
          <label
            key={idx}
            className="flex items-center space-x-2 border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-purple-50"
          >
            <input
              type="checkbox"
              checked={selectedFacilities.includes(facility)}
              onChange={() => handleCheckboxChange(facility)}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded"
            />
            <span className="text-gray-700 text-base">{facility}</span>
          </label>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevious}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-base ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Submitting..." : "Submit Property"}
        </button>
      </div>
    </form>
  );
}
