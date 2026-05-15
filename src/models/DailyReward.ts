import mongoose, { Document, Schema } from "mongoose";

export interface IDailyReward extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  rewardDate: Date;
  isClaimed: boolean;
  claimedAt?: Date;
  source: "referral" | "bonus" | "daily" | "other";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dailyRewardSchema = new Schema<IDailyReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    rewardDate: {
      type: Date,
      required: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ["referral", "bonus", "daily", "other"],
      default: "referral",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IDailyReward>("DailyReward", dailyRewardSchema);
