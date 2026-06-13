import { Resend } from "resend";

// ── Resend client ─────────────────────────────────────────────────────────────
// Resend handles SPF / DKIM / DMARC automatically for verified domains.
// Domain verification is done once in the Resend dashboard (resend.com).
// Once verified, all emails sent through this client are fully authenticated.

let client = null;

const getClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to Railway environment variables."
    );
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
};

// ── sendMail — same interface as before, drop-in replacement ──────────────────
// { to, subject, html, text }
// Nothing above this (emailService, emailQueue, etc.) needs to change.
const transporter = {
  sendMail: async ({ to, subject, html, text }) => {
    const resend = getClient();

    // EMAIL_FROM must be a verified sender in Resend (your domain).
    // During testing you can use: onboarding@resend.dev
    // For production set: noreply@yourdomain.com
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const replyTo   = process.env.EMAIL      || fromEmail;

    const toList = typeof to === "string" ? [to] : to;

    console.log(`[mailer] → Sending "${subject}" to ${to} (from: ${fromEmail})`);

    const { data, error } = await resend.emails.send({
      from:     `Hostel Finder <${fromEmail}>`,
      to:       toList,
      reply_to: replyTo,
      subject,
      text,
      ...(html ? { html } : {}), // omit HTML for text-only sends
    });

    if (error) {
      console.error(`❌ [mailer] Resend rejected delivery to ${to}:`, error);
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    console.log(`✅ [mailer] Delivered "${subject}" → ${to} (id: ${data?.id})`);
    return data;
  },
};

console.log(
  process.env.RESEND_API_KEY
    ? `✅ [mailer] Resend ready — from: ${process.env.EMAIL_FROM || "onboarding@resend.dev (test mode)"}`
    : "⚠️  [mailer] RESEND_API_KEY missing — emails will throw on send"
);

export default transporter;
