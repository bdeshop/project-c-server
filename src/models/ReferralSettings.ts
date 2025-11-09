import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReferralSettings extends Document {
  signupBonus: number;
  referralCommission: number;
  referralDepositBonus: number; // New field for deposit bonus
  maxCommissionLimit: number;
  minWithdrawAmount: number;
  minTransferAmount: number; // New field for minimum transfer amount
  updatedAt: Date;
}

interface IReferralSettingsModel extends Model<IReferralSettings> {
  getInstance(): Promise<IReferralSettings>;
}

const referralSettingsSchema = new Schema<IReferralSettings>(
  {
    signupBonus: {
      type: Number,
      default: 0,
    },
    referralCommission: {
      type: Number,
      default: 25, // Default commission amount
    },
    referralDepositBonus: {
      type: Number,
      default: 0, // Bonus when referred user makes a deposit
    },
    maxCommissionLimit: {
      type: Number,
      default: 1000,
    },
    minWithdrawAmount: {
      type: Number,
      default: 100,
    },
    minTransferAmount: {
      type: Number,
      default: 50, // Minimum amount for transfers
    },
  },
  {
    timestamps: true,
  }
);

// Ensure there's only one settings document
referralSettingsSchema.statics.getInstance = async function () {
  let instance = await this.findOne();
  if (!instance) {
    instance = new this();
    await instance.save();
  }
  return instance;
};

export default mongoose.model<IReferralSettings, IReferralSettingsModel>(
  "ReferralSettings",
  referralSettingsSchema
);
