import mongoose, { Schema, Document } from "mongoose";

interface ISubCategory {
  _id?: mongoose.Types.ObjectId;
  name: string;
}

export interface IGameCategory extends Document {
  nameEnglish: string;
  nameBangla: string;
  icon: string;
  image?: string;
  displayType: "providers" | "games";
  providers: mongoose.Types.ObjectId[];
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
  },
  { _id: true },
);

const gameCategorySchema = new Schema<IGameCategory>(
  {
    nameEnglish: {
      type: String,
      required: [true, "Category name in English is required"],
      trim: true,
    },
    nameBangla: {
      type: String,
      required: [true, "Category name in Bangla is required"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Category icon is required"],
    },
    image: {
      type: String,
    },
    displayType: {
      type: String,
      enum: ["providers", "games"],
      default: "providers",
      required: true,
    },
    providers: {
      type: [Schema.Types.ObjectId],
      ref: "Provider",
      default: [],
    },
    subCategories: {
      type: [subCategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IGameCategory>(
  "GameCategory",
  gameCategorySchema,
);
