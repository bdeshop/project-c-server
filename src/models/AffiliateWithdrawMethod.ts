import mongoose, { Document, Schema } from "mongoose";

export interface IUserInputField {
  fieldLabelEn: string;
  fieldLabelBn: string;
  fieldType: "text" | "number" | "textarea";
  required: boolean;
}

export interface IAffiliateWithdrawMethod extends Document {
  methodNameEn: string;
  methodNameBn: string;
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  processingTime: string;
  status: "Active" | "Inactive";
  withdrawalFee: number;
  feeType: "Fixed" | "Percentage";
  methodImage: string;
  withdrawPageImage: string;
  colors: {
    textColor: string;
    backgroundColor: string;
    buttonColor: string;
  };
  instructionEn: string;
  instructionBn: string;
  userInputFields: IUserInputField[];
  createdAt: Date;
  updatedAt: Date;
}

const userInputFieldSchema = new Schema(
  {
    fieldLabelEn: { type: String, required: true },
    fieldLabelBn: { type: String, default: "" },
    fieldType: {
      type: String,
      enum: ["text", "number", "textarea"],
      default: "text",
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const affiliateWithdrawMethodSchema = new Schema<IAffiliateWithdrawMethod>(
  {
    methodNameEn: {
      type: String,
      required: true,
      trim: true,
    },
    methodNameBn: {
      type: String,
      required: true,
      trim: true,
    },
    minimumWithdrawal: {
      type: Number,
      required: true,
    },
    maximumWithdrawal: {
      type: Number,
      required: true,
    },
    processingTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
    withdrawalFee: {
      type: Number,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["Fixed", "Percentage"],
      required: true,
    },
    methodImage: {
      type: String,
      default: "",
    },
    withdrawPageImage: {
      type: String,
      default: "",
    },
    colors: {
      textColor: { type: String, default: "#000000" },
      backgroundColor: { type: String, default: "#FFFFFF" },
      buttonColor: { type: String, default: "#FFFFFF" },
    },
    instructionEn: {
      type: String,
      default: "",
    },
    instructionBn: {
      type: String,
      default: "",
    },
    userInputFields: {
      type: [userInputFieldSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAffiliateWithdrawMethod>(
  "AffiliateWithdrawMethod",
  affiliateWithdrawMethodSchema,
);
