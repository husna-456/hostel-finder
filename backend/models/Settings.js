import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  // General / Branding
  siteName:             { type: String,  default: "Hostel Finder" },
  logoUrl:              { type: String,  default: "" },
  supportEmail:         { type: String,  default: "" },
  supportPhone:         { type: String,  default: "" },
  primaryCity:          { type: String,  default: "" },
  featuredHostelLimit:  { type: Number,  default: 6 },
  reviewsEnabled:       { type: Boolean, default: true },
  reviewsLimit:         { type: Number,  default: 6 },
  reviewsSortBy:        { type: String,  enum: ["latest", "highest_rated"], default: "latest" },

  // Booking & Payments
  advancePercent:       { type: Number,  default: 30 },
  platformCommission:   { type: Number,  default: 0 },
  stripeEnabled:        { type: Boolean, default: true },
  jazzCashEnabled:      { type: Boolean, default: true },
  easypaisaEnabled:     { type: Boolean, default: true },

  // Access Control
  maintenanceMode:         { type: Boolean, default: false },
  allowUserRegistration:   { type: Boolean, default: true },
  allowOwnerRegistration:  { type: Boolean, default: true },

  // Legal
  termsAndConditions: { type: String, default: "" },
  privacyPolicy:      { type: String, default: "" },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Settings = mongoose.model("Settings", SettingsSchema);
export default Settings;
