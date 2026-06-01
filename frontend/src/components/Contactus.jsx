import { useState } from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* HERO */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20 px-10 max-w-[1100px] mx-auto">
        <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-3">
          GET IN TOUCH
        </p>
        <h1 className="text-[40px] font-extrabold text-[#1a1a2e] mb-4 leading-tight max-w-[560px] font-serif">
          We're here to help you find your perfect stay.
        </h1>
        <p className="text-[15px] text-gray-600 max-w-[480px] leading-[1.7]">
          Whether you have a question about a specific hostel or need technical support, our concierge team is available 24/7.
        </p>
      </section>

      {/* FORM + CONTACT INFO */}
      <section className="max-w-[1100px] mx-auto px-10 pb-20 grid md:grid-cols-[1fr_380px] gap-8">

        {/* Left: Form */}
        <div className="bg-white border border-purple-200 rounded-[16px] p-9">
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-7">
            Send us a message
          </h2>

          {submitted ? (
            <div className="text-center p-12 bg-purple-50 rounded-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">
                Message Sent!
              </h3>
              <p className="text-sm text-gray-600 leading-6">
                Thanks for reaching out. Our team will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form className="space-y-4">

              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1">
                    NAME
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Rivers"
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-purple-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1">
                    EMAIL
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-purple-700 transition-colors"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1">
                  SUBJECT
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg cursor-pointer text-gray-800 text-sm focus:outline-none focus:border-purple-700 transition-colors"
                >
                  <option>General Inquiry</option>
                  <option>Booking Support</option>
                  <option>Property Owner</option>
                  <option>Refund Request</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1">
                  MESSAGE
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  rows={5}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg resize-y min-h-[120px] text-gray-800 text-sm focus:outline-none focus:border-purple-700 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-9 py-3 bg-purple-700 text-white rounded-lg font-bold text-sm transition-all transform hover:bg-purple-800 hover:scale-105"
              >
                Send Inquiry
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact Info + Map */}
        <div className="flex flex-col gap-5">

          {/* Contact Info */}
          <div className="bg-white border border-purple-200 rounded-[16px] p-7">
            <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-6">Contact Information</h3>

            {[
              { icon: <FiMail />, label: "EMAIL SUPPORT", value: "concierge@hostelfinder.com" },
              { icon: <FiPhone />, label: "PHONE LINE", value: "+92 (300) 0123-4567" },
              { icon: <FiMapPin />, label: "HEADQUARTERS", value: "88 Lavender Lane, Suite 400\nRawalpindi, Punjab, PK" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex gap-3 ${i < 2 ? "mb-5 pb-5 border-b border-purple-100" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-purple-600 uppercase mb-1">
                    {item.label}
                  </p>
                  <p className="text-[13px] text-gray-700 leading-6 whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="bg-purple-50 rounded-[16px] h-[200px] relative border border-purple-200 overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#e9d5ff22_0px,#e9d5ff22_1px,transparent_1px,transparent_32px),repeating-linear-gradient(90deg,#e9d5ff22_0px,#e9d5ff22_1px,transparent_1px,transparent_32px)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg shadow-[0_0_0_8px_rgba(124,58,237,0.2)]">
                <FiMapPin />
              </div>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 bg-white text-purple-600 text-[11px] font-semibold px-3 py-1 rounded border border-purple-200 shadow"
            >
              VIEW ON GOOGLE MAPS
            </a>
          </div>
        </div>
      </section>

      {/* ── Quick Answers Banner ── */}
<section className="max-w-[1100px] mx-auto mb-20 px-10">
  <div className="bg-purple-50 rounded-[16px] overflow-hidden grid md:grid-cols-2 min-h-[220px]">
    
    {/* Text */}
    <div className="flex flex-col justify-center p-12 md:p-10">
      <h2 className="text-[26px] font-extrabold text-[#1a1a2e] mb-3 leading-[1.2] font-serif">
        Quick answers are just<br />a click away.
      </h2>
      <p className="text-[14px] text-gray-600 leading-[1.7] mb-5 max-w-[340px]">
        Save time and find instant solutions to common questions about bookings, cancellations, and hostel verification in our Help Center.
      </p>
      <Link
        to="/faqs"
        className="inline-flex items-center gap-1.5 text-purple-700 font-semibold text-[14px] border border-purple-300 px-5 py-2.5 rounded-lg w-fit transition-colors hover:bg-purple-100"
      >
        Visit the FAQs →
      </Link>
    </div>

    {/* Image */}
    <div className="overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80"
        alt="Hostel interior"
        className="w-full h-full object-cover filter brightness-90 saturate-120"
      />
    </div>
  </div>
</section>

      {/* FOOTER */}
      <footer className="border-t border-purple-100 px-10 py-5 flex justify-between items-center flex-wrap gap-3">
        <div>
          <span className="font-extrabold text-purple-600 text-[16px]">HostelFinder</span>
          <span className="text-[12px] text-gray-400 ml-3">© 2024 HostelFinder</span>
        </div>
        <div className="flex gap-6 flex-wrap">
          {["Privacy Policy", "Terms of Service", "Help Center", "Careers"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-gray-500 hover:text-purple-600">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}