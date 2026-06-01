import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMail, FiMessageCircle } from "react-icons/fi";


<div className="flex flex-wrap justify-center gap-4">
  <Link to="/contact">
    <button className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition">
      <FiMail className="w-5 h-5" />
      Contact Us
    </button>
  </Link>
  <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
    <FiMessageCircle className="w-5 h-5" />
    Live Chat
  </button>
</div>

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

export default function FAQs() {
  const [activeCategory, setActiveCategory] = useState("General Support");
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentFaqs = faqData[activeCategory] || [];
  const filteredFaqs = searchQuery
    ? Object.values(faqData)
      .flat()
      .filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFaqs;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-4 font-serif">
          How can we help?
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Search our knowledge base or browse categories below to find answers to common questions about student housing.
        </p>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto flex border-2 border-purple-200 rounded-lg overflow-hidden shadow-sm bg-white">
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
          <button className="px-6 bg-purple-700 text-white font-semibold text-sm hover:bg-purple-800 transition-colors">
            Search
          </button>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex gap-10">
        {/* Sidebar */}
        {!searchQuery && (
          <aside className="w-56 flex-shrink-0">
            <p className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-3">
              Categories
            </p>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                  className={`text-left px-4 py-2 rounded-lg font-medium text-sm transition-colors
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

        {/* FAQ list */}
        <div className="flex-1">
          {!searchQuery && (
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-6 border-l-4 border-purple-700 pl-4">
              {activeCategory}
            </h2>
          )}
          {searchQuery && (
            <p className="text-sm text-gray-500 mb-5">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}

          {/* Accordion */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className={`border rounded-lg overflow-hidden transition-colors ${openIndex === i ? "border-purple-300" : "border-gray-200"}`}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className={`w-full text-left px-5 py-4 flex justify-between items-center font-semibold text-sm transition-colors
                    ${openIndex === i ? "bg-purple-50 text-[#1a1a2e]" : "bg-white text-gray-800"}`}
                >
                  {faq.q}
                  <span className={`text-purple-700 transform transition-transform ${openIndex === i ? "rotate-180" : "rotate-0"}`}>⌄</span>
                </button>
                {openIndex === i && (
                  <div className="px-5 py-4 text-gray-700 text-sm bg-purple-50 border-t border-purple-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-10 bg-gradient-to-br from-purple-700 to-purple-900 rounded-xl p-8">
            <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-wide px-2 py-1 rounded mb-2">
              PRO TIP
            </span>
            <h3 className="text-2xl font-extrabold text-white mb-2">Book with Confidence</h3>
            <p className="text-sm text-purple-200 mb-4 max-w-lg leading-relaxed">
              Our 'Student Protection Program' ensures that your deposit is held in a secure account and only released 24 hours after you successfully move in.
            </p>
            <button className="px-6 py-2 text-white border border-white/40 rounded-lg bg-white/15 font-semibold hover:bg-white/25 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="bg-purple-50 py-16 px-6 text-center">
        <h2 className="text-2xl font-extrabold text-[#1a1a2e] mb-3">Still have questions?</h2>
        <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
          If you can't find the answer you're looking for, our support team is available 24/7 to help you with any inquiries.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact">
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition">
              <FiMail className="w-5 h-5" />
              Contact Us
            </button>
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
            <FiMessageCircle className="w-5 h-5" />
            Live Chat
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-5 px-6 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-purple-700 font-extrabold text-lg">HostelFinder</span>
          <span className="text-gray-400 text-sm ml-2">© 2024 HostelFinder. The Digital Curator for Student Living.</span>
        </div>
        <div className="flex gap-6 flex-wrap">
          {["Privacy Policy", "Terms of Service", "Help Center", "Careers"].map((l) => (
            <a key={l} href="#" className="text-gray-500 text-sm hover:text-purple-700 transition">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}