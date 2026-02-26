import express from "express";
import {
  getPopularGames,
  getAllPopularGames,
  getPopularGame,
  createPopularGame,
  updatePopularGame,
  deletePopularGame,
} from "../controllers/popularGameController";
import { protect, authorize } from "../middleware/auth";
import cloudinaryUpload from "../middleware/cloudinaryUpload";

const router = express.Router();

// Public routes
router.get("/", getPopularGames);
router.get("/:id", getPopularGame);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllPopularGames);
router.post(
  "/",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("image"),
  createPopularGame,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("image"),
  updatePopularGame,
);
router.delete("/:id", protect, authorize("admin"), deletePopularGame);

export default router;
