import mongoose from "mongoose";

const userInputFieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // demo
  type: { type: String, required: true }, // text, select, etc.
  label_en: { type: String, required: true }, // demo
  label_bd: { type: String, required: false }, // ডেমো
  isRequired: { type: Boolean, default: false }, // true / false
  instruction_en: { type: String, default: "" }, // demo instruction
  instruction_bd: { type: String, default: "" }, // demo instruction bn
});

const paymentMethodSchema = new mongoose.Schema(
  {
    method_name_en: { type: String, required: true }, // Method Name (English)
    method_name_bd: { type: String, required: false }, // Method Name (Bangla)
    agent_wallet_number: { type: String, required: false },
    agent_wallet_text: { type: String, required: false },
    method_image: { type: String, required: false }, // Path or URL
    payment_page_image: { type: String, required: false },
    gateways: [{ type: String }], // Array of gateway names
    text_color: { type: String, default: "#000000" },
    background_color: { type: String, default: "#ffffff" },
    button_color: { type: String, default: "#000000" },
    instruction_en: { type: String, default: "" },
    instruction_bd: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    user_inputs: [userInputFieldSchema], // Array of user fields
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", paymentMethodSchema);
