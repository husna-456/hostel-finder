// src/pages/ResultsPage.jsx
import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
import HostelCard from "../components/HostelCard";
import HeroSection from "../components/HeroSection";

export default function ResultsPage() {
    const { searchFilters } = useSearch();
  const { location = "", category = "", km = 5 } = searchFilters || {};


    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);

    // -------------------------------------------
    // 🟣 STEP 1: get (lat,lng) of typed location
    // -------------------------------------------
    async function geocodeLocation(text) {
        if (!text.trim()) return null;

        const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await fetch(`${BASE}/location/geocode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          console.log("❌ Geocode failed");
          return null;
        }

        const data = await res.json();
        return {
          lat: data.lat,
          lng: data.lng,
        };
    }
    // -------------------------------------------
    // 🟣 STEP 2: Ask backend for nearest hostels
    // -------------------------------------------
    useEffect(() => {
          async function fetchNearby() {
            setLoading(true);

 

            // If no location → backend se filter na karo
            if (!location || location.trim() === "") {
                const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
                const res = await fetch(`${BASE}/hostels/list`);
                const list = await res.json();
                setFiltered(list);
                setLoading(false);
                return;
            }


            // Get coordinates from Geoapify
            const coords = await geocodeLocation(location);

            // ⚡ Console me coordinates
        console.log("Coordinates for", location, ":", coords);

            if (!coords) {
                console.log("❌ No coordinates found");
                setFiltered([]);
                setLoading(false);
                return;
            }

            // Hit Backend API with coordinates
            const BASE2 = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            const res = await fetch(`${BASE2}/hostels/nearby`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat: coords.lat,
                    lng: coords.lng,
                    km,
                    category: category || "",
                }),
            });

            const data = await res.json();
            setFiltered(data);
            setLoading(false);
        }

        fetchNearby();
    }, [location, category, km]);

    return (
        <div className="w-full relative bg-white-100">
            <HeroSection bannerImage="/hostel-banner.jpg" />

            <div className="text-center mt-10 mb-10 font-mono tracking-widest">
                <h1 className="text-4xl font-extrabold">SEARCHED HOSTELS</h1>
                <p className="text-gray-600 text-lg">Find nearby hostels</p>

                {filtered.length > 0 && (
                    <p className="text-lg font-semibold mt-2 text-black">
                        Found{" "}
                        <span className="text-purple-700">{filtered.length}</span>{" "}
                        hostels within {km} km.
                    </p>
                )}
            </div>

            {loading ? (
                <p className="text-center text-xl">Loading...</p>
            ) : filtered.length === 0 ? (
                <p className="text-center text-xl">No hostels found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-10">
                    {filtered.map((h) => (
                        <HostelCard key={h._id} hostel={h} />
                    ))}
                </div>
            )}
        </div>
    );
}
