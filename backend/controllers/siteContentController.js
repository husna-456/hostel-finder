import SiteContent from "../models/SiteContent.js";

const DEFAULTS = {
  contact: {
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
  },
  facts: {
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
        title: "Fastest Growing Platform",
        description:
          "Over 10,000 new users joined in the last 6 months alone, making HostelFinder the fastest growing hostel discovery platform in Pakistan.",
        icon: "award",
      },
      {
        title: "24/7 Dedicated Support",
        description:
          "Our team is always ready to help students and hostel owners, with an average response time under 2 hours.",
        icon: "shield",
      },
      {
        title: "Verified Listings Only",
        description:
          "Every hostel on our platform is manually reviewed and verified before going live, ensuring quality and safety for every student.",
        icon: "zap",
      },
    ],
  },
};

export const getPublicSiteContent = async (req, res) => {
  const { section } = req.params;
  if (!["contact", "facts"].includes(section))
    return res.status(400).json({ message: "Invalid section" });

  try {
    // .lean() returns a plain JS object — avoids Mixed-type serialisation quirks
    const doc = await SiteContent.findOne({ section }).lean();
    res.json(doc?.data ?? DEFAULTS[section]);
  } catch (err) {
    console.error("getPublicSiteContent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSiteContent = async (req, res) => {
  const { section } = req.params;
  if (!["contact", "facts"].includes(section))
    return res.status(400).json({ message: "Invalid section" });

  try {
    let doc = await SiteContent.findOne({ section });
    if (doc) {
      doc.data = req.body;
      doc.markModified("data"); // required: Mongoose won't auto-detect Mixed changes
      await doc.save();
    } else {
      doc = new SiteContent({ section, data: req.body });
      await doc.save();
    }
    // Re-read with .lean() to confirm what's actually stored
    const saved = await SiteContent.findOne({ section }).lean();
    res.json(saved.data);
  } catch (err) {
    console.error("updateSiteContent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetSiteContent = async (req, res) => {
  const { section } = req.params;
  if (!["contact", "facts"].includes(section))
    return res.status(400).json({ message: "Invalid section" });

  try {
    await SiteContent.deleteOne({ section });
    res.json(DEFAULTS[section]);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
