import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Brevo HTTP API — no SMTP, no port blocking, send to ANY email free
const sendBrevoEmail = async ({ to, subject, html, from }) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn("⚠️ BREVO_API_KEY not set — email skipped");
    return;
  }

  const toAddress = typeof to === "string" ? [{ email: to }] : to.map((e) => ({ email: e }));

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Hostel Finder",
          email: process.env.EMAIL || "husnazaheer518@gmail.com",
        },
        to: toAddress,
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("❌ Brevo email error:", err.message || JSON.stringify(err));
    } else {
      console.log("✅ Email sent to:", to);
    }
  } catch (err) {
    console.error("❌ Brevo fetch error:", err.message);
  }
};

// Drop-in replacement — same sendMail() interface as nodemailer
const transporter = {
  sendMail: sendBrevoEmail,
};

console.log(
  process.env.BREVO_API_KEY
    ? "✅ Brevo email ready"
    : "⚠️ BREVO_API_KEY missing — emails disabled"
);

export default transporter;
