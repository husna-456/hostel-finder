import Settings from "../models/Settings.js";
import { refreshMaintenanceCache } from "../middleware/maintenanceMiddleware.js";

// Singleton helper — returns the one Settings doc, creating it if missing
export const getOrCreate = async () => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
};

// GET /api/admin/settings  (admin only)
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/admin/settings  (admin only)
const ALLOWED = [
  "siteName", "logoUrl", "supportEmail", "supportPhone", "primaryCity", "featuredHostelLimit",
  "advancePercent", "platformCommission", "stripeEnabled", "jazzCashEnabled", "easypaisaEnabled",
  "maintenanceMode", "allowUserRegistration", "allowOwnerRegistration",
  "termsAndConditions", "privacyPolicy",
];

export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    ALLOWED.forEach(key => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });
    settings.updatedBy = req.user._id;
    await settings.save();
    refreshMaintenanceCache();
    res.json({ message: "Settings saved", settings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/settings/public  (no auth — safe public fields only)
export const getPublicSettings = async (req, res) => {
  try {
    const s = await getOrCreate();
    res.json({
      siteName:                s.siteName,
      logoUrl:                 s.logoUrl,
      supportEmail:            s.supportEmail,
      supportPhone:            s.supportPhone,
      primaryCity:             s.primaryCity,
      featuredHostelLimit:     s.featuredHostelLimit,
      advancePercent:          s.advancePercent,
      stripeEnabled:           s.stripeEnabled,
      jazzCashEnabled:         s.jazzCashEnabled,
      easypaisaEnabled:        s.easypaisaEnabled,
      maintenanceMode:         s.maintenanceMode,
      allowUserRegistration:   s.allowUserRegistration,
      allowOwnerRegistration:  s.allowOwnerRegistration,
      termsAndConditions:      s.termsAndConditions,
      privacyPolicy:           s.privacyPolicy,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
