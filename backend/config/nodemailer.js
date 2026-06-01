import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Mailjet HTTP API — free 200/day, no domain needed, works from Railway
const transporter = {
  sendMail: async ({ to, subject, html }) => {
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.warn("⚠️ Mailjet keys not set — email skipped");
      return;
    }

    const toAddress = typeof to === "string" ? [{ Email: to }] : to.map((e) => ({ Email: e }));

    try {
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
        body: JSON.stringify({
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
              Headers: {
                "X-Mailjet-Campaign": "hostel-finder-transactional",
              },
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.Messages?.[0]?.Status !== "success") {
        console.error("❌ Mailjet error:", JSON.stringify(data));
      } else {
        console.log("✅ Email sent to:", to);
      }
    } catch (err) {
      console.error("❌ Mailjet fetch error:", err.message);
    }
  },
};

console.log(
  process.env.MAILJET_API_KEY
    ? "✅ Mailjet email ready"
    : "⚠️ Mailjet keys missing — emails disabled"
);

export default transporter;
