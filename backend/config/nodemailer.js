import dotenv from "dotenv";
dotenv.config();
console.log("🚀 NODEMAILER FILE LOADED");


import nodemailer from "nodemailer";

if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  console.warn("⚠️ EMAIL or EMAIL_PASSWORD is not set.");
}

console.log("EMAIL:", process.env.EMAIL);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "FOUND" : "MISSING"
);
console.log("Creating transporter...");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Agar issue aaye to 465 bhi try kar sakti ho
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
});

console.log("Before verify");

transporter.verify((error, success) => {
  console.log("Inside verify callback");

  if (error) {
    console.error(error);
  } else {
    console.log("SMTP Connected");
  }
});

console.log("After verify");

export default transporter;