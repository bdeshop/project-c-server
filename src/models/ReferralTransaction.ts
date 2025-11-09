import mongoose, { Document, Schema } from "mongoose";

export interface IReferralTransaction extends Document {
  referrer: mongoose.Types.ObjectId;
  referee: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "approved" | "paid";
  createdAt: Date;
}

const referralTransactionSchema = new Schema<IReferralTransaction>(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReferralTransaction>(
  "ReferralTransaction",
  referralTransactionSchema
);