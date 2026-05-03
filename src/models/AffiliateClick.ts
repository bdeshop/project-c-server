import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliateClick extends Document {
  affiliateId: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  converted: boolean;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const affiliateClickSchema = new Schema<IAffiliateClick>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    linkId: {
      type: Schema.Types.ObjectId,
      ref: "AffiliateLink",
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
    },
    converted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAffiliateClick>(
  "AffiliateClick",
  affiliateClickSchema,
);
