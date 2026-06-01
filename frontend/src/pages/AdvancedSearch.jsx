import React, { useEffect, useState } from "react";  // useEffect add kiya
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

// ✅ Plugin import (Google tiles ke liye)
import "leaflet.gridlayer.googlemutant";
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';

const selectedIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const hostelDotStyle = {
  radius: 6,
  fillColor: "#a855f7",
  color: "#7e22ce",
  weight: 3,
  fillOpacity: 0.5,
};

const searchCircleStyle = {
  color: "#a855f7",
  fillColor: "#f3e8ff",
  fillOpacity: 0.25,
  dashArray: "8, 8",
  weight: 3,
};

/* Leaflet marker fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* MAP CENTER UPDATER */
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// ✅ NEW COMPONENT: Google Tiles Layer
const GoogleTilesLayer = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Google Mutant layer add karo
    const googleLayer = L.gridLayer.googleMutant({
      type: "roadmap", // "roadmap", "satellite", "hybrid", "terrain"
      apikey: "AIzaSyBDBqBuj2i_CtmIHF_gpU0dvZDszz9JHaw", // yahan apni key daalen
    });

    googleLayer.addTo(map);

    // Cleanup on unmount
    return () => {
      googleLayer.remove();
    };
  }, [map]);

  return null;
};

const AdvancedSearch = () => {
  const quickLocations = [
    { name: "Satellite Town", lat: 32.1617, lng: 74.1883 },
    { name: "Model Town", lat: 32.1505, lng: 74.1859 },
    { name: "Civil Lines", lat: 32.1551, lng: 74.1864 },
    { name: "Peoples Colony", lat: 32.1703, lng: 74.1968 },
    { name: "DC Colony", lat: 32.1594, lng: 74.1777 },
    { name: "Wapda Town", lat: 32.1478, lng: 74.2012 },
  ];

  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(10);
  const [center, setCenter] = useState([30.7333, 76.7794]);
  const [selected, setSelected] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const sliderPercentage = ((radius - 1) / 49) * 100;
  const visualRadius = radius * 1000;

  const handleQuickSearch = (loc) => {
    const newCenter = [loc.lat, loc.lng];
    setLocation(loc.name);
    setCenter(newCenter);
    setSelected(newCenter);
  };

  // Google Geocoding function (Geoapify hata diya)
  const fetchCoords = async () => {
    if (!location.trim()) return;

    setIsSearching(true);

    const fullLocation = `${location}, Gujranwala, Pakistan`;

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullLocation
        )}&key=AIzaSyBDBqBuj2i_CtmIHF_gpU0dvZDszz9JHaw`
      );

      const data = await res.json();

      if (data.status !== "OK" || !data.results?.length) {
        alert("Location not found. Try a different name.");
        setIsSearching(false);
        return;
      }

      const { lat, lng } = data.results[0].geometry.location;
      const newCenter = [lat, lng];
      setCenter(newCenter);
      setSelected(newCenter);

      // Nearby hostels fetch
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${BASE}/hostels/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, km: radius }),
      });

      const result = await response.json();
      setHostels(Array.isArray(result) ? result : []);

    } catch (err) {
      console.error(err);
      alert("Error searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold text-purple-900 mb-4 tracking-tight">
        Advanced Search
      </h1>
      <p className="text-lg text-purple-600 mb-16 font-medium">
        Find hostels near your desired location using distance-based filtering.
      </p>

      {/* SEARCH CARD - same */}
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-6xl">
        {/* ... same controls ... */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
          <div className="flex-1 w-full">
            <label className="flex items-center text-purple-700 font-medium mb-3 text-sm">
              <FaMapMarkerAlt className="mr-2 text-purple-600" />
              Search Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Type your desired location"
              className="w-full px-5 py-4 text-lg border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-end gap-6">
            <div className="text-center">
              <label className="text-purple-700 font-medium mb-3 block text-sm">
                Search Radius
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-48 h-2 bg-purple-100 rounded-full appearance-none cursor-pointer slider-custom"
                style={{
                  background: `linear-gradient(to right, #c4b5fd 0%, #c4b5fd ${sliderPercentage}%, #e9d5ff ${sliderPercentage}%, #e9d5ff 100%)`,
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-purple-600">
                <span>1 km</span>
                <span>40 km</span>
              </div>
            </div>

            <button
              onClick={fetchCoords}
              disabled={isSearching}
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-10 py-4 rounded-2xl text-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-3 mb-1"
            >
              <FaSearch className="text-xl" />
              Search
              {isSearching && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-purple-700 font-medium mb-4 text-sm">Quick Search:</p>
          <div className="flex flex-wrap gap-3">
            {quickLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleQuickSearch(loc)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm
                  ${location === loc.name
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAP WITH GOOGLE TILES */}
      <div className="w-full max-w-6xl h-[650px] rounded-3xl overflow-hidden shadow-2xl mt-16 border border-purple-100 relative z-0">
        <MapContainer center={center} zoom={14} maxZoom={20} className="h-full w-full">
          {/* Google Tiles Layer */}
        <ReactLeafletGoogleLayer 
      apiKey="AIzaSyBDBqBuj2i_CtmIHF_gpU0dvZDszz9JHaw"
      type="roadmap"  // ya "satellite" agar satellite view chahiye
    />

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
            const lat = coords[1];
            const lng = coords[0];
            if (typeof lat !== "number" || typeof lng !== "number") return null;

            return (
              <Circle
                key={h._id}
                center={[lat, lng]}
                pathOptions={hostelDotStyle}
              >
                <Popup>{h.name}</Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {/* RESULTS - same */}
      {hostels.length > 0 && (
        <div className="w-full max-w-6xl mt-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-purple-900">Search Results</h2>
            <p className="text-purple-700 font-semibold text-lg">
              {hostels.length} hostels found within {radius} km
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {hostels.map((hostel) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* Slider style */
const style = document.createElement("style");
style.innerHTML = `
.slider-custom::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #9333ea;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.slider-custom::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #9333ea;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
`;
document.head.appendChild(style);

export default AdvancedSearch;