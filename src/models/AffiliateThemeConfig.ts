import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliateThemeConfig extends Document {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateThemeConfigSchema = new Schema<IAffiliateThemeConfig>(
  {
    logo: {
      type: String,
      default: null,
    },
    favicon: {
      type: String,
      default: null,
    },
    primaryColor: {
      type: String,
      default: "#000000",
      match: /^#[0-9A-F]{6}$/i,
    },
    secondaryColor: {
      type: String,
      default: "#FFFFFF",
      match: /^#[0-9A-F]{6}$/i,
    },
    accentColor: {
      type: String,
      default: "#007BFF",
      match: /^#[0-9A-F]{6}$/i,
    },
    fontFamily: {
      type: String,
      default: "Arial, sans-serif",
    },
    borderRadius: {
      type: String,
      default: "4px",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAffiliateThemeConfig>(
  "AffiliateThemeConfig",
  affiliateThemeConfigSchema,
);
