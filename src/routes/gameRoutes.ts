import express from "express";
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  bulkCreateGames,
  updateGameNamesFromOracle,
} from "../controllers/gameController";
import { protect, authorize } from "../middleware/auth";
import cloudinaryUpload from "../middleware/cloudinaryUpload";

const router = express.Router();

// Public routes
router.get("/", getGames);
router.get("/:id", getGame);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("image"),
  createGame,
);
router.post(
  "/bulk",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("providerImage"),
  bulkCreateGames,
);
router.post(
  "/update-names-from-oracle",
  protect,
  authorize("admin"),
  updateGameNamesFromOracle,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  cloudinaryUpload.single("image"),
  updateGame,
);
router.delete("/:id", protect, authorize("admin"), deleteGame);

export default router;

