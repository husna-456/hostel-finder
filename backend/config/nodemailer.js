import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Mailjet HTTP API transporter
// sendMail now accepts both html (HTMLPart) and text (TextPart).
// Including a plain-text part is required for good spam scoring —
// HTML-only emails are flagged by most filters.
const transporter = {
  sendMail: async ({ to, subject, html, text }) => {
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      const err = new Error("Mailjet keys not configured (MAILJET_API_KEY / MAILJET_SECRET_KEY missing)");
      console.error("❌ [nodemailer]", err.message);
      throw err;
    }

    const fromEmail = process.env.EMAIL || "husnazaheer518@gmail.com";
    const toAddress =
      typeof to === "string" ? [{ Email: to }] : to.map((e) => ({ Email: e }));

    const body = JSON.stringify({
      Messages: [
        {
          From:    { Email: fromEmail, Name: "Hostel Finder" },
          ReplyTo: { Email: fromEmail },
          To: toAddress,
          Subject: subject,
          HTMLPart: html,
          // Plain-text fallback: spam filters penalise HTML-only messages.
          // This is the single biggest code-level deliverability improvement.
          TextPart: text || "",
          // List-Unsubscribe: Gmail uses this to classify the sender as
          // "transactional" rather than "bulk spam". Its absence lowers trust.
          Headers: {
            "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
          },
          // CustomID lets Mailjet track this campaign in their dashboard
          // (NOT a reserved header — unlike the X-Mailjet-Campaign that failed).
          CustomID: "hostel-finder-transactional",
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
          Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString("base64"),
      },
      body,
    });

    const data = await res.json();

    if (!res.ok || data.Messages?.[0]?.Status !== "success") {
      const detail = JSON.stringify(data);
      const err = new Error(`Mailjet API rejected: ${detail}`);
      console.error(`❌ [nodemailer] Delivery failed to ${to}:`, detail);
      throw err;
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
