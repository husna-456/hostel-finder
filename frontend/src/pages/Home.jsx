import HeroSection from "../components/HeroSection";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { fetchClient } from "../api/fetchClient";
import { formatStatNumber } from "../utils/formatStat";
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
  LogIn,
  CheckCircle2,
  Building2,
  Users,
  Globe,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAT_ICONS = { building: Building2, users: Users, map: Globe, star: Star };

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

/* ─── Skeleton loader ────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 w-14 bg-gray-100 rounded-full" />
          <div className="h-6 w-14 bg-gray-100 rounded-full" />
        </div>
        <div className="h-px bg-gray-100 mt-2" />
        <div className="flex justify-between pt-1">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-pulse space-y-4">
      <div className="flex gap-1">{[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 bg-gray-200 rounded" />)}</div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-full" />
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

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

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Single source of truth for homepage/FAQ stats — managed from the Admin Panel
  const [siteStats, setSiteStats] = useState(null);

  // Newsletter subscribe state
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null); // { type: 'success' | 'error', message }

  useEffect(() => {
    fetchClient("/hostels/featured")
      .then((data) => setFeaturedHostels(Array.isArray(data) ? data : []))
      .catch((err) => { console.error("Featured hostels error:", err); setFeaturedHostels([]); })
      .finally(() => setLoadingFeatured(false));

    fetchClient("/reviews/approved")
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));

    fetch(`${BASE_URL}/site-content/facts`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => setSiteStats(Array.isArray(d?.stats) ? d.stats : []))
      .catch(() => setSiteStats([]));
  }, []);

  const handleSearch = (filters) => console.log(filters);

  const handleListHostel = () => navigate("/login");

  const handleChatCTA = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (role === "hostel_owner") navigate("/hostel_owner/chat");
    else if (role === "admin") navigate("/admin/chats");
    else navigate("/user/chat");
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setSubscribeStatus({ type: "error", message: "Please enter your email address." });
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setSubscribeStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setSubscribing(true);
    setSubscribeStatus(null);
    try {
      const res = await fetch(`${BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubscribeStatus({ type: "error", message: data?.message || "Something went wrong. Please try again." });
        return;
      }
      setSubscribeStatus({ type: "success", message: data?.message || "Subscribed successfully!" });
      setEmail("");
    } catch {
      setSubscribeStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubscribing(false);
    }
  };

  if (role === "hostel_owner") return <Navigate to="/hostel_owner/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════════════════════════════════ HERO ══════════════════════ */}
      <HeroSection onSearch={handleSearch} bannerImage="/banner.jpg" stats={siteStats} />

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

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : featuredHostels.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No featured hostels yet</p>
              <Link to="/all-hostels" className="text-purple-600 font-semibold mt-3 inline-block hover:underline">
                Browse all hostels →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredHostels.map((h, i) => (
                <Reveal key={h._id} delay={i * 0.13}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-purple-100 group transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden bg-purple-50">
                      {h.images?.[0] ? (
                        <motion.img
                          src={h.images[0]}
                          alt={h.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.5 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={48} className="text-purple-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                        {h.type || "hostel"}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-1.5 group-hover:text-purple-700 transition-colors leading-snug">
                        {h.name}
                      </h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                        <MapPin size={13} className="text-purple-400 flex-shrink-0" />
                        {h.address || "—"}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(h.facilities || []).slice(0, 3).map((t) => (
                          <span key={t} className="bg-purple-50 text-purple-600 text-xs font-medium px-3 py-1 rounded-full border border-purple-100">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase tracking-widest">From</p>
                          <p className="text-purple-700 font-extrabold text-xl leading-tight">
                            PKR {(h.startingRent || 0).toLocaleString()}
                            <span className="text-gray-400 font-normal text-xs"> /mo</span>
                          </p>
                        </div>
                        <Link to={`/hostels/${h._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            View Details
                            <ChevronRight size={14} />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          )}
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

          {/* Chat CTA — routes into the real chat system instead of a fake demo */}
          <Reveal dir="right" delay={0.15}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl p-8 md:p-10 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle size={28} className="text-purple-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                Need Help Finding a Hostel?
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                Log in to access our real-time chat system and communicate with hostel owners and support.
              </p>
              <motion.button
                onClick={handleChatCTA}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/40 w-full sm:w-auto"
              >
                <LogIn size={18} /> Login to Chat
              </motion.button>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ STATS STRIP ════════════════════════════ */}
      <section className="bg-purple-700 py-14 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-8 text-center">
          {siteStats === null ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-14 h-14 bg-white/15 rounded-2xl" />
                <div className="h-9 w-20 bg-white/15 rounded" />
                <div className="h-4 w-28 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            siteStats.map((s, i) => {
              const Icon = STAT_ICONS[s.icon] || Building2;
              return (
                <Reveal key={s.label} delay={i * 0.1}>
                  <motion.div whileHover={{ scale: 1.06 }} className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                      <Icon size={26} className="text-white" strokeWidth={1.7} />
                    </div>
                    <p className="text-white font-extrabold text-4xl leading-none">
                      {formatStatNumber(s.value, s.suffix)}
                    </p>
                    <p className="text-purple-200 text-base font-medium">{s.label}</p>
                  </motion.div>
                </Reveal>
              );
            })
          )}
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
                  onClick={handleListHostel}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 45px rgba(124,58,237,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2.5 shadow-2xl shadow-purple-900/60 transition-all text-base"
                >
                  <Plus size={20} /> List Your Hostel
                </motion.button>
                <motion.button
                  onClick={() => navigate("/privacy-policy")}
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="border-2 border-white/35 text-white font-semibold px-7 py-4 rounded-xl backdrop-blur-sm transition-all text-base flex items-center gap-2"
                >
                  Learn More <ArrowRight size={18} />
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-8 mt-10">
                {(siteStats || []).map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <p className="text-white font-extrabold text-3xl">{formatStatNumber(s.value, s.suffix)}</p>
                    <p className="text-white/45 text-sm mt-1">{s.label}</p>
                  </motion.div>
                ))}
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

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {[...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <Star size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No approved reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {reviews.map((r, i) => (
                <Reveal key={r._id} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={16} fill={j < r.rating ? "#facc15" : "#e5e7eb"} stroke="none" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-6 italic">"{r.reviewText}"</p>
                    <div className="flex items-center gap-3.5">
                      {r.userId?.profilePicture ? (
                        <img src={r.userId.profilePicture} alt={r.userId.name} className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-extrabold text-base">
                          {r.userId?.name?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{r.userId?.name || "Anonymous"}</p>
                        {r.hostelId?.name ? (
                          <p className="text-purple-500 text-sm font-medium flex items-center gap-1 mt-0.5">
                            <Building2 size={12} className="shrink-0" />
                            {r.hostelId.name}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm mt-0.5">Platform Review</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          )}
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
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (subscribeStatus) setSubscribeStatus(null); }}
                placeholder="Enter your email address"
                disabled={subscribing}
                className="flex-1 bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 rounded-xl px-5 py-3.5 text-base outline-none focus:border-white/60 transition-colors disabled:opacity-60"
              />
              <motion.button
                type="submit"
                disabled={subscribing}
                whileHover={{ scale: subscribing ? 1 : 1.04 }}
                whileTap={{ scale: subscribing ? 1 : 0.97 }}
                className="bg-white text-purple-700 font-bold px-7 py-3.5 rounded-xl hover:bg-purple-50 transition-colors text-base whitespace-nowrap shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {subscribing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {subscribeStatus ? (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm mt-4 flex items-center justify-center gap-1.5 ${
                  subscribeStatus.type === "success" ? "text-white font-semibold" : "text-red-200"
                }`}
              >
                {subscribeStatus.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {subscribeStatus.message}
              </motion.p>
            ) : (
              <p className="text-purple-300/60 text-sm mt-5">No spam. Unsubscribe anytime.</p>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
