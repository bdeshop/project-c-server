import mongoose, { Document, Schema } from "mongoose";

export interface IRewardConfig extends Document {
  dailyRewardAmount: number;
  referralBonusAmount: number;
  depositBonusPercentage: number;
  maxDailyRewards: number;
  rewardExpiryDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const rewardConfigSchema = new Schema<IRewardConfig>(
  {
    dailyRewardAmount: {
      type: Number,
      default: 10,
    },
    referralBonusAmount: {
      type: Number,
      default: 50,
    },
    depositBonusPercentage: {
      type: Number,
      default: 5,
    },
    maxDailyRewards: {
      type: Number,
      default: 100,
    },
    rewardExpiryDays: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IRewardConfig>(
  "RewardConfig",
  rewardConfigSchema,
);
