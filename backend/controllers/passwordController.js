import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";


// Send password reset email
export const sendPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Enter your email" });

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a secure random token (32 bytes → hex string)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it (so even if DB leaks, the token stays safe)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token + expiry to DB
    user.resetPasswordToken = hashedToken;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    user.resetPasswordExpire = Date.now() + THIRTY_DAYS;
    await user.save();

    // Construct reset URL (frontend link)
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/forget-password/${user._id}/${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested to reset your password.\n\nClick the link below to reset it (valid for 30 days):\n\n${resetUrl}\n\nIf you didn’t request this, please ignore this email.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Email not sent", error });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ message: "Reset link sent to your email" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
// Verify reset link
export const verifyResetLink = async (req, res) => {
  const { id, token } = req.params;

  // Hash the token received from URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    _id: id,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  res.status(200).json({ message: "Token is valid" });
};

// Change password
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    _id: id,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};
