import mongoose, { Schema, Document } from "mongoose";

export interface IBonusWagering extends Document {
  userId: mongoose.Types.ObjectId;
  depositTransactionId?: mongoose.Types.ObjectId;
  depositBonusId: mongoose.Types.ObjectId;
  bonusAmount: number;
  requiredWageringAmount: number; // Total amount needed to wager (bonusAmount * wageringRequirement)
  currentWageringAmount: number; // Amount wagered so far
  wageringProgress: number; // Percentage (0-100)
  status: "active" | "completed" | "expired";
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BonusWageringSchema = new Schema<IBonusWagering>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    depositTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    depositBonusId: {
      type: Schema.Types.ObjectId,
      ref: "DepositBonus",
      required: true,
    },
    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    requiredWageringAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentWageringAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    wageringProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Index for faster queries
BonusWageringSchema.index({ userId: 1, status: 1 });
BonusWageringSchema.index({ depositTransactionId: 1 });

export default mongoose.model<IBonusWagering>(
  "BonusWagering",
  BonusWageringSchema,
);
