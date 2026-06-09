import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    section: { type: String, enum: ["contact", "facts"], unique: true, required: true },
    data:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("SiteContent", siteContentSchema);
