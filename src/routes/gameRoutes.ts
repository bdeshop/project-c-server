import express from "express";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from "../controllers/gameController";
import { protect, authorize } from "../middleware/auth";
import upload from "../middleware/multer";

const router = express.Router();

// Public routes
router.get("/", getGames);
router.get("/:id", getGame);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  createGame,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateGame,
);
router.delete("/:id", protect, authorize("admin"), deleteGame);

export default router;
