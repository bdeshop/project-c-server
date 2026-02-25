import express from "express";
import {
  getGameCategories,
  getGameCategory,
  createGameCategory,
  updateGameCategory,
  deleteGameCategory,
} from "../controllers/gameCategoryController";
import { protect, authorize } from "../middleware/auth";
import upload from "../middleware/multer";

const router = express.Router();

// Public routes
router.get("/", getGameCategories);
router.get("/:id", getGameCategory);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  createGameCategory,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateGameCategory,
);
router.delete("/:id", protect, authorize("admin"), deleteGameCategory);

export default router;
