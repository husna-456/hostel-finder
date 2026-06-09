import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      {
        sub: null,
        text: "By accessing or using HostelFinder (\"the Platform\"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Platform. These terms apply to all users including students, hostel owners, and visitors.",
      },
    ],
  },
  {
    title: "2. Eligibility",
    body: [
      {
        sub: null,
        text: "You must be at least 16 years of age to create an account. By registering, you confirm that the information you provide is accurate, current, and complete, and that you will maintain its accuracy throughout your use of the Platform.",
      },
    ],
  },
  {
    title: "3. User Accounts",
    body: [
      { sub: "Registration", text: "You are responsible for maintaining the confidentiality of your login credentials. You must not share your account with others or allow others to access your account." },
      { sub: "Account Security", text: "You are responsible for all activity that occurs under your account. Notify us immediately at support@hostelfinder.com if you suspect unauthorised access." },
      { sub: "Termination", text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm other users." },
    ],
  },
  {
    title: "4. Bookings & Payments",
    body: [
      { sub: "Booking Process", text: "Students submit a booking request to hostel owners. A booking is confirmed only when the owner accepts the request and payment is successfully processed." },
      { sub: "Payments", text: "All payments are processed through secure, verified payment partners. Prices are listed in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise." },
      { sub: "Cancellations & Refunds", text: "Cancellation and refund policies are set by individual hostel owners and displayed on each listing. HostelFinder facilitates the process but is not liable for owner-imposed cancellation terms." },
      { sub: "Disputes", text: "In the event of a dispute between a student and a hostel owner, HostelFinder's resolution team will mediate in good faith. Final decisions rest with HostelFinder and are binding." },
    ],
  },
  {
    title: "5. Hostel Owner Obligations",
    body: [
      { sub: "Accurate Listings", text: "Owners must provide accurate, up-to-date information about their properties including photos, amenities, pricing, and availability. Misleading listings may result in immediate removal and account suspension." },
      { sub: "Verification", text: "All listings undergo manual review before going live. Owners must cooperate with our verification process and provide requested documentation." },
      { sub: "Guest Treatment", text: "Owners must treat all students fairly and without discrimination based on gender, ethnicity, religion, or disability." },
    ],
  },
  {
    title: "6. Prohibited Activities",
    body: [
      {
        sub: null,
        text: "You must not: (a) post false, misleading, or fraudulent content; (b) impersonate another person or entity; (c) use the Platform to send spam or unsolicited messages; (d) attempt to circumvent our payment system; (e) scrape, copy, or redistribute Platform content without permission; (f) upload malware or engage in any activity that disrupts or damages the Platform; (g) use the Platform for any unlawful purpose.",
      },
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      {
        sub: null,
        text: "All content on HostelFinder — including the brand name, logo, design, code, and original text — is the property of HostelFinder and protected by applicable intellectual property laws. User-submitted content (reviews, photos) remains your property, but you grant HostelFinder a non-exclusive, royalty-free licence to display and promote it on the Platform.",
      },
    ],
  },
  {
    title: "8. Disclaimers",
    body: [
      { sub: "Platform Role", text: "HostelFinder is a marketplace connecting students and hostel owners. We do not own, manage, or operate any hostel listed on the Platform and are not responsible for the condition, safety, or quality of any property." },
      { sub: "No Warranty", text: "The Platform is provided 'as is' and 'as available'. We make no warranty that the service will be uninterrupted, error-free, or meet your specific requirements." },
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      {
        sub: null,
        text: "To the maximum extent permitted by law, HostelFinder shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform — including but not limited to loss of profits, data, or goodwill. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.",
      },
    ],
  },
  {
    title: "10. Indemnification",
    body: [
      {
        sub: null,
        text: "You agree to indemnify and hold harmless HostelFinder and its officers, employees, and partners from any claims, losses, or damages arising out of your use of the Platform, your violation of these terms, or your violation of any third-party rights.",
      },
    ],
  },
  {
    title: "11. Governing Law",
    body: [
      {
        sub: null,
        text: "These Terms are governed by the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Rawalpindi, Punjab, Pakistan.",
      },
    ],
  },
  {
    title: "12. Changes to Terms",
    body: [
      {
        sub: null,
        text: "We may update these Terms at any time. Material changes will be communicated via email or a prominent notice on the Platform. Continued use after the effective date constitutes acceptance of the updated terms.",
      },
    ],
  },
  {
    title: "13. Contact",
    body: [
      {
        sub: null,
        text: "Questions about these Terms? Contact us at legal@hostelfinder.com or write to HostelFinder, 88 Lavender Lane, Suite 400, Rawalpindi, Punjab, PK.",
      },
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-14 md:py-20 px-4">
        <div className="max-w-[860px] mx-auto">
          <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-4">Legal</p>
          <h1 className="text-[28px] md:text-[44px] font-extrabold text-[#1a1a2e] mb-4 leading-tight font-serif">
            Terms of Service
          </h1>
          <p className="text-[14px] md:text-[15px] text-gray-600 leading-[1.7] max-w-[600px]">
            Please read these terms carefully before using HostelFinder. By using the Platform, you agree to be legally bound by these terms.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-2 text-[12px] text-gray-500 shadow-sm">
            <span className="w-2 h-2 bg-purple-400 rounded-full shrink-0" />
            Last updated: June 1, 2024
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[860px] mx-auto px-4 pb-16 md:pb-24 space-y-10">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            <h2 className="text-[17px] md:text-[19px] font-bold text-[#1a1a2e] mb-4 pb-2 border-b border-purple-100">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.body.map((item, ii) => (
                <div key={ii}>
                  {item.sub && (
                    <p className="text-[13px] md:text-[14px] font-semibold text-gray-800 mb-1">{item.sub}</p>
                  )}
                  <p className="text-[13px] md:text-[14px] text-gray-600 leading-[1.75]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Nav back */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold text-[13px] hover:bg-purple-800 transition w-fit"
          >
            Back to Home
          </Link>
          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-2 px-6 py-3 border border-purple-200 text-purple-700 rounded-xl font-bold text-[13px] hover:bg-purple-50 transition w-fit"
          >
            Privacy Policy →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 px-4 md:px-10 py-5 flex justify-between items-center flex-wrap gap-3 max-w-[860px] mx-auto">
        <div>
          <span className="font-extrabold text-purple-600 text-[16px]">HostelFinder</span>
          <span className="text-[12px] text-gray-400 ml-3">© 2024 HostelFinder</span>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Link to="/privacy-policy" className="text-[12px] text-gray-500 hover:text-purple-600">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-[12px] text-purple-600 font-medium">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
