import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      {
        sub: "Account Information",
        text: "When you register, we collect your full name, email address, phone number, and password (stored in encrypted form). Hostel owners additionally provide property details, ownership documents, and bank account information for payouts.",
      },
      {
        sub: "Booking & Payment Data",
        text: "We collect booking details including check-in/check-out dates, room preferences, and payment confirmation records. Full card numbers are never stored on our servers — all transactions are processed by PCI-DSS-compliant payment partners.",
      },
      {
        sub: "Usage & Device Data",
        text: "We automatically collect browser type, operating system, IP address, pages visited, time spent, and referring URLs. This data is used in aggregate form to improve site performance.",
      },
      {
        sub: "Communications",
        text: "Messages sent through our in-app chat system, support tickets, and contact forms are stored to facilitate communication and resolve disputes.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      { sub: "Service Delivery", text: "To create and manage your account, process bookings, facilitate payments, and connect students with hostel owners." },
      { sub: "Safety & Verification", text: "To verify the identity of hostel owners, review listings before they go live, and detect fraudulent activity." },
      { sub: "Communications", text: "To send booking confirmations, payment receipts, support responses, and — only with your consent — promotional emails. You can unsubscribe at any time." },
      { sub: "Improvement", text: "To analyse usage patterns, fix bugs, and develop new features that better serve our student community." },
    ],
  },
  {
    title: "3. Cookies & Tracking",
    body: [
      {
        sub: "Essential Cookies",
        text: "Required for the site to function (session management, security tokens). These cannot be disabled.",
      },
      {
        sub: "Analytics Cookies",
        text: "We use anonymised analytics to understand how users navigate the site. You can opt out via your browser settings or a cookie-management tool.",
      },
      {
        sub: "No Third-Party Advertising Cookies",
        text: "We do not sell your data to advertisers or place third-party advertising trackers on our site.",
      },
    ],
  },
  {
    title: "4. Sharing of Information",
    body: [
      { sub: "With Hostel Owners", text: "When you make a booking, your name and contact details are shared with the relevant hostel owner to fulfil the reservation." },
      { sub: "Payment Processors", text: "Payment data is passed directly to our payment partners under their own privacy policies. We receive only a transaction reference." },
      { sub: "Service Providers", text: "We engage trusted third-party services (cloud hosting, email delivery, analytics) under strict data-processing agreements." },
      { sub: "Legal Obligations", text: "We may disclose information if required by applicable law, court order, or to protect the rights and safety of our users." },
      { sub: "No Sale of Data", text: "We do not sell, rent, or trade your personal information to third parties for their own marketing purposes." },
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      {
        sub: null,
        text: "We retain account data for as long as your account is active. Booking records are kept for 5 years for accounting and legal compliance. After account deletion, personal data is purged within 30 days except where retention is required by law.",
      },
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      { sub: "Access", text: "You may request a copy of the personal data we hold about you at any time." },
      { sub: "Correction", text: "You can update most account information directly from your profile settings." },
      { sub: "Deletion", text: "You may request deletion of your account and associated data by contacting support. Some data may be retained for legal reasons." },
      { sub: "Portability", text: "You may request your data in a machine-readable format for transfer to another service." },
      { sub: "Objection", text: "You may object to certain types of processing (e.g., marketing emails) at any time." },
    ],
  },
  {
    title: "7. Security",
    body: [
      {
        sub: null,
        text: "We implement industry-standard security measures including HTTPS encryption, hashed password storage, access controls, and regular security audits. However, no internet transmission is 100% secure and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    title: "8. Children's Privacy",
    body: [
      {
        sub: null,
        text: "HostelFinder is intended for users aged 16 and above. We do not knowingly collect personal information from children under 16. If you believe a minor has registered, please contact us and we will promptly delete the account.",
      },
    ],
  },
  {
    title: "9. Changes to This Policy",
    body: [
      {
        sub: null,
        text: "We may update this Privacy Policy periodically. When we make material changes, we will notify registered users by email and update the 'Last Updated' date at the top of this page. Continued use of the platform after changes constitutes acceptance.",
      },
    ],
  },
  {
    title: "10. Contact Us",
    body: [
      {
        sub: null,
        text: "For privacy-related queries, data access requests, or complaints, contact our Data Protection Officer at: privacy@hostelfinder.com — or write to HostelFinder, 88 Lavender Lane, Suite 400, Rawalpindi, Punjab, PK.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-14 md:py-20 px-4">
        <div className="max-w-[860px] mx-auto">
          <p className="text-[11px] font-bold tracking-[0.18em] text-purple-600 uppercase mb-4">Legal</p>
          <h1 className="text-[28px] md:text-[44px] font-extrabold text-[#1a1a2e] mb-4 leading-tight font-serif">
            Privacy Policy
          </h1>
          <p className="text-[14px] md:text-[15px] text-gray-600 leading-[1.7] max-w-[600px]">
            This policy explains what personal information HostelFinder collects, why we collect it, how we use it, and your rights over your data.
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
            to="/terms-of-service"
            className="inline-flex items-center gap-2 px-6 py-3 border border-purple-200 text-purple-700 rounded-xl font-bold text-[13px] hover:bg-purple-50 transition w-fit"
          >
            Terms of Service →
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
          <Link to="/privacy-policy" className="text-[12px] text-purple-600 font-medium">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-[12px] text-gray-500 hover:text-purple-600">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
