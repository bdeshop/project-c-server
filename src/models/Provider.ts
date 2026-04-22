import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  name: string;
  providerCode?: string;
  logo: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>(
  {
    name: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
      unique: true,
    },
    providerCode: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Provider logo is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProvider>("Provider", providerSchema);

