import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      "EMAIL or EMAIL_PASSWORD is not set. Add them to Railway environment variables."
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify SMTP connection once
    //await transporter.verify();
    //console.log("✅ [mailer] Gmail SMTP connected successfully");
  }

  return transporter;
};

const mailer = {
  sendMail: async ({ to, subject, html, text }) => {
    const smtp = await getTransporter();

    const mailOptions = {
      from: `"Hostel Finder" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    };

    console.log(`[mailer] → Sending "${subject}" to ${to}`);

    const info = await smtp.sendMail(mailOptions);

    console.log(
      `✅ [mailer] Email sent to ${to} | Message ID: ${info.messageId}`
    );

    return info;
  },
};

console.log(
  process.env.EMAIL && process.env.EMAIL_PASSWORD
    ? `✅ [mailer] Gmail ready: ${process.env.EMAIL}`
    : "⚠️ [mailer] EMAIL or EMAIL_PASSWORD missing"
);

export default mailer;