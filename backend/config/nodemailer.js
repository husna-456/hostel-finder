import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Resend SMTP — works from Railway/cloud (no port blocking)
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
  defaults: {
    from: "Hostel Finder <onboarding@resend.dev>",
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});

export default transporter;
