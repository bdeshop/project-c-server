import mongoose, { Document } from "mongoose";

export interface IApkFile extends Document {
  filename: string;
  originalName: string;
  version: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  downloadCount: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const apkFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApkFile>("ApkFile", apkFileSchema);
