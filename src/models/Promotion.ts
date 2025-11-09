import mongoose from "mongoose";

export interface IPromotion extends mongoose.Document {
  promotion_image: string | null;
  title_en: string;
  title_bd?: string;
  description_en?: string;
  description_bd?: string;
  game_type: string;
  payment_methods: mongoose.Types.ObjectId[];
  bonus_settings: {
    bonus_type: "percentage" | "fixed";
    bonus_value: number;
    max_bonus_limit: number;
  };
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new mongoose.Schema(
  {
    promotion_image: { type: String, required: false, default: null }, // File path or URL
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

export default mongoose.model<IPromotion>("Promotion", promotionSchema);
