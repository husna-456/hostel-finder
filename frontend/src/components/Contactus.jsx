import { useState, useEffect } from "react";
import { FiMail, FiPhone, FiMapPin, FiClock, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

const DEFAULT = {
  hero: {
    badge: "GET IN TOUCH",
    title: "We're here to help you find your perfect stay.",
    subtitle:
      "Whether you have a question about a specific hostel or need technical support, our concierge team is available 24/7.",
  },
  email: "concierge@hostelfinder.com",
  phone: "+92 (300) 0123-4567",
  address: "88 Lavender Lane, Suite 400\nRawalpindi, Punjab, PK",
  supportHours: "Mon–Sun, 9AM–9PM",
  responseTime: "Within 24 hours",
  mapUrl: "https://maps.google.com",
  faqs: [
    {
      q: "How do I book a hostel?",
      a: "Simply find a hostel you like, click 'Book Now', and follow the steps to complete your booking. You'll receive a confirmation once the owner accepts.",
    },
    {
      q: "Can I cancel a booking?",
      a: "Yes, cancellations can be made from your My Bookings page. Please review the hostel's cancellation policy before booking, as terms vary.",
    },
    {
      q: "How do I become a hostel owner?",
      a: "Register on HostelFinder, select 'Hostel Owner' as your account type, and submit your property details. Our team reviews listings within 48 hours.",
    },
    {
      q: "Is my payment secure?",
      a: "Absolutely. All payments are processed through our secure, verified payment partners. We never store card details on our servers.",
    },
    {
      q: "What if I have an issue with a hostel?",
      a: "Contact our support team immediately. We have a dedicated resolution team that handles complaints and disputes within 24 hours.",
    },
  ],
};

export default function ContactUs() {
  const [content,   setContent]   = useState(DEFAULT);
  const [form,      setForm]      = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq,   setOpenFaq]   = useState(null);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${BASE}/site-content/contact`)
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  const { hero, email, phone, address, supportHours, responseTime, mapUrl, faqs } = content;

  const infoCards = [
    { icon: <FiMail />,    label: "EMAIL SUPPORT",  value: email,        color: "blue"   },
    { icon: <FiPhone />,   label: "PHONE LINE",     value: phone,        color: "green"  },
    { icon: <FiMapPin />,  label: "HEADQUARTERS",   value: address,      color: "orange" },
    { icon: <FiClock />,   label: "SUPPORT HOURS",  value: supportHours, color: "purple" },
  ];

  const colorMap = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-12 md:py-20 px-4 md:px-10 max-w-[1100px] mx-auto">
        <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">
          {hero?.badge}
        </p>
        <h1 className="text-[26px] md:text-[40px] font-extrabold text-[#1a1a2e] mb-4 leading-tight max-w-[560px] font-serif">
          {hero?.title}
        </h1>
        <p className="text-[14px] md:text-[15px] text-gray-600 max-w-[480px] leading-[1.7]">
          {hero?.subtitle}
        </p>
        {responseTime && (
          <div className="mt-5 inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-2 text-[12px] text-purple-700 font-medium shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
            Average response: {responseTime}
          </div>
        )}
      </section>

      {/* ── FORM + CONTACT INFO ── */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-10 pb-14 md:pb-20 grid md:grid-cols-[1fr_360px] gap-6 md:gap-8">

        {/* Left: Form */}
        <div className="bg-white border border-purple-200 rounded-2xl p-6 md:p-9">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-6">Send us a message</h2>

          {submitted ? (
            <div className="text-center p-8 md:p-12 bg-purple-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">Message Sent!</h3>
              <p className="text-sm text-gray-600 leading-6">
                Thanks for reaching out. Our team will get back to you {responseTime ? `within ${responseTime.replace("Within ", "").toLowerCase()}` : "soon"}.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "General Inquiry", message: "" }); }}
                className="mt-5 text-sm text-purple-600 underline underline-offset-2 hover:text-purple-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1.5">NAME</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Rivers"
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1.5">EMAIL</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1.5">SUBJECT</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl cursor-pointer text-gray-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                >
                  <option>General Inquiry</option>
                  <option>Booking Support</option>
                  <option>Property Owner</option>
                  <option>Refund Request</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1.5">MESSAGE</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  rows={5}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl resize-none text-gray-800 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto px-9 py-3.5 bg-purple-700 text-white rounded-xl font-bold text-sm transition-all hover:bg-purple-800 active:scale-95 shadow-lg shadow-purple-200"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact info cards + map */}
        <div className="flex flex-col gap-3">
          {infoCards.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform ${colorMap[item.color]}`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-0.5">{item.label}</p>
                  <p className="text-[13px] text-gray-800 font-medium leading-5 whitespace-pre-line">{item.value}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="bg-purple-50 rounded-2xl h-[120px] relative border border-purple-100 overflow-hidden mt-1">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#e9d5ff22_0px,#e9d5ff22_1px,transparent_1px,transparent_32px),repeating-linear-gradient(90deg,#e9d5ff22_0px,#e9d5ff22_1px,transparent_1px,transparent_32px)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-[0_0_0_8px_rgba(124,58,237,0.2)]">
                <FiMapPin />
              </div>
            </div>
            <a
              href={mapUrl || "https://maps.google.com"}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 bg-white text-purple-600 text-[11px] font-semibold px-3 py-1 rounded-lg border border-purple-200 shadow hover:bg-purple-50 transition"
            >
              VIEW ON MAPS →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      {faqs?.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-4 md:px-10 pb-14 md:pb-20">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">COMMON QUESTIONS</p>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#1a1a2e] font-serif">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2.5 max-w-[780px] mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-purple-50 transition-colors"
                >
                  <span className="text-[14px] md:text-[15px] font-semibold text-[#1a1a2e] pr-4">{faq.q}</span>
                  <FiChevronDown
                    className={`shrink-0 text-purple-600 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 md:px-5 pb-4 md:pb-5 text-[13px] md:text-[14px] text-gray-600 leading-[1.7] border-t border-gray-100 pt-3 md:pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── QUICK ANSWERS BANNER ── */}
      <section className="max-w-[1100px] mx-auto mb-14 md:mb-20 px-4 md:px-10">
        <div className="bg-purple-50 rounded-2xl overflow-hidden grid md:grid-cols-2 min-h-[180px] md:min-h-[220px]">
          <div className="flex flex-col justify-center p-7 md:p-10">
            <h2 className="text-[20px] md:text-[26px] font-extrabold text-[#1a1a2e] mb-3 leading-[1.2] font-serif">
              Quick answers are just<br />a click away.
            </h2>
            <p className="text-[13px] md:text-[14px] text-gray-600 leading-[1.7] mb-5 max-w-[340px]">
              Save time and find instant solutions to common questions in our Help Center.
            </p>
            <Link
              to="/FAQs"
              className="inline-flex items-center gap-1.5 text-purple-700 font-semibold text-[13px] md:text-[14px] border border-purple-300 px-5 py-2.5 rounded-xl w-fit transition-colors hover:bg-purple-100"
            >
              Visit the FAQs →
            </Link>
          </div>
          <div className="overflow-hidden hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80"
              alt="Hostel interior"
              className="w-full h-full object-cover brightness-90"
            />
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
          {["Privacy Policy", "Terms of Service", "Help Center", "Careers"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-gray-500 hover:text-purple-600">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
