import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import HostelCard from "../components/HostelCard";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.gridlayer.googlemutant";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";

const GMAP_KEY = "AIzaSyBDBqBuj2i_CtmIHF_gpU0dvZDszz9JHaw";

const selectedIcon = new L.Icon({
  iconUrl:    "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize:   [40, 40],
  iconAnchor: [20, 40],
});

const hostelDotStyle = {
  radius: 6, fillColor: "#a855f7", color: "#7e22ce", weight: 3, fillOpacity: 0.5,
};

const searchCircleStyle = {
  color: "#a855f7", fillColor: "#f3e8ff", fillOpacity: 0.25, dashArray: "8, 8", weight: 3,
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
};

const quickLocations = [
  { name: "Satellite Town", lat: 32.1617, lng: 74.1883 },
  { name: "Model Town",     lat: 32.1505, lng: 74.1859 },
  { name: "Civil Lines",    lat: 32.1551, lng: 74.1864 },
  { name: "Peoples Colony", lat: 32.1703, lng: 74.1968 },
  { name: "DC Colony",      lat: 32.1594, lng: 74.1777 },
  { name: "Wapda Town",     lat: 32.1478, lng: 74.2012 },
];

const AdvancedSearch = () => {
  const [location,    setLocation]    = useState("");
  const [radius,      setRadius]      = useState(10);
  const [center,      setCenter]      = useState([30.7333, 76.7794]);
  const [selected,    setSelected]    = useState(null);
  const [hostels,     setHostels]     = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const sliderPct  = ((radius - 1) / 39) * 100;
  const visualRadius = radius * 1000;

  const handleQuickSearch = (loc) => {
    const c = [loc.lat, loc.lng];
    setLocation(loc.name);
    setCenter(c);
    setSelected(c);
  };

  const fetchCoords = async () => {
    if (!location.trim()) return;
    setIsSearching(true);
    try {
      const geo = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ", Gujranwala, Pakistan")}&key=${GMAP_KEY}`
      );
      const data = await geo.json();
      if (data.status !== "OK" || !data.results?.length) {
        alert("Location not found. Try a different name.");
        return;
      }
      const { lat, lng } = data.results[0].geometry.location;
      const newCenter = [lat, lng];
      setCenter(newCenter);
      setSelected(newCenter);

      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const resp = await fetch(`${BASE}/hostels/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, km: radius }),
      });
      const result = await resp.json();
      setHostels(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      alert("Error searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 md:py-16 px-4">

      {/* ── Hero ── */}
      <h1 className="text-2xl md:text-4xl font-bold text-purple-900 mb-3 tracking-tight text-center">
        Advanced Search
      </h1>
      <p className="text-sm md:text-lg text-purple-600 mb-8 md:mb-14 font-medium text-center max-w-lg">
        Find hostels near your desired location using distance-based filtering.
      </p>

      {/* ── Search Card ── */}
      <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 w-full max-w-6xl">

        {/* Location input row */}
        <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-8">

          {/* Location field */}
          <div className="w-full">
            <label className="flex items-center text-purple-700 font-medium mb-2 text-sm">
              <FaMapMarkerAlt className="mr-2 text-purple-600" />
              Search Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCoords()}
              placeholder="Type your desired location"
              className="w-full px-4 md:px-5 py-3 md:py-4 text-sm md:text-lg border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
            />
          </div>

          {/* Radius + Button row — stacked on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">

            {/* Radius slider */}
            <div className="flex-1 sm:flex-none">
              <div className="flex items-center justify-between mb-2">
                <label className="text-purple-700 font-medium text-sm">Search Radius</label>
                <span className="text-purple-700 font-bold text-sm tabular-nums">{radius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full sm:w-52 h-2 bg-purple-100 rounded-full appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #c4b5fd 0%, #c4b5fd ${sliderPct}%, #e9d5ff ${sliderPct}%, #e9d5ff 100%)`,
                }}
              />
              <div className="flex justify-between mt-1 text-xs text-purple-500">
                <span>1 km</span>
                <span>40 km</span>
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={fetchCoords}
              disabled={isSearching}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-60 text-white px-8 py-3.5 rounded-2xl text-sm md:text-base font-semibold shadow-lg transition-all duration-200"
            >
              <FaSearch />
              {isSearching ? "Searching…" : "Search Nearby"}
              {isSearching && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Quick search chips */}
        <div className="pt-4 md:pt-6 border-t border-gray-100">
          <p className="text-purple-700 font-medium mb-3 text-xs md:text-sm">Quick Search:</p>
          <div className="flex flex-wrap gap-2">
            {quickLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleQuickSearch(loc)}
                className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all shadow-sm
                  ${location === loc.name
                    ? "bg-purple-600 text-white shadow-purple-200"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
                  }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="w-full max-w-6xl h-[320px] sm:h-[480px] md:h-[640px] rounded-3xl overflow-hidden shadow-2xl mt-8 md:mt-14 border border-purple-100 relative z-0">
        <MapContainer center={center} zoom={14} maxZoom={20} className="h-full w-full">
          <ReactLeafletGoogleLayer apiKey={GMAP_KEY} type="roadmap" />
          <MapUpdater center={center} />

          {selected && (
            <>
              <Marker position={selected} icon={selectedIcon}>
                <Popup>Your Selected Location</Popup>
              </Marker>
              <Circle center={selected} radius={visualRadius} pathOptions={searchCircleStyle} />
            </>
          )}

          {hostels.map((h) => {
            const coords = h.location?.coordinates;
            if (!coords || coords.length !== 2) return null;
            const lat = coords[1], lng = coords[0];
            if (typeof lat !== "number" || typeof lng !== "number") return null;
            return (
              <Circle key={h._id} center={[lat, lng]} pathOptions={hostelDotStyle}>
                <Popup>{h.name}</Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {/* ── Results ── */}
      {hostels.length > 0 && (
        <div className="w-full max-w-6xl mt-12 md:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-10 gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-900">Search Results</h2>
            <p className="text-purple-700 font-semibold text-sm md:text-lg">
              {hostels.length} hostel{hostels.length !== 1 ? "s" : ""} found within {radius} km
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {hostels.map((hostel) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const style = document.createElement("style");
style.innerHTML = `
.slider-custom::-webkit-slider-thumb {
  appearance: none; width: 20px; height: 20px;
  background: #9333ea; border-radius: 50%; cursor: pointer;
  box-shadow: 0 2px 6px rgba(147,51,234,0.35);
}
.slider-custom::-moz-range-thumb {
  width: 20px; height: 20px; background: #9333ea;
  border-radius: 50%; cursor: pointer; border: none;
  box-shadow: 0 2px 6px rgba(147,51,234,0.35);
}
`;
document.head.appendChild(style);

export default AdvancedSearch;
