import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

const quickLinks = [
  { label: "Find Hostels", to: "/all-hostels" },
  { label: "Advanced Search", to: "/advanced-search" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact Us", to: "/contact" },
];

const supportLinks = [
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
  { label: "How It Works", to: "#" },
  { label: "List Your Hostel", to: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* ── Top CTA Banner ── */}
      <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-extrabold text-2xl md:text-3xl leading-tight">
              Ready to Find Your <span className="text-purple-200">Perfect Hostel?</span>
            </h3>
            <p className="text-purple-200 text-sm mt-1">Join thousands of students who found their home away from home.</p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/all-hostels">
              <button className="bg-white text-purple-700 font-bold px-7 py-3 rounded-xl flex items-center gap-2 shadow-xl hover:bg-purple-50 transition-colors whitespace-nowrap">
                Browse Hostels <FaArrowRight />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="space-y-5">
          <Link to="/" className="inline-block">
            <p className="text-2xl font-extrabold">
              <span className="text-white">Hostel</span>
              <span className="text-violet-400">Finder</span>
            </p>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            Pakistan's trusted platform for students and professionals to find affordable, verified hostels across the country.
          </p>
          {/* Socials */}
          <div className="flex gap-3">
            {[
              { icon: <FaFacebook />, label: "Facebook", color: "hover:bg-[#1877f2]" },
              { icon: <FaInstagram />, label: "Instagram", color: "hover:bg-[#e1306c]" },
              { icon: <FaTwitter />, label: "Twitter", color: "hover:bg-[#1da1f2]" },
            ].map(({ icon, label, color }) => (
              <motion.button
                key={label}
                aria-label={label}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 bg-gray-800 ${color} rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200`}
              >
                {icon}
              </motion.button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[["500+", "Hostels"], ["10K+", "Students"], ["50+", "Cities"]].map(([num, label]) => (
              <div key={label} className="bg-gray-800/60 rounded-lg py-2.5 text-center">
                <p className="text-white font-extrabold text-sm leading-none">{num}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-gray-800">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {quickLinks.map(({ label, to }) => (
              <li key={label}>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Link to={to} className="text-sm text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-violet-500 transition-colors flex-shrink-0" />
                    {label}
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-gray-800">
            Support
          </h4>
          <ul className="space-y-3">
            {supportLinks.map(({ label, to }) => (
              <li key={label}>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Link to={to} className="text-sm text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-violet-500 transition-colors flex-shrink-0" />
                    {label}
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>

          {/* Contact Info */}
          <div className="mt-6 space-y-2.5">
            {[
              { icon: <FaEnvelope className="text-violet-500 flex-shrink-0" />, text: "info@hostelfinder.com" },
              { icon: <FaPhone className="text-violet-500 flex-shrink-0" />, text: "+92 300 1234567" },
              { icon: <FaMapMarkerAlt className="text-violet-500 flex-shrink-0" />, text: "Rawalpindi, Pakistan" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-gray-500">
                {icon}
                <span className="hover:text-gray-300 transition-colors cursor-default">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5 pb-2 border-b border-gray-800">
            Newsletter
          </h4>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Get the latest hostel openings and exclusive deals directly in your inbox.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-gray-800/80 text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-600 border border-gray-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Subscribe <FaArrowRight className="text-xs" />
            </motion.button>
          </div>
          <p className="text-xs text-gray-600 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © 2026 <span className="text-gray-400 font-semibold">HostelFinder</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Made with <span className="text-red-500">❤️</span> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
