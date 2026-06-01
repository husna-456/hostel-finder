import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaBed,
  FaBuilding, FaWifi, FaCheckCircle, FaStar, FaChevronLeft,
  FaChevronRight, FaTimes, FaExpand
} from "react-icons/fa";

// ─── Fade-in on scroll ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div className="relative max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
        <motion.img
          key={current}
          src={images[current]}
          alt=""
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-h-[80vh] object-contain rounded-2xl"
        />
        <div className="absolute inset-y-0 left-4 flex items-center">
          <button onClick={prev} className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors">
            <FaChevronLeft />
          </button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <button onClick={next} className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors">
            <FaChevronRight />
          </button>
        </div>
        <button onClick={onClose} className="absolute top-2 right-6 w-9 h-9 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors">
          <FaTimes />
        </button>
        <div className="text-center text-white/50 text-sm mt-3">{current + 1} / {images.length}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── Amenity icon mapping ─────────────────────────────────────────────────────
const AMENITY_ICONS = {
  wifi: "\u{1F4F6}", "wi-fi": "\u{1F4F6}", internet: "\u{1F4F6}",
  parking: "\u{1F17F}\uFE0F", "car parking": "\u{1F17F}\uFE0F",
  ac: "\u2744\uFE0F", "air conditioning": "\u2744\uFE0F", "air conditioned": "\u2744\uFE0F",
  meals: "\u{1F37D}\uFE0F", food: "\u{1F37D}\uFE0F", kitchen: "\u{1F37D}\uFE0F", cafeteria: "\u{1F37D}\uFE0F",
  gym: "\u{1F3CB}\uFE0F", fitness: "\u{1F3CB}\uFE0F",
  security: "\u{1F512}", guard: "\u{1F512}", cctv: "\u{1F4F7}",
  laundry: "\u{1F9FA}", washing: "\u{1F9FA}",
  electricity: "\u26A1", power: "\u26A1", generator: "\u26A1",
  water: "\u{1F4A7}", geyser: "\u{1F6FF}",
  study: "\u{1F4DA}", library: "\u{1F4DA}",
};
function getAmenityIcon(name) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "\u2713";
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HostelDetails({ userPanel = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [lightbox, setLightbox] = useState(null); // {images, startIndex}
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${BASE}/hostels/${id}`)
      .then((res) => res.json())
      .then((data) => setHostel(data))
      .catch((err) => console.error("Error fetching hostel:", err));
  }, [id]);

  // ── BOOK NOW (original logic preserved) ─────────────────────────────────────
  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { redirectTo: `/user/book-hostel/${id}` } });
    } else {
      navigate(`/user/book-hostel/${id}`);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"
          />
          <p className="text-gray-500 font-medium">Loading hostel details...</p>
        </div>
      </div>
    );
  }

  const floors = Array.isArray(hostel.floors) ? hostel.floors : [];
  const allImages = hostel.images?.length > 0 ? hostel.images : ["/images/hostel-default.jpg"];
  const heroImg = allImages[0];
  const galleryImgs = allImages.slice(1, 5);
  const totalRooms = hostel.totalRooms || floors.reduce((a, f) => a + (f.roomIds?.length || 0), 0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "rooms", label: `Rooms (${totalRooms})` },
    { id: "amenities", label: "Amenities" },
  ];

  // Room availability helper
  const getRoomAvailabilityBar = (reserved, total) => {
    if (!total || total === 0) return null;
    const pct = Math.min(100, (reserved / total) * 100);
    let color = "bg-purple-600";
    if (pct >= 100) color = "bg-red-500";
    else if (pct > 80) color = "bg-orange-500";
    else if (pct > 50) color = "bg-amber-500";
    else color = "bg-green-500";
    return { pct, color, isFull: reserved >= total };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── HERO GALLERY ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gray-900">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(userPanel ? "/user/hostel-listing" : "/all-hostels")}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full transition-all"
        >
          <FaArrowLeft className="text-xs" /> Back to All Hostels
        </motion.button>

        <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[420px] md:h-[520px] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
            onClick={() => setLightbox({ images: allImages, startIndex: 0 })}
          >
            <img src={heroImg} alt={hostel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <span className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                  {hostel.category || "Hostel"}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">{hostel.name}</h1>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <FaMapMarkerAlt className="text-purple-400 flex-shrink-0" />
                  <span>{hostel.address}</span>
                </div>
              </motion.div>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 backdrop-blur-sm text-white rounded-full p-2"><FaExpand className="text-xs" /></div>
            </div>
          </motion.div>

          {[0, 1, 2, 3].map((i) => {
            const imgSrc = galleryImgs[i] || heroImg;
            const isLast = i === 3 && allImages.length > 5;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className="hidden md:block relative overflow-hidden cursor-pointer group"
                onClick={() => setLightbox({ images: allImages, startIndex: i + 1 })}
              >
                <img src={imgSrc} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white font-bold text-lg">+{allImages.length - 5} more</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center gap-6 py-4">
            {[
              { icon: <FaBuilding className="text-purple-500" />, label: "Floors", value: floors.length || "N/A" },
              { icon: <FaBed className="text-purple-500" />, label: "Total Rooms", value: totalRooms || "N/A" },
              { icon: <FaCheckCircle className="text-green-500" />, label: "Status", value: hostel.status || "Available" },
              { icon: <FaStar className="text-yellow-400" />, label: "Rating", value: hostel.rating ? `${hostel.rating}/5` : "New" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">{s.icon}</div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{s.label}</p>
                    <p className="text-gray-900 font-bold text-sm leading-none mt-0.5">{s.value}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
            <div className="ml-auto hidden md:block">
              <motion.button
                onClick={handleBookNow}
                whileHover={{ scale: 1.04, boxShadow: "0 12px 35px rgba(124,58,237,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-200 transition-colors"
              >
                Book Now <FaArrowRight />
              </motion.button>
            </div>
          </div>

          <div className="flex gap-0 border-t border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === tab.id ? "text-purple-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Main Content ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                <FadeIn>
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-purple-600 rounded-full inline-block" />
                      About This Hostel
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {hostel.description || "A comfortable and affordable hostel offering quality accommodations for students and professionals. Conveniently located with easy access to major facilities."}
                    </p>
                  </div>
                </FadeIn>

                {hostel.facilities?.length > 0 && (
                  <FadeIn delay={0.1}>
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full inline-block" />
                        Facilities & Amenities
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {hostel.facilities.map((fac, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            className="flex items-center gap-2.5 bg-purple-50/70 hover:bg-purple-50 border border-purple-100/60 rounded-xl px-3.5 py-3 transition-colors"
                          >
                            <span className="text-xl leading-none">{getAmenityIcon(fac)}</span>
                            <span className="text-sm font-medium text-gray-700">{fac}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )}

                {floors.length > 0 && (
                  <FadeIn delay={0.15}>
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full inline-block" />
                        Floor Summary
                      </h2>
                      <div className="space-y-3">
                        {floors.map((floor, i) => (
                          <motion.div
                            key={floor.floorId}
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-center justify-between bg-gray-50 hover:bg-purple-50/50 rounded-xl px-4 py-3 border border-gray-100 hover:border-purple-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaBuilding className="text-purple-600 text-xs" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{floor.name}</p>
                                <p className="text-xs text-gray-400">Floor {floor.floorNumber ?? i + 1}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-right">
                              <div>
                                <p className="font-bold text-gray-800">{floor.roomIds?.length || 0}</p>
                                <p className="text-xs text-gray-400">Rooms</p>
                              </div>
                              <div>
                                <p className="font-bold text-green-600">{floor.availableSeats || 0}</p>
                                <p className="text-xs text-gray-400">Seats</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )}
              </motion.div>
            )}

            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <motion.div key="rooms" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                {floors.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <FaBed className="text-gray-200 text-5xl mx-auto mb-4" />
                    <p className="text-gray-500">No room data available</p>
                  </div>
                ) : (
                  floors.map((floor, fi) => {
                    const floorRooms = Array.isArray(floor.roomIds)
                      ? floor.roomIds.map((roomId) => hostel.rooms?.find((r) => r.roomId === roomId)).filter(Boolean)
                      : [];

                    return (
                      <FadeIn key={floor.floorId} delay={fi * 0.08}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-50/50 border-b border-purple-100/40">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {floor.floorNumber ?? fi + 1}
                              </div>
                              <h3 className="font-bold text-gray-900">{floor.name}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="bg-white text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-medium">{floorRooms.length} rooms</span>
                              <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full text-xs font-medium">{floor.availableSeats || 0} seats free</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-6">
                            {floorRooms.map((room, ri) => {
                              const roomImages = room.images?.length > 0 ? room.images : ["/images/hostel-default.jpg"];
                              return (
                                <motion.div
                                  key={room.roomId}
                                  initial={{ opacity: 0, y: 16 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: ri * 0.07 }}
                                  whileHover={{ y: -4 }}
                                  className="bg-gray-50 hover:bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 group"
                                >
                                  <div
                                    className="relative h-40 overflow-hidden cursor-pointer"
                                    onClick={() => setLightbox({ images: roomImages, startIndex: 0 })}
                                  >
                                    <img
                                      src={roomImages[0]}
                                      alt={room.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    {roomImages.length > 1 && (
                                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        +{roomImages.length - 1} photos
                                      </div>
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-black/40 backdrop-blur-sm text-white rounded-full p-1.5"><FaExpand className="text-xs" /></div>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-bold text-gray-900 text-base leading-tight">{room.title}</h4>
                                      {room.type && (
                                        <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{room.type}</span>
                                      )}
                                    </div>

                                    <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Seat Rent</span>
                                        <span className="font-bold text-purple-700 text-sm">Rs. {room.seatPrice?.toLocaleString() || "N/A"}<span className="text-gray-400 font-normal text-xs">/mo</span></span>
                                      </div>
                                      {room.monthlyTotal && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-gray-400">Monthly Total</span>
                                          <span className="font-semibold text-gray-700 text-sm">Rs. {room.monthlyTotal?.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {room.firstMonthCharge && (
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-1.5">
                                          <span className="text-xs text-gray-400">First Month</span>
                                          <span className="font-semibold text-green-700 text-sm">Rs. {room.firstMonthCharge?.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>

                                    {room.features?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {room.features.map((f, fi) => (
                                          <span key={fi} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Room Availability Section */}
                          {hostel.rooms?.length > 0 && hostel.rooms.some(r => r.totalSeats != null || r.reservedSeats != null) && (
                            <div className="px-6 pb-6">
                              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
                                Seat Availability
                              </h4>
                              <div className="space-y-3">
                                {hostel.rooms
                                  .filter(r => r.floorId === floor.floorId)
                                  .map((room) => {
                                    const avail = getRoomAvailabilityBar(room.reservedSeats || 0, room.totalSeats);
                                    if (!avail) return null;
                                    const seatsLeft = room.totalSeats - (room.reservedSeats || 0);
                                    return (
                                      <div key={room.roomId} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600 font-medium">
                                            {room.title || room.type || "Room"}
                                          </span>
                                          <span className={`font-semibold ${avail.isFull ? "text-red-500" : "text-gray-700"}`}>
                                            {avail.isFull ? "FULL \u{1F534}" : `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full transition-all ${avail.color}`}
                                            style={{ width: `${avail.pct}%` }}
                                          />
                                        </div>
                                        <p className="text-xs text-gray-400">
                                          {room.reservedSeats || 0}/{room.totalSeats || 0} booked
                                        </p>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      </FadeIn>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* Amenities Tab */}
            {activeTab === "amenities" && (
              <motion.div key="amenities" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-600 rounded-full inline-block" />
                    All Facilities
                  </h2>
                  {hostel.facilities?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {hostel.facilities.map((fac, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.04, y: -3 }}
                          className="flex flex-col items-center gap-2 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center transition-colors cursor-default"
                        >
                          <span className="text-3xl">{getAmenityIcon(fac)}</span>
                          <span className="text-sm font-semibold text-gray-700">{fac}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No facilities listed</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Booking Sidebar ────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">

            <FadeIn>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-6 text-white">
                  <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">Starting from</p>
                  <div className="flex items-baseline gap-1">
                    {hostel.rooms?.[0]?.seatPrice ? (
                      <>
                        <span className="text-3xl font-extrabold">Rs. {hostel.rooms[0].seatPrice.toLocaleString()}</span>
                        <span className="text-purple-200 text-sm">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-extrabold">Contact for Pricing</span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Location", value: hostel.address },
                      { label: "Category", value: hostel.category || "Hostel" },
                      { label: "Total Floors", value: floors.length },
                      { label: "Total Rooms", value: totalRooms },
                      { label: "Status", value: hostel.status || "Available" },
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="flex justify-between items-start border-b border-gray-50 pb-2">
                        <span className="text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-gray-800 font-medium text-right ml-3 text-xs">{value}</span>
                      </div>
                    ) : null)}
                  </div>

                  <motion.button
                    onClick={handleBookNow}
                    whileHover={{ scale: 1.03, boxShadow: "0 12px 35px rgba(124,58,237,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-purple-200 mt-2"
                  >
                    Book Now <FaArrowRight />
                  </motion.button>

                  <p className="text-xs text-gray-400 text-center">Advance payment required to reserve</p>
                </div>
              </div>
            </FadeIn>

            {/* Room Availability Sidebar Card */}
            {hostel.rooms?.length > 0 && hostel.rooms.some(r => r.totalSeats != null) && (
              <FadeIn delay={0.05}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <FaBed className="text-purple-500" /> Room Availability
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {hostel.rooms.map((room) => {
                      const avail = getRoomAvailabilityBar(room.reservedSeats || 0, room.totalSeats);
                      if (!avail) return null;
                      const seatsLeft = room.totalSeats - (room.reservedSeats || 0);
                      return (
                        <div key={room.roomId} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-medium">
                              {room.title || room.type || "Room"}
                            </span>
                            <span className={avail.isFull ? "text-red-500 font-semibold" : "text-gray-700"}>
                              {avail.isFull ? "FULL" : `${seatsLeft} left`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${avail.color}`}
                              style={{ width: `${avail.pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-500" /> Location
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{hostel.address}</p>
                <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center overflow-hidden">
                  <p className="text-gray-400 text-xs">Map View</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100/60 space-y-2">
                <p className="font-bold text-gray-900 text-sm">Need Help?</p>
                <p className="text-gray-500 text-xs leading-relaxed">Contact us for more info about this hostel or to schedule a visit.</p>
                <button className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition-colors">
                  Chat with Owner →
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOOK NOW ───────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <motion.button
          onClick={handleBookNow}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-200"
        >
          Book Now <FaArrowRight />
        </motion.button>
      </div>

      <div className="lg:hidden h-20" />

      <AnimatePresence>
        {lightbox && (
          <Lightbox images={lightbox.images} startIndex={lightbox.startIndex} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
