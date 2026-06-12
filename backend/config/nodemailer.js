import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Mailjet HTTP API — free 200/day, no domain needed, works from Railway
const transporter = {
  sendMail: async ({ to, subject, html }) => {
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      const err = new Error("Mailjet keys not configured (MAILJET_API_KEY / MAILJET_SECRET_KEY missing)");
      console.error("❌ [nodemailer]", err.message);
      throw err; // propagate — callers must handle this
    }

    const toAddress =
      typeof to === "string" ? [{ Email: to }] : to.map((e) => ({ Email: e }));

    const body = JSON.stringify({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL || "husnazaheer518@gmail.com",
            Name: "Hostel Finder",
          },
          ReplyTo: {
            Email: process.env.EMAIL || "husnazaheer518@gmail.com",
          },
          To: toAddress,
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    console.log(`[nodemailer] → Sending "${subject}" to ${to}`);

    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
          ).toString("base64"),
      },
      body,
    });

    const data = await res.json();

    if (!res.ok || data.Messages?.[0]?.Status !== "success") {
      // Build a detailed error so the queue can log the actual Mailjet reason
      const detail = JSON.stringify(data);
      const err = new Error(`Mailjet API rejected: ${detail}`);
      console.error(`❌ [nodemailer] Delivery failed to ${to}:`, detail);
      throw err; // callers (emailQueue try/catch) will catch and log this
    }

    console.log(`✅ [nodemailer] Delivered "${subject}" → ${to}`);
  },
};

console.log(
  process.env.MAILJET_API_KEY
    ? "✅ [nodemailer] Mailjet ready"
    : "⚠️  [nodemailer] Mailjet keys missing — emails will throw on send"
);

export default transporter;
