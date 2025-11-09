import { Schema, model, Document } from "mongoose";

// Define the Slider interface
export interface ISlider extends Document {
  title: string;
  status: string; // active, inactive
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Slider schema
const SliderSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a virtual field for fullImageUrl (this is computed and not stored in DB)
SliderSchema.virtual("fullImageUrl").get(function () {
  // This will be populated in the controller instead
  return this.imageUrl;
});

// Export the Slider model
export default model<ISlider>("Slider", SliderSchema);
