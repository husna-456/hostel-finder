import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Mail, Star, BedDouble, Building2, CheckCircle,
  ChevronLeft, ChevronRight, X, ArrowRight, Users, Wifi, Wind,
  Car, Camera, Zap, UtensilsCrossed, Flame, Droplets, Plug,
  Shield, BookOpen, Images,
} from "lucide-react";
import { fetchClient } from "../api/fetchClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Amenity icon lookup ───────────────────────────────────────────────────────
const AMENITY_ICONS = {
  wifi: Wifi, "wi-fi": Wifi, internet: Wifi,
  ac: Wind, "air conditioning": Wind, "air conditioned": Wind,
  parking: Car, "car parking": Car,
  cctv: Camera, security: Shield,
  ups: Zap, generator: Zap, backup: Zap, electricity: Zap,
  mess: UtensilsCrossed, food: UtensilsCrossed, meals: UtensilsCrossed,
  cafeteria: UtensilsCrossed, kitchen: UtensilsCrossed,
  geyser: Flame, "hot water": Flame,
  water: Droplets, filtered: Droplets,
  laundry: Plug, washing: Plug,
  gym: Shield, library: BookOpen, study: BookOpen,
};
function getAmenityIcon(name) {
  const lower = name.toLowerCase();
  for (const [k, Icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(k)) return Icon;
  }
  return CheckCircle;
}

// ── Type badge ────────────────────────────────────────────────────────────────
const TYPE_STYLES = {
  boys:      "bg-blue-100 text-blue-700",
  girls:     "bg-pink-100 text-pink-700",
  guest:     "bg-teal-100 text-teal-700",
  hotel:     "bg-violet-100 text-violet-700",
  shortstay: "bg-orange-100 text-orange-700",
};
const TYPE_LABELS = {
  boys: "Boys Hostel", girls: "Girls Hostel", guest: "Guest House",
  hotel: "Hotel", shortstay: "Short Stay",
};
function TypeBadge({ type, small = false }) {
  const t = (type || "").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide
      ${small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"}
      ${TYPE_STYLES[t] || "bg-purple-100 text-purple-700"}`}>
      {TYPE_LABELS[t] || type || "Hostel"}
    </span>
  );
}

// ── Fullscreen lightbox ───────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const h = e => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full px-12 md:px-16" onClick={e => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={idx} src={images[idx]} alt=""
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-h-[80vh] object-contain rounded-2xl"
          />
        </AnimatePresence>
        <p className="text-center text-white/40 text-sm mt-3">{idx + 1} / {images.length}</p>
      </div>
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronLeft size={22} />
        </button>
        <button onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
          <ChevronRight size={22} />
        </button>
      </>}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
        <X size={18} />
      </button>
    </motion.div>
  );
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HostelDetails({ userPanel = false }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [hostel,   setHostel]   = useState(null);
  const [related,  setRelated]  = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [tab,      setTab]      = useState("overview");

  useEffect(() => {
    fetch(`${BASE_URL}/hostels/${id}`)
      .then(r => r.json()).then(setHostel).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!hostel?.type) return;
    fetchClient("/hostels/list")
      .then(data => {
        if (!Array.isArray(data)) return;
        setRelated(data.filter(h => h.type === hostel.type && h._id !== id).slice(0, 4));
      }).catch(() => {});
  }, [hostel?.type, id]);

  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { state: { redirectTo: `/user/book-hostel/${id}` } });
    else navigate(`/user/book-hostel/${id}`);
  };

  if (!hostel) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto" />
        <p className="text-gray-500 text-sm font-medium">Loading hostel details…</p>
      </div>
    </div>
  );

  const allImages   = hostel.images?.length > 0 ? hostel.images : [];
  const floors      = Array.isArray(hostel.floors) ? hostel.floors : [];
  const rooms       = Array.isArray(hostel.rooms)  ? hostel.rooms  : [];
  const totalRooms  = hostel.totalRooms || rooms.length || floors.reduce((a, f) => a + (f.roomIds?.length || 0), 0);
  const startPrice  = rooms.find(r => r.seatPrice)?.seatPrice || hostel.startingRent;

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "rooms",     label: `Rooms (${totalRooms || 0})` },
    { id: "amenities", label: "Amenities" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ═══════════════════════════ GALLERY ═══════════════════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative bg-gray-900">
        <button
          onClick={() => navigate(userPanel ? "/user/hostel-listing" : "/all-hostels")}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Mobile: horizontal scroll strip */}
        <div className="md:hidden relative">
          <div className="flex overflow-x-auto snap-x snap-mandatory h-72 scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {allImages.length > 0 ? allImages.map((img, i) => (
              <div key={i} className="shrink-0 w-full h-full snap-start cursor-pointer relative overflow-hidden"
                onClick={() => setLightbox({ images: allImages, startIndex: i })}>
                <img src={img} alt={`${hostel.name} — photo ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </div>
            )) : (
              <div className="shrink-0 w-full h-full flex items-center justify-center bg-gray-800">
                <BedDouble size={48} className="text-gray-600" />
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <Images size={11} /> {allImages.length} photos
            </div>
          )}
        </div>

        {/* Desktop: 60/40 split */}
        <div className="hidden md:grid h-[500px]" style={{ gridTemplateColumns: "3fr 2fr", gap: "2px" }}>
          {/* Main image */}
          <div className="relative overflow-hidden cursor-pointer group"
            onClick={() => setLightbox({ images: allImages.length > 0 ? allImages : [], startIndex: 0 })}>
            {allImages[0] ? (
              <img src={allImages[0]} alt={hostel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <BedDouble size={64} className="text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {allImages.length > 0 && (
              <div className="absolute bottom-4 right-4">
                <span className="bg-white/90 hover:bg-white backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-colors">
                  <Images size={13} className="text-purple-600" /> View all {allImages.length} photos
                </span>
              </div>
            )}
          </div>

          {/* 2×2 thumbnails */}
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
            {[1, 2, 3, 4].map(i => {
              const img = allImages[i];
              const isLast = i === 4 && allImages.length > 5;
              return (
                <div key={i} className="relative overflow-hidden cursor-pointer group"
                  onClick={() => setLightbox({ images: allImages, startIndex: Math.min(i, allImages.length - 1) })}>
                  {img ? (
                    <>
                      <img src={img} alt={`${hostel.name} — photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <BedDouble size={22} className="text-gray-700" />
                    </div>
                  )}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <span className="text-white font-extrabold text-2xl">+{allImages.length - 5}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════ HEADER + TABS ════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

            {/* Left */}
            <div className="flex-1 min-w-0">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <TypeBadge type={hostel.type} />
                  {hostel.rating && (
                    <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <Star size={11} fill="currentColor" /> {hostel.rating}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2.5">
                  {hostel.name}
                </h1>

                {/* Location — icon aligns to first text line on long addresses */}
                <div className="flex items-start gap-2 text-gray-500 text-sm mb-1">
                  <MapPin size={15} className="text-purple-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed break-words">{hostel.address}</span>
                </div>
              </motion.div>

              {/* Quick stats — pill chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { Icon: Building2,   label: "Floors", value: floors.length || "—"  },
                  { Icon: BedDouble,   label: "Rooms",  value: totalRooms || "—"     },
                  { Icon: CheckCircle, label: "Status", value: hostel.isBlocked ? "Unavailable" : "Available", green: !hostel.isBlocked },
                  ...(hostel.rating ? [{ Icon: Star, label: "Rating", value: `${hostel.rating}/5` }] : []),
                ].map(s => (
                  <div key={s.label}
                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 text-xs">
                    <s.Icon size={12} className={s.green ? "text-green-500" : "text-purple-500"} />
                    <span className="text-gray-400">{s.label}:</span>
                    <span className={`font-semibold ${s.green ? "text-green-700" : "text-gray-800"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now — desktop */}
            <motion.button
              onClick={handleBookNow}
              whileHover={{ scale: 1.05, boxShadow: "0 12px 35px rgba(124,58,237,0.35)" }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-colors shrink-0"
            >
              Book Now <ArrowRight size={18} />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100 mt-4 -mx-4 md:-mx-8 px-4 md:px-8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative px-4 md:px-6 py-3 text-sm font-semibold transition-colors ${tab === t.id ? "text-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
                {t.label}
                {tab === t.id && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════ CONTENT ══════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
                <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="space-y-5">

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-purple-600 rounded-full" /> About This Hostel
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {hostel.description || "A comfortable and affordable hostel offering quality accommodations for students and professionals. Conveniently located with easy access to major facilities."}
                    </p>
                  </div>

                  {(hostel.contact?.phone || hostel.contact?.email || hostel.address) && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full" /> Contact &amp; Location
                      </h2>
                      <div className="space-y-3">
                        {hostel.contact?.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"><Phone size={15} className="text-purple-600" /></div>
                            <div><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone</p><p className="text-gray-800 font-semibold">{hostel.contact.phone}</p></div>
                          </div>
                        )}
                        {hostel.contact?.email && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"><Mail size={15} className="text-purple-600" /></div>
                            <div><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p><p className="text-gray-800 font-semibold">{hostel.contact.email}</p></div>
                          </div>
                        )}
                        {hostel.address && (
                          <div className="flex items-start gap-3 text-sm">
                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><MapPin size={15} className="text-purple-600" /></div>
                            <div><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Address</p><p className="text-gray-800 font-semibold leading-snug">{hostel.address}</p></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {floors.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full" /> Floor Summary
                      </h2>
                      <div className="space-y-2">
                        {floors.map((floor, i) => (
                          <div key={floor.floorId || i} className="flex items-center justify-between bg-gray-50 hover:bg-purple-50/50 rounded-xl px-4 py-3 border border-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{floor.floorNumber ?? i + 1}</div>
                              <span className="font-semibold text-gray-800 text-sm">{floor.name}</span>
                            </div>
                            <div className="flex gap-5 text-right text-sm">
                              <div><p className="font-bold text-gray-800">{floor.roomIds?.length || 0}</p><p className="text-xs text-gray-400">Rooms</p></div>
                              <div><p className="font-bold text-green-600">{floor.availableSeats || 0}</p><p className="text-xs text-gray-400">Seats</p></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── ROOMS ── */}
              {tab === "rooms" && (
                <motion.div key="rm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  {rooms.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                      <BedDouble size={48} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500">No room data available for this hostel.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {rooms.map((room, ri) => {
                        const imgs = room.images?.length > 0 ? room.images : null;
                        const left = room.totalSeats != null ? room.totalSeats - (room.reservedSeats || 0) : null;
                        return (
                          <div key={room.roomId || ri} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            {/* Image */}
                            <div className="relative h-44 bg-gray-100 cursor-pointer group overflow-hidden"
                              onClick={() => imgs && setLightbox({ images: imgs, startIndex: 0 })}>
                              {imgs ? (
                                <>
                                  <img src={imgs[0]} alt={room.title || `Room ${ri + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                  {imgs.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/55 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                      +{imgs.length - 1} photos
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-gray-100">
                                  <BedDouble size={36} className="text-purple-200" />
                                </div>
                              )}
                              {room.type && (
                                <div className="absolute top-3 left-3">
                                  <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full capitalize">{room.type}</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-3">
                              <h3 className="font-bold text-gray-900 text-base leading-tight">{room.title || room.type || `Room ${ri + 1}`}</h3>

                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-purple-600">Rs. {room.seatPrice?.toLocaleString() || "—"}</span>
                                <span className="text-gray-400 text-xs">/seat/mo</span>
                              </div>

                              {room.totalSeats != null && (
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-gray-600"><Users size={13} className="text-purple-400" />{room.totalSeats} seats</span>
                                  <span className={`flex items-center gap-1 font-semibold ${left === 0 ? "text-red-500" : "text-green-600"}`}>
                                    <CheckCircle size={13} />{left === 0 ? "Full" : `${left} available`}
                                  </span>
                                </div>
                              )}

                              {room.advanceAmount > 0 && (
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  <Zap size={11} /> Advance: Rs. {room.advanceAmount.toLocaleString()}
                                </div>
                              )}

                              {room.features?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {room.features.slice(0, 4).map((f, fi) => (
                                    <span key={fi} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
                                  ))}
                                </div>
                              )}

                              <button onClick={handleBookNow}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                                Book This Room <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── AMENITIES ── */}
              {tab === "amenities" && (
                <motion.div key="am" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <span className="w-1 h-6 bg-purple-600 rounded-full" /> All Facilities
                    </h2>
                    {hostel.facilities?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {hostel.facilities.map((fac, i) => {
                          const Icon = getAmenityIcon(fac);
                          return (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-xl p-3.5 transition-colors">
                              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                <Icon size={17} className="text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{fac}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-8">No facilities listed.</p>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Pricing sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-6 text-white">
                  <p className="text-purple-200 text-xs uppercase tracking-widest mb-1 font-medium">Starting from</p>
                  {startPrice ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold">Rs. {startPrice.toLocaleString()}</span>
                      <span className="text-purple-200 text-sm">/seat/mo</span>
                    </div>
                  ) : <span className="text-xl font-bold">Contact for Pricing</span>}
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Location",  value: hostel.address,          Icon: MapPin   },
                      { label: "Type",      value: TYPE_LABELS[hostel.type] || hostel.type, Icon: Building2 },
                      { label: "Floors",    value: floors.length || null,   Icon: Building2 },
                      { label: "Rooms",     value: totalRooms || null,      Icon: BedDouble },
                      { label: "Status",    value: hostel.isBlocked ? "Unavailable" : "Available", Icon: CheckCircle },
                    ].filter(d => d.value).map(({ label, value, Icon }) => (
                      <div key={label} className="flex items-start justify-between gap-3 border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-1.5 text-gray-400 shrink-0 text-xs"><Icon size={11} />{label}</div>
                        <span className="text-gray-800 font-medium text-xs text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button onClick={handleBookNow}
                    whileHover={{ scale: 1.03, boxShadow: "0 12px 35px rgba(124,58,237,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-purple-200 mt-2">
                    Book Now <ArrowRight size={16} />
                  </motion.button>
                  <p className="text-xs text-gray-400 text-center">Advance payment required</p>
                </div>
              </div>

              {/* Seat availability */}
              {rooms.some(r => r.totalSeats != null) && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                    <BedDouble size={14} className="text-purple-500" /> Seat Availability
                  </h3>
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {rooms.filter(r => r.totalSeats != null).map(room => {
                      const pct  = Math.min(100, ((room.reservedSeats || 0) / room.totalSeats) * 100);
                      const left = room.totalSeats - (room.reservedSeats || 0);
                      const bar  = pct >= 100 ? "bg-red-500" : pct > 80 ? "bg-orange-500" : pct > 50 ? "bg-amber-500" : "bg-green-500";
                      return (
                        <div key={room.roomId}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium truncate pr-2">{room.title || room.type || "Room"}</span>
                            <span className={pct >= 100 ? "text-red-500 font-bold shrink-0" : "text-gray-600 shrink-0"}>{pct >= 100 ? "FULL" : `${left} left`}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════ RELATED HOSTELS ══════════════════════════ */}
      {related.length > 0 && (
        <Reveal className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Similar {TYPE_LABELS[hostel.type] || "Hostels"} in Gujranwala
              </h2>
              <button onClick={() => navigate("/all-hostels")}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {related.map(h => (
                <div key={h._id}
                  className="shrink-0 w-56 snap-start bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(userPanel ? `/user/hostel-listing/${h._id}` : `/hostels/${h._id}`)}>
                  <div className="h-32 relative overflow-hidden">
                    {h.images?.[0] ? (
                      <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center"><BedDouble size={28} className="text-gray-400" /></div>
                    )}
                    <div className="absolute top-2 left-2"><TypeBadge type={h.type} small /></div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-800 text-sm truncate mb-1">{h.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 truncate">
                      <MapPin size={10} className="text-purple-400 shrink-0" />{h.address}
                    </p>
                    {h.startingRent && (
                      <p className="text-purple-700 font-extrabold text-sm">
                        PKR {h.startingRent.toLocaleString()}<span className="text-gray-400 font-normal text-xs"> /mo</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Mobile sticky Book Now */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl">
        <motion.button onClick={handleBookNow} whileTap={{ scale: 0.97 }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
          Book Now <ArrowRight size={18} />
        </motion.button>
      </div>
      <div className="lg:hidden h-20" />

      <AnimatePresence>
        {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.startIndex} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
}
