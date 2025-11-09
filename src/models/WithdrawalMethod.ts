import mongoose, { Document, Schema } from "mongoose";

interface IUserInputField {
  name: string;
  type: string;
  label_en: string;
  label_bd?: string;
  isRequired: boolean;
  instruction_en: string;
  instruction_bd: string;
}

export interface IWithdrawalMethod extends Document {
  method_name_en: string;
  method_name_bd?: string;
  method_image?: string;
  withdrawal_page_image?: string;
  min_withdrawal: number;
  max_withdrawal: number;
  processing_time: string;
  withdrawal_fee: number;
  fee_type: "fixed" | "percentage";
  text_color: string;
  background_color: string;
  button_color: string;
  instruction_en: string;
  instruction_bd: string;
  status: "Active" | "Inactive";
  user_inputs: IUserInputField[];
  createdAt: Date;
  updatedAt: Date;
}

const userInputFieldSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  label_en: { type: String, required: true },
  label_bd: { type: String, required: false },
  isRequired: { type: Boolean, default: false },
  instruction_en: { type: String, default: "" },
  instruction_bd: { type: String, default: "" },
});

const withdrawalMethodSchema = new Schema<IWithdrawalMethod>(
  {
    method_name_en: { type: String, required: true },
    method_name_bd: { type: String, required: false },
    method_image: { type: String, required: false },
    withdrawal_page_image: { type: String, required: false },
    min_withdrawal: { type: Number, default: 100 },
    max_withdrawal: { type: Number, default: 100000 },
    processing_time: { type: String, default: "24 hours" },
    withdrawal_fee: { type: Number, default: 0 },
    fee_type: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    text_color: { type: String, default: "#000000" },
    background_color: { type: String, default: "#ffffff" },
    button_color: { type: String, default: "#000000" },
    instruction_en: { type: String, default: "" },
    instruction_bd: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    user_inputs: [userInputFieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawalMethod>(
  "WithdrawalMethod",
  withdrawalMethodSchema
);
