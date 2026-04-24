import mongoose, { Document, Schema } from "mongoose";

export interface IBonus extends Document {
  nameEn: string;
  nameBn: string;
  bonusType: "fixed" | "percentage";
  amount: number;
  wageringMultiplier: number;
  startDate: Date;
  endDate: Date;
  selectedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const bonusSchema = new Schema<IBonus>(
  {
    nameEn: {
      type: String,
      required: [true, "English name is required"],
    },
    nameBn: {
      type: String,
      required: [true, "Bengali name is required"],
    },
    bonusType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: [true, "Bonus type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    wageringMultiplier: {
      type: Number,
      required: [true, "Wagering multiplier is required"],
      min: [1, "Wagering multiplier must be at least 1"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    selectedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// Validate that endDate is after startDate
bonusSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }
  next();
});

export default mongoose.model<IBonus>("Bonus", bonusSchema);
