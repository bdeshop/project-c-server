import express from "express";
import {
  getProviders,
  getAllProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../controllers/providerController";
import { protect, authorize } from "../middleware/auth";
import cloudinaryUpload from "../middleware/cloudinaryUpload";

const router = express.Router();

// Public routes
router.get("/", getProviders);
router.get("/:id", getProvider);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllProviders);
router.post(
  "/",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("logo"),
  createProvider,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("logo"),
  updateProvider,
);
router.delete("/:id", protect, authorize("admin"), deleteProvider);

export default router;
