import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promotion_image: { type: String, required: false }, // File path or URL
    title_en: { type: String, required: true }, // Promotion Title (English)
    title_bd: { type: String, required: false }, // Title (Bangla)
    description_en: { type: String, required: false }, // Description (English)
    description_bd: { type: String, required: false }, // Description (Bangla)
    game_type: { type: String, required: true }, // Dropdown (Select Game Type)
    // Reference to selected payment methods
    payment_methods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod",
      },
    ],
    // Example future expansion for bonus settings
    bonus_settings: {
      bonus_type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "fixed",
      },
      bonus_value: { type: Number, default: 0 },
      max_bonus_limit: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Promotion", promotionSchema);
