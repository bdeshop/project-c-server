import mongoose, { Schema, Document } from "mongoose";

export interface IDepositBonus extends Document {
  welcomeBonusName: string;
  minimumBonusBDT: number;
  bonusType: string;
  bonusCode: string;
  totalAmountBDT: number;
  percentageValue: number;
  minimumDepositBDT: number;
  wageringRequirement: number;
  validityPeriodDays: number;
  applicableTo: string;
  depositMethodId?: mongoose.Types.ObjectId; // Link to payment method
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositBonusSchema = new Schema<IDepositBonus>(
  {
    welcomeBonusName: { type: String, required: true },
    minimumBonusBDT: { type: Number, required: true, min: 0 },
    bonusType: {
      type: String,
      required: true,
      enum: ["Winnable", "Non-Winnable", "Hybrid", "Cashback"],
    },
    bonusCode: { type: String, required: true, unique: true },
    totalAmountBDT: { type: Number, required: true, min: 0 },
    percentageValue: { type: Number, required: true, min: 0, max: 100 },
    minimumDepositBDT: { type: Number, required: true, min: 0 },
    wageringRequirement: { type: Number, required: true, min: 0 },
    validityPeriodDays: { type: Number, required: true, min: 1 },
    applicableTo: { type: String, required: true },
    depositMethodId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: false,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IDepositBonus>(
  "DepositBonus",
  DepositBonusSchema,
);
