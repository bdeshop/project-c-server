import mongoose, { Document, Schema } from "mongoose";

export interface IPayoutHistory extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  adminEmail?: string;
  affiliates: Array<{
    affiliateId: mongoose.Types.ObjectId;
    affiliateName: string;
    affiliateCode: string;
    userCount: number;
    currentBalance: number;
    previousPayoutBalance: number;
    newPayoutBalance: number;
  }>;
  totalAffiliatesProcessed: number;
  totalAmountDistributed: number;
  distributedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutHistorySchema = new Schema<IPayoutHistory>(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      default: "",
    },
    affiliates: [
      {
        affiliateId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Affiliate",
        },
        affiliateName: {
          type: String,
          required: true,
        },
        affiliateCode: {
          type: String,
          required: true,
        },
        userCount: {
          type: Number,
          required: true,
        },
        currentBalance: {
          type: Number,
          required: true,
        },
        previousPayoutBalance: {
          type: Number,
          required: true,
        },
        newPayoutBalance: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAffiliatesProcessed: {
      type: Number,
      required: true,
    },
    totalAmountDistributed: {
      type: Number,
      required: true,
    },
    distributedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPayoutHistory>(
  "PayoutHistory",
  payoutHistorySchema,
);
