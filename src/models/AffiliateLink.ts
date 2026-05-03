import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliateLink extends Document {
  affiliateId: mongoose.Types.ObjectId;
  name: string;
  type: "REGISTRATION" | "PROMOTION" | "DEPOSIT" | "CUSTOM";
  status: "ACTIVE" | "INACTIVE" | "PAUSED";
  description: string;
  url: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateLinkSchema = new Schema<IAffiliateLink>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["REGISTRATION", "PROMOTION", "DEPOSIT", "CUSTOM"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PAUSED"],
      default: "ACTIVE",
    },
    description: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Update conversion rate before saving
affiliateLinkSchema.pre("save", function (next) {
  if (this.clicks > 0) {
    this.conversionRate = (this.conversions / this.clicks) * 100;
  } else {
    this.conversionRate = 0;
  }
  next();
});

export default mongoose.model<IAffiliateLink>(
  "AffiliateLink",
  affiliateLinkSchema,
);
