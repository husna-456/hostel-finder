import Newsletter from "../models/Newsletter.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = async (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({
        message: "You're already subscribed to our newsletter!",
        alreadySubscribed: true,
      });
    }

    await Newsletter.create({ email });
    res.status(201).json({
      message: "Subscribed successfully! Keep an eye on your inbox.",
      alreadySubscribed: false,
    });
  } catch (err) {
    // Handles a rare race condition on the unique index gracefully
    if (err.code === 11000) {
      return res.status(200).json({
        message: "You're already subscribed to our newsletter!",
        alreadySubscribed: true,
      });
    }
    console.error("subscribeNewsletter error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};
