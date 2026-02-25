import mongoose, { Schema, Document } from "mongoose";

export interface IPopularGame extends Document {
  image: string;
  title: string;
  redirectUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const popularGameSchema = new Schema<IPopularGame>(
  {
    image: {
      type: String,
      required: [true, "Please provide an image"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    redirectUrl: {
      type: String,
      required: [true, "Please provide a redirect URL"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IPopularGame>("PopularGame", popularGameSchema);
