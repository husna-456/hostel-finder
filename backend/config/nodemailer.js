import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// Uses Resend HTTP API — not SMTP, so Railway/cloud port blocking doesn't apply
const resend = new Resend(process.env.RESEND_API_KEY);

// Drop-in replacement for nodemailer transporter
// Accepts the same { to, subject, html } shape as sendMail()
const transporter = {
  sendMail: async ({ to, subject, html, from }) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not set — email skipped");
      return;
    }
    const { error } = await resend.emails.send({
      from: from || "Hostel Finder <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("❌ Resend email error:", error.message);
    } else {
      console.log("✅ Email sent to:", to);
    }
  },
};

console.log(
  process.env.RESEND_API_KEY
    ? "✅ Resend email ready"
    : "⚠️ RESEND_API_KEY missing — emails disabled"
);

export default transporter;
