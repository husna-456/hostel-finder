import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Eye, MessageCircle } from "lucide-react";

export default function HostelCard({ hostel, userPanel = false, onClick }) {
  const navigate = useNavigate();

  const price = hostel?.startingRent ?? hostel?.price ?? "N/A";
  const isSample = hostel?.isSample || hostel?.sample === true;

  const hostelId = hostel?._id;
  const ownerId = hostel?.ownerId;

  const hostelLink = userPanel
    ? `/user/hostel-listing/${hostelId}`
    : `/hostels/${hostelId}`;

  const genderType = hostel?.type || hostel?.category || "Mixed";
  const genderColor =
    genderType.toLowerCase() === "girls"
      ? "bg-pink-500"
      : genderType.toLowerCase() === "boys"
      ? "bg-blue-600"
      : "bg-gray-500";

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 h-full">

      {/* TOP: Image */}
      <Link to={hostelLink} className="relative block w-full">
        <img
          src={hostel?.images?.[0] || "/images/hostel-default.jpg"}
          alt={hostel?.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gender badge */}
        <div className={`absolute top-3 left-3 ${genderColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow`}>
          {genderType}
        </div>
        {isSample && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Sample
          </div>
        )}
      </Link>

      {/* BOTTOM: Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Name */}
        <Link to={hostelLink}>
          <h2 className={`${userPanel ? "text-lg" : "text-base"} font-bold text-gray-800 hover:text-purple-600 transition-colors leading-snug line-clamp-1`}>
            {hostel?.name}
          </h2>
        </Link>

        {/* Price */}
        <div>
          <span className={userPanel ? "text-xl font-bold text-purple-600" : "text-lg font-extrabold text-gray-900"}>
            PKR {typeof price === "number" ? price.toLocaleString() : price}
          </span>
          <span className="text-xs text-gray-400 ml-1">/ month</span>
        </div>

        {/* Location */}
        <div className={`flex items-start text-gray-500 gap-1 ${userPanel ? "text-sm" : "text-xs"}`}>
          <FaMapMarkerAlt className="text-purple-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-tight">
            {hostel?.location?.area || hostel?.address || "Location not available"}
          </span>
        </div>

        {/* Facility Tags */}
        {hostel?.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hostel.facilities.slice(0, 4).map((f, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full border border-gray-200"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2 mt-3 w-full">
          <button
            onClick={() => {
              if (onClick) onClick();
              else navigate(hostelLink);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap
                       h-10 md:h-auto md:py-2.5
                       rounded-lg md:rounded-xl
                       border border-purple-600 md:border-2
                       bg-white text-purple-600
                       text-sm font-medium md:font-semibold
                       hover:bg-purple-50 md:hover:bg-purple-600 md:hover:text-white
                       transition-colors duration-200"
          >
            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            View Details
          </button>

          {/* Chat with Owner — user panel only */}
          {userPanel && (
            <button
              disabled={!ownerId || !hostelId}
              onClick={() => navigate(`/user/messages/${hostelId}/${ownerId}?isSidePanel=true`)}
              className="flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap
                         h-10 md:h-auto md:py-2.5
                         rounded-lg md:rounded-xl
                         bg-purple-600 text-white
                         text-sm font-medium md:font-semibold
                         hover:bg-purple-700
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              Chat with Owner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}