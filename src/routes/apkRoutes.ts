import express from "express";
import {
  uploadApk,
  getAllApks,
  getLatestApk,
  downloadApk,
  deleteApk,
  toggleApkStatus,
  updateApkDetails,
} from "../controllers/apkController";
import { protect } from "../middleware/auth";
import apkUpload from "../middleware/apkUpload";

const router = express.Router();

// Public routes
router.get("/", getAllApks);
router.get("/latest", getLatestApk);
router.get("/download/:id", downloadApk);

// Admin only routes
router.post("/upload", protect, apkUpload.single("apk"), uploadApk);
router.delete("/:id", protect, deleteApk);
router.patch("/:id/toggle", protect, toggleApkStatus);
router.put("/:id", protect, updateApkDetails);

export default router;
