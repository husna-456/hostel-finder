import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

// Non-crashing verify — just logs the result
transporter.verify()
  .then(() => console.log("✅ Email transporter ready"))
  .catch((err) => console.warn("⚠️ Email not configured:", err.message));

export default transporter;
