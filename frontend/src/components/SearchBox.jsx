import { FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";

export default function SearchBox() {
  const navigate = useNavigate();
  const { setSearchFilters } = useSearch();

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [km, setKm] = useState(40);

  const handleClick = () => {
    if (!location) {
      alert("Please type location");
      return;
    }

    setSearchFilters({
      location,
      category,
      km,
    });

    navigate("/results");
  };

  return (
    <div className="
      bg-white/40 backdrop-blur-lg
      p-4 md:p-5
      rounded-2xl
      shadow-md
      flex flex-col md:flex-row
      justify-between items-center
      gap-4 md:gap-3
      max-w-6xl mx-auto
      border border-gray-200
      transition-all duration-300
      hover:shadow-xl
    ">

      {/* LOCATION */}
      <div className="relative flex-[1.8] w-full h-12">
        <FaMapMarkerAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-600 text-lg opacity-90" />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter desired location"
          className="
            w-full h-full pl-10 pr-3
            rounded-lg
            border border-gray-300
            bg-white/70
            text-gray-700
            placeholder-gray-400
            transition-all duration-300
            hover:border-purple-500
            focus:border-purple-600
            focus:ring-2 focus:ring-purple-400/40
            focus:outline-none
          "
        />
      </div>

      {/* CATEGORY */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="
          flex-[1.8] w-full h-12 px-3
          rounded-lg
          border border-gray-300
          bg-white/70
          text-gray-700
          transition-all duration-300
          hover:border-purple-500
          focus:border-purple-600
          focus:ring-2 focus:ring-purple-400/40
          focus:outline-none
        "
      >
        <option value="">Select Category</option>
        <option value="boys">Boys Hostel</option>
        <option value="girls">Girls Hostel</option>
        <option value="guest">Guest House</option>
        <option value="hotel">Hotel</option>
        <option value="shortstay">Short Stay</option>
      </select>

      {/* RADIUS */}
      <div className="flex items-center gap-2 flex-[1.3] w-full h-12">
        <span className="text-base font-medium text-gray-700 whitespace-nowrap">
          Set Radius
        </span>

        <select
          value={km}
          onChange={(e) => setKm(Number(e.target.value))}
          className="
            flex-1 h-full px-3
            rounded-lg
            border border-gray-300
            bg-white/70
            text-gray-700
            transition-all duration-300
            hover:border-purple-500
            focus:border-purple-600
            focus:ring-2 focus:ring-purple-400/40
            focus:outline-none
          "
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
          <option value={40}>40 km</option>
        </select>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleClick}
        className="
          bg-purple-600 text-white
          px-8 h-12
          rounded-lg
          font-semibold
          flex items-center justify-center
          transition-all duration-300
          hover:bg-purple-700
          hover:shadow-purple-500/40
          hover:shadow-lg
          active:scale-95
          focus:ring-2 focus:ring-purple-400/50
          focus:outline-none
          w-full md:w-auto
        "
      >
        Search Hostels
      </button>

    </div>
  );
}
