import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMail, FiMessageCircle } from "react-icons/fi";
import { Building2, Users, MapPin, Star, Award, Shield, Zap, CheckCircle } from "lucide-react";

const faqData = {
  "General Support": [
    {
      q: "What is HostelFinder?",
      a: "HostelFinder is a premium digital concierge service designed to help students find curated, safe, and high-quality living accommodations near major universities and colleges.",
    },
    {
      q: "How do I verify my identity?",
      a: "You can verify your identity by uploading a valid government-issued ID (CNIC, passport, or student card) through your profile settings. Verification usually takes 24–48 hours.",
    },
    {
      q: "Can I visit the hostel before booking?",
      a: "Yes! Most of our listed hostels offer in-person visits. You can request a tour directly from the hostel listing page by clicking 'Schedule a Visit'.",
    },
  ],
  "For Students": [
    {
      q: "Are utilities included in the price?",
      a: "Most of our listed hostels include basic utilities like high-speed Wi-Fi, water, and electricity. Look for the 'All-Inclusive' badge on the listing details page to be certain.",
    },
    {
      q: "What documents are required for booking?",
      a: "Typically you'll need a valid student ID, CNIC/passport copy, and a recent photograph. Some hostels may require a guardian's CNIC as well. All required documents are listed on each hostel's booking page.",
    },
    {
      q: "Can I cancel my booking?",
      a: "Yes, cancellations are allowed up to 48 hours before your move-in date for a full refund. After that, a partial refund may apply depending on the hostel's policy.",
    },
  ],
  "For Property Owners": [
    {
      q: "How do I list my hostel on HostelFinder?",
      a: "Click 'Post Property' in the navigation bar, fill in your hostel details, upload photos, and set your pricing. Your listing goes live after a quick verification by our team.",
    },
    {
      q: "What are the fees for listing a property?",
      a: "Basic listings are completely free. Premium listings with featured placement and advanced analytics are available through our paid plans starting at PKR 2,000/month.",
    },
  ],
  "Payments & Refunds": [
    {
      q: "What payment methods are accepted?",
      a: "We accept JazzCash, Easypaisa, bank transfers, and major debit/credit cards. All transactions are secured with end-to-end encryption.",
    },
    {
      q: "How long do refunds take?",
      a: "Refunds are processed within 5–7 business days back to your original payment method. You'll receive an email confirmation once the refund has been initiated.",
    },
  ],
  "Safety & Trust": [
    {
      q: "How does HostelFinder verify hostels?",
      a: "Every hostel goes through a manual verification process including on-site inspection, document review, and photo authentication before being listed on our platform.",
    },
    {
      q: "What is the Student Protection Program?",
      a: "Our Student Protection Program ensures that your deposit is held in a secure escrow account and only released 24 hours after you successfully move in and confirm everything is as listed.",
    },
  ],
};

const categories = Object.keys(faqData);

// ── Facts/Stats defaults ───────────────────────────────────────────────────
const DEFAULT_FACTS = {
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

const iconMap       = { building: Building2, users: Users, map: MapPin, star: Star };
const achieveIcons  = { award: Award, shield: Shield, zap: Zap };
const bgMap         = [
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

// ── Animated counter ───────────────────────────────────────────────────────
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

  const formatted = count >= 1000 ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + "k" : String(count);
  return <span ref={ref}>{formatted}{suffix}</span>;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState("General Support");
  const [openIndex,      setOpenIndex]      = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [factsData,      setFactsData]      = useState(DEFAULT_FACTS);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${BASE}/site-content/facts`)
      .then((r) => r.json())
      .then((d) => { if (d?.stats) setFactsData(d); })
      .catch(() => {});
  }, []);

  const currentFaqs  = faqData[activeCategory] || [];
  const filteredFaqs = searchQuery
    ? Object.values(faqData).flat().filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFaqs;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-16 md:py-20 px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-4 font-serif">
          How can we help?
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Search our knowledge base or browse categories below to find answers to common questions about student housing.
        </p>

        <div className="max-w-2xl mx-auto flex border-2 border-purple-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <span className="px-4 flex items-center text-gray-400 text-lg">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search for 'booking process', 'refunds', or 'safety'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-transparent"
          />
          <button className="px-5 md:px-6 bg-purple-700 text-white font-semibold text-sm hover:bg-purple-800 transition-colors">
            Search
          </button>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {factsData.stats?.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Building2;
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 text-center hover:border-purple-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform ${bgMap[i % bgMap.length]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[26px] md:text-[34px] font-extrabold text-[#1a1a2e] leading-none tabular-nums">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[12px] md:text-[13px] font-bold text-gray-700 mt-2">{stat.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ main content ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 md:pb-20 flex gap-8 md:gap-10">

        {/* Sidebar — hidden when searching */}
        {!searchQuery && (
          <aside className="w-48 md:w-56 flex-shrink-0 hidden sm:block">
            <p className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-3">
              Categories
            </p>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                  className={`text-left px-4 py-2 rounded-xl font-medium text-sm transition-colors
                    ${activeCategory === cat
                      ? "bg-purple-700 text-white"
                      : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Mobile category chips */}
        {!searchQuery && (
          <div className="sm:hidden flex gap-2 flex-wrap mb-4 w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                  ${activeCategory === cat ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-700"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ list */}
        <div className="flex-1 min-w-0">
          {!searchQuery && (
            <h2 className="text-lg md:text-xl font-bold text-[#1a1a2e] mb-5 md:mb-6 border-l-4 border-purple-700 pl-4">
              {activeCategory}
            </h2>
          )}
          {searchQuery && (
            <p className="text-sm text-gray-500 mb-5">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}

          <div className="flex flex-col gap-3">
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-colors ${openIndex === i ? "border-purple-300" : "border-gray-200"}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className={`w-full text-left px-4 md:px-5 py-3.5 md:py-4 flex justify-between items-center font-semibold text-sm transition-colors
                    ${openIndex === i ? "bg-purple-50 text-[#1a1a2e]" : "bg-white text-gray-800"}`}
                >
                  {faq.q}
                  <span className={`text-purple-700 transform transition-transform shrink-0 ml-3 ${openIndex === i ? "rotate-180" : "rotate-0"}`}>⌄</span>
                </button>
                {openIndex === i && (
                  <div className="px-4 md:px-5 py-3.5 md:py-4 text-gray-700 text-sm bg-purple-50 border-t border-purple-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-8 md:mt-10 bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 md:p-8">
            <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-wide px-2 py-1 rounded mb-2">
              PRO TIP
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">Book with Confidence</h3>
            <p className="text-sm text-purple-200 mb-4 max-w-lg leading-relaxed">
              Our 'Student Protection Program' ensures that your deposit is held in a secure account and only released 24 hours after you successfully move in.
            </p>
            <button className="px-6 py-2 text-white border border-white/40 rounded-xl bg-white/15 font-semibold hover:bg-white/25 transition text-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Achievements ── */}
      <section className="bg-[#faf8ff] border-y border-purple-100 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">OUR MILESTONES</p>
            <h2 className="text-[24px] md:text-[34px] font-extrabold text-[#1a1a2e] font-serif">What makes us different</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {factsData.achievements?.map((a, i) => {
              const Icon = achieveIcons[a.icon] || Award;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[15px] md:text-[16px] font-bold text-[#1a1a2e] mb-2">{a.title}</h3>
                  <p className="text-[12px] md:text-[13px] text-gray-600 leading-[1.7]">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust section ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">WHY STUDENTS TRUST US</p>
            <h2 className="text-[22px] md:text-[32px] font-extrabold text-[#1a1a2e] mb-5 leading-tight font-serif">
              Built for students,<br />by people who care.
            </h2>
            <p className="text-[13px] md:text-[14px] text-gray-600 leading-[1.7] mb-7">
              We understand the challenges students face when finding accommodation. Every feature on HostelFinder is designed to make the process simple, transparent, and safe.
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

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-7 md:p-10 text-white">
            <p className="text-purple-200 text-[11px] font-bold uppercase tracking-widest mb-5">Platform Snapshot</p>
            <div className="space-y-4">
              {[
                { label: "New listings added",     value: "Every week"   },
                { label: "Student reviews",         value: "Verified"     },
                { label: "Average booking time",    value: "< 5 minutes"  },
                { label: "Owner response rate",     value: "94%"          },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <span className="text-[12px] md:text-[13px] text-purple-200">{item.label}</span>
                  <span className="text-[13px] md:text-[14px] font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Still have questions ── */}
      <section className="bg-purple-50 py-14 md:py-16 px-4 md:px-6 text-center">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1a1a2e] mb-3">Still have questions?</h2>
        <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
          If you can't find the answer you're looking for, our support team is available 24/7 to help you with any inquiries.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/Contact">
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition text-sm">
              <FiMail className="w-4 h-4" />
              Contact Us
            </button>
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 transition text-sm">
            <FiMessageCircle className="w-4 h-4" />
            Live Chat
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-purple-100 py-5 px-4 md:px-6 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-purple-700 font-extrabold text-base md:text-lg">HostelFinder</span>
          <span className="text-gray-400 text-xs md:text-sm ml-2">© 2024 HostelFinder. The Digital Curator for Student Living.</span>
        </div>
        <div className="flex gap-4 md:gap-6 flex-wrap">
          {["Privacy Policy", "Terms of Service", "Help Center", "Careers"].map((l) => (
            <a key={l} href="#" className="text-gray-500 text-xs md:text-sm hover:text-purple-700 transition">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
