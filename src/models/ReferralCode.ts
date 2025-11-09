import mongoose, { Document, Schema } from "mongoose";

export interface IReferralCode extends Document {
  code: string;
  owner: mongoose.Types.ObjectId;
  usedBy: mongoose.Types.ObjectId[];
  totalUses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const referralCodeSchema = new Schema<IReferralCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 8,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalUses: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
referralCodeSchema.index({ code: 1 });
referralCodeSchema.index({ owner: 1 });

export default mongoose.model<IReferralCode>(
  "ReferralCode",
  referralCodeSchema
);
