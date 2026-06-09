import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, MapPin, Star, Award, Shield, Zap, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const DEFAULT = {
  hero: {
    badge: "BY THE NUMBERS",
    title: "Trusted by students across Pakistan",
    subtitle:
      "HostelFinder connects students with quality accommodation. Here's a look at our growing impact.",
  },
  stats: [
    { value: 500,   suffix: "+", label: "Hostels Listed",    description: "Verified and quality-checked",  icon: "building" },
    { value: 10000, suffix: "+", label: "Happy Students",    description: "Found their perfect stay",       icon: "users"    },
    { value: 50,    suffix: "+", label: "Cities Covered",    description: "Across Pakistan",                icon: "map"      },
    { value: 98,    suffix: "%", label: "Satisfaction Rate", description: "Based on student reviews",       icon: "star"     },
  ],
  achievements: [
    {
      title:       "Fastest Growing Platform",
      description: "Over 10,000 new users joined in the last 6 months alone, making HostelFinder the fastest growing hostel discovery platform in Pakistan.",
      icon:        "award",
    },
    {
      title:       "24/7 Dedicated Support",
      description: "Our team is always ready to help students and hostel owners, with an average response time under 2 hours.",
      icon:        "shield",
    },
    {
      title:       "Verified Listings Only",
      description: "Every hostel on our platform is manually reviewed before going live, ensuring quality and safety for every student.",
      icon:        "zap",
    },
  ],
};

const iconMap      = { building: Building2, users: Users, map: MapPin, star: Star };
const achieveIcons = { award: Award, shield: Shield, zap: Zap, trend: TrendingUp };
const bgMap        = [
  "bg-purple-50 text-purple-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
];
const trust = [
  "No hidden charges or surprise fees",
  "Verified hostel listings — reviewed before going live",
  "Secure payment processing",
  "Responsive support team available every day",
  "Transparent cancellation and refund policies",
  "Student-first platform built by locals",
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref               = useRef(null);
  const started           = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const fps   = 60;
        const dur   = 1600;
        const steps = (dur / 1000) * fps;
        const inc   = target / steps;
        let cur     = 0;
        const timer = setInterval(() => {
          cur += inc;
          if (cur >= target) { setCount(target); clearInterval(timer); }
          else                 setCount(Math.floor(cur));
        }, 1000 / fps);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const formatted = count >= 1000
    ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + "k"
    : String(count);

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function FAQs() {
  const [content, setContent] = useState(DEFAULT);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${BASE}/site-content/facts`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => { if (d?.stats) setContent(d); })
      .catch(() => {/* fallback to DEFAULT already in state */});
  }, []);

  const { hero, stats, achievements } = content;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-14 md:py-24 px-4 md:px-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-4">
          {hero?.badge}
        </p>
        <h1 className="text-[28px] md:text-[48px] font-extrabold text-[#1a1a2e] mb-4 leading-tight font-serif max-w-[640px] mx-auto">
          {hero?.title}
        </h1>
        <p className="text-[14px] md:text-[16px] text-gray-600 max-w-[520px] mx-auto leading-[1.7]">
          {hero?.subtitle}
        </p>
      </section>

      {/* ── STATS GRID ── */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats?.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Building2;
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-5 md:p-7 text-center hover:border-purple-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${bgMap[i % bgMap.length]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[28px] md:text-[40px] font-extrabold text-[#1a1a2e] leading-none tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[13px] md:text-[14px] font-bold text-gray-800 mt-2.5">{stat.label}</div>
                <div className="text-[11px] md:text-[12px] text-gray-500 mt-1 leading-[1.4]">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ACHIEVEMENTS ── */}
      <section className="bg-[#faf8ff] border-y border-purple-100 py-14 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">OUR MILESTONES</p>
            <h2 className="text-[24px] md:text-[36px] font-extrabold text-[#1a1a2e] font-serif">What makes us different</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {achievements?.map((a, i) => {
              const Icon = achieveIcons[a.icon] || Award;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[15px] md:text-[17px] font-bold text-[#1a1a2e] mb-2">{a.title}</h3>
                  <p className="text-[12px] md:text-[13px] text-gray-600 leading-[1.7]">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-10 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">WHY STUDENTS TRUST US</p>
            <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#1a1a2e] mb-5 leading-tight font-serif">
              Built for students,<br />by people who care.
            </h2>
            <p className="text-[13px] md:text-[14px] text-gray-600 leading-[1.7] mb-7">
              We understand the challenges students face when finding accommodation. That's why every feature on HostelFinder is designed to make the process simple, transparent, and safe.
            </p>
            <ul className="space-y-3">
              {trust.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] md:text-[14px] text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 md:p-10 text-white">
            <p className="text-purple-200 text-[12px] font-bold uppercase tracking-widest mb-6">Platform Snapshot</p>
            <div className="space-y-5">
              {[
                { label: "New listings added",  value: "Every week"  },
                { label: "Student reviews",      value: "Verified"    },
                { label: "Average booking time", value: "< 5 minutes" },
                { label: "Owner response rate",  value: "94%"         },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <span className="text-[13px] text-purple-200">{item.label}</span>
                  <span className="text-[14px] font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-purple-50 py-14 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 text-center">
          <h2 className="text-[24px] md:text-[36px] font-extrabold text-[#1a1a2e] mb-4 font-serif">
            Ready to find your perfect hostel?
          </h2>
          <p className="text-[14px] md:text-[16px] text-gray-600 mb-8 max-w-[480px] mx-auto">
            Join thousands of students who have found their home away from home with HostelFinder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/all-hostels"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-purple-700 text-white rounded-xl font-bold text-[14px] hover:bg-purple-800 transition active:scale-95 shadow-lg shadow-purple-200"
            >
              Browse Hostels <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/Contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-purple-300 text-purple-700 rounded-xl font-bold text-[14px] hover:bg-white transition bg-white/50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-purple-100 px-4 md:px-10 py-5 flex justify-between items-center flex-wrap gap-3">
        <div>
          <span className="font-extrabold text-purple-600 text-[16px]">HostelFinder</span>
          <span className="text-[12px] text-gray-400 ml-3">© 2024 HostelFinder</span>
        </div>
        <div className="flex gap-4 md:gap-6 flex-wrap">
          {["Privacy Policy", "Terms of Service", "Help Center"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-gray-500 hover:text-purple-600">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
