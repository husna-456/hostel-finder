import HeroSection from "../components/HeroSection";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  BadgeDollarSign,
  Search,
  Eye,
  CalendarCheck,
  Star,
  ArrowRight,
  Send,
  CheckCircle2,
  Building2,
  Users,
  Globe,
  Plus,
  ChevronRight,
} from "lucide-react";

/* ─── Scroll reveal wrapper ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dir = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const hidden = {
    opacity: 0,
    y: dir === "up" ? 44 : 0,
    x: dir === "left" ? -44 : dir === "right" ? 44 : 0,
  };
  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : hidden}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FEATURED_HOSTELS = [
  {
    id: 1,
    name: "Fatima Jinnah Girls Hostel",
    location: "Satellite Town, Rawalpindi",
    price: "PKR 8,000",
    rating: 4.8,
    badge: "Girls Only",
    badgeColor: "bg-pink-500",
    tags: ["WiFi", "Study Area", "Meals"],
    img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
  },
  {
    id: 2,
    name: "Capital Executive Hostel",
    location: "G-11 Markaz, Islamabad",
    price: "PKR 15,000",
    rating: 4.9,
    badge: "Premium",
    badgeColor: "bg-violet-600",
    tags: ["AC Rooms", "Gym", "Café"],
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  },
  {
    id: 3,
    name: "The Maryam Residency",
    location: "Gulshan-e-Iqbal, Karachi",
    price: "PKR 12,500",
    rating: 4.7,
    badge: "Verified",
    badgeColor: "bg-teal-600",
    tags: ["Security", "Backup Power"],
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Search Hostels",
    desc: "Filter by location, category, and budget to find your ideal stay near your campus or workplace.",
    Icon: Search,
    color: "from-purple-600 to-violet-700",
    shadow: "shadow-purple-200",
  },
  {
    num: "02",
    title: "View Details",
    desc: "Check amenities, real photos, verified reviews and floor-wise room info from current students.",
    Icon: Eye,
    color: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-200",
  },
  {
    num: "03",
    title: "Book & Chat",
    desc: "Connect with hostel owners directly via our chat system and secure your room in minutes.",
    Icon: CalendarCheck,
    color: "from-teal-500 to-cyan-600",
    shadow: "shadow-teal-200",
  },
];

const WHY_US = [
  {
    Icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every hostel is manually reviewed and verified by our team before going live on the platform.",
    iconBg: "bg-purple-600/15 text-purple-400",
  },
  {
    Icon: MapPin,
    title: "Location-Based Search",
    desc: "Find hostels within your chosen radius using GPS-accurate data and area-based filters.",
    iconBg: "bg-pink-500/15 text-pink-400",
  },
  {
    Icon: MessageCircle,
    title: "Direct Chat",
    desc: "Message hostel owners directly without any middlemen or third-party agents.",
    iconBg: "bg-teal-500/15 text-teal-400",
  },
  {
    Icon: BadgeDollarSign,
    title: "Best Prices",
    desc: "Compare prices across multiple hostels side by side and always pick the best deal.",
    iconBg: "bg-yellow-500/15 text-yellow-400",
  },
];

const CHAT_MESSAGES = [
  { from: "bot", text: "Hi! How can I help you find a hostel? What's your preferred location?" },
  { from: "user", text: "I'm looking for girls hostel near NUST. Any options?" },
  { from: "bot", text: "Found 4 great options! Fatima Jinnah Girls Hostel is closest. Want to see details?" },
];

const STATS = [
  { Icon: Building2, num: "500+", label: "Hostels Listed" },
  { Icon: Users, num: "10K+", label: "Students Placed" },
  { Icon: Globe, num: "50+", label: "Cities Covered" },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const { role } = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [email, setEmail] = useState("");

  const handleSearch = (filters) => console.log(filters);

  if (role === "hostel_owner") return <Navigate to="/hostel_owner/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════ HERO ══════════════════════ */}
      <HeroSection onSearch={handleSearch} bannerImage="/banner.jpg" />

      {/* ═══════════════════════════════ WHY CHOOSE US ═════════════════════ */}
      <section className="bg-gray-950 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
                <span className="w-10 h-px bg-purple-500/60" />
                Why HostelFinder
                <span className="w-10 h-px bg-purple-500/60" />
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                The Smarter Way to<br />
                <span className="text-purple-400">Find a Hostel</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -7 }}
                  transition={{ type: "spring", stiffness: 280 }}
                  className="bg-gray-900 rounded-2xl p-7 border border-gray-800 hover:border-purple-500/40 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}>
                    <item.Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2.5 group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed">{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FEATURED HOSTELS ══════════════════════ */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
              <div>
                <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-purple-400" />
                  Curated Selection
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                  Featured <span className="text-purple-600">Hostels</span>
                </h2>
              </div>
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  to="/all-hostels"
                  className="text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-1.5 group text-base"
                >
                  View All Hostels
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_HOSTELS.map((h, i) => (
              <Reveal key={h.id} delay={i * 0.13}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-purple-100 group transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.img
                      src={h.img}
                      alt={h.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className={`absolute top-3 left-3 ${h.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                      {h.badge}
                    </span>
                    <div className="absolute top-3 right-3 bg-white/95 text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded-full shadow flex items-center gap-1">
                      <Star size={11} fill="#facc15" stroke="none" /> {h.rating}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-1.5 group-hover:text-purple-700 transition-colors leading-snug">
                      {h.name}
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                      <MapPin size={13} className="text-purple-400 flex-shrink-0" />
                      {h.location}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {h.tags.map((t) => (
                        <span key={t} className="bg-purple-50 text-purple-600 text-xs font-medium px-3 py-1 rounded-full border border-purple-100">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-widest">From</p>
                        <p className="text-purple-700 font-extrabold text-xl leading-tight">
                          {h.price}
                          <span className="text-gray-400 font-normal text-xs"> /mo</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="border border-purple-200 text-purple-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                          Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <MessageCircle size={14} />
                          Chat
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-purple-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
                <span className="w-10 h-px bg-purple-300" />
                Simple Process
                <span className="w-10 h-px bg-purple-300" />
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                How <span className="text-purple-600">It Works</span>
              </h2>
              <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
                From search to booking in just three simple steps — no calls, no confusion.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Dashed connector */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+4rem)] right-[calc(16.67%+4rem)] border-t-2 border-dashed border-purple-200 z-0" />

            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.14}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 260 }}
                  className="relative bg-white rounded-2xl p-10 text-center border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all z-10 group"
                >
                  {/* Watermark number */}
                  <span className="absolute top-5 right-6 text-7xl font-extrabold text-gray-50 select-none leading-none pointer-events-none">
                    {s.num}
                  </span>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`w-[68px] h-[68px] bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ${s.shadow} relative z-10`}
                  >
                    <s.Icon size={30} strokeWidth={1.7} className="text-white" />
                  </motion.div>

                  <h3 className="font-extrabold text-gray-900 text-xl mb-3 group-hover:text-purple-700 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed">{s.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CHAT SECTION ══════════════════════════ */}
      <section className="py-28 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left text */}
          <Reveal dir="left">
            <span className="inline-block bg-purple-500/15 text-purple-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-purple-500/20">
              24/7 Support
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
              Can't decide<br />where to stay?<br />
              <span className="text-purple-400">Chat with Us.</span>
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
              Our real-time chat system helps you compare hostels, find amenities, and get answers instantly — no waiting.
            </p>
            <div className="space-y-4">
              {[
                "Verified Owner Information",
                "Instant Amenity Comparisons",
                "Real-time Availability",
                "Budget Optimization",
              ].map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                  className="flex items-center gap-3.5"
                >
                  <div className="w-7 h-7 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-purple-400" />
                  </div>
                  <span className="text-gray-300 text-base">{f}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* Chat widget */}
          <Reveal dir="right" delay={0.15}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-purple-700 to-violet-800 px-6 py-4 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white font-extrabold"
                >
                  HF
                </motion.div>
                <div>
                  <p className="text-white font-bold">Chat System</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <p className="text-purple-200 text-xs">Always Online</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 h-56 overflow-y-auto bg-gray-900/50">
                {CHAT_MESSAGES.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.from === "user"
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700"
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-6 pb-6 pt-4 bg-gray-900">
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl border border-gray-700 focus-within:border-purple-500 px-4 py-3 transition-all">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-sm text-gray-200 bg-transparent outline-none placeholder-gray-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Send size={15} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ STATS STRIP ════════════════════════════ */}
      <section className="bg-purple-700 py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map(({ Icon, num, label }, i) => (
            <Reveal key={label} delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.06 }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Icon size={26} className="text-white" strokeWidth={1.7} />
                </div>
                <p className="text-white font-extrabold text-4xl leading-none">{num}</p>
                <p className="text-purple-200 text-base font-medium">{label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ OWNER CTA ══════════════════════════════ */}
      <section className="relative py-20 md:py-32 overflow-hidden mx-3 md:mx-8 my-12 md:my-16 rounded-3xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/92 via-gray-950/72 to-transparent" />
          <motion.div
            className="absolute inset-0 bg-purple-900/20"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">
          <div className="max-w-xl">
            <Reveal dir="left">
              <span className="inline-block bg-purple-600/30 backdrop-blur-sm text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-purple-500/30">
                For Hostel Owners
              </span>
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Own a Hostel?<br />
                <span className="text-purple-400">List it Today.</span>
              </h2>
              <p className="text-white/65 text-xl mb-10 leading-relaxed">
                Join Pakistan's largest hostel network and start receiving verified bookings from students and professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 45px rgba(124,58,237,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2.5 shadow-2xl shadow-purple-900/60 transition-all text-base"
                >
                  <Plus size={20} /> List Your Hostel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="border-2 border-white/35 text-white font-semibold px-7 py-4 rounded-xl backdrop-blur-sm transition-all text-base flex items-center gap-2"
                >
                  Learn More <ArrowRight size={18} />
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-8 mt-10">
                {[["500+", "Hostels Listed"], ["10k+", "Students Placed"], ["50+", "Cities"]].map(
                  ([num, lbl], i) => (
                    <motion.div
                      key={lbl}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <p className="text-white font-extrabold text-3xl">{num}</p>
                      <p className="text-white/45 text-sm mt-1">{lbl}</p>
                    </motion.div>
                  )
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ═══════════════════════════ */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-purple-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
                <span className="w-10 h-px bg-purple-300" />
                Student Reviews
                <span className="w-10 h-px bg-purple-300" />
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                What Students <span className="text-purple-600">Say</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { name: "Ayesha Tariq", uni: "NUST Islamabad", text: "Found an amazing girls hostel within 2km of campus. The search filter is so easy to use!", rating: 5 },
              { name: "Ahmed Raza", uni: "FAST Lahore", text: "Compared 5 hostels side by side and booked the best one in under 10 minutes. Love it!", rating: 5 },
              { name: "Sara Khan", uni: "UET Peshawar", text: "The direct chat with owners saved me so much time. No more calling random numbers!", rating: 4 },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        fill={j < t.rating ? "#facc15" : "#e5e7eb"}
                        stroke="none"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-extrabold text-base">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-gray-400 text-sm">{t.uni}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ NEWSLETTER ═════════════════════════════ */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl font-extrabold text-white mb-3">Stay Updated</h2>
            <p className="text-purple-200 mb-10 text-lg">
              Get new hostel listings and exclusive deals in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 rounded-xl px-5 py-3.5 text-base outline-none focus:border-white/60 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white text-purple-700 font-bold px-7 py-3.5 rounded-xl hover:bg-purple-50 transition-colors text-base whitespace-nowrap shadow-xl flex items-center gap-2"
              >
                Subscribe <ArrowRight size={16} />
              </motion.button>
            </div>
            <p className="text-purple-300/60 text-sm mt-5">No spam. Unsubscribe anytime.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
