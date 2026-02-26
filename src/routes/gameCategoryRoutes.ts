import express from "express";
import {
  getGameCategories,
  getGameCategory,
  createGameCategory,
  updateGameCategory,
  deleteGameCategory,
} from "../controllers/gameCategoryController";
import { protect, authorize } from "../middleware/auth";
import cloudinaryUpload from "../middleware/cloudinaryUpload";

const router = express.Router();

// Public routes
router.get("/", getGameCategories);
router.get("/:id", getGameCategory);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin"),
  cloudinaryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createGameCategory,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  cloudinaryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  updateGameCategory,
);
router.delete("/:id", protect, authorize("admin"), deleteGameCategory);

export default router;
