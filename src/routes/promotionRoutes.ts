import express from "express";
import {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getPromotionsByGameType,
  testImageAccess,
  testCloudinaryConnection,
} from "../controllers/promotionController";
import { protect, adminOnly } from "../middleware/auth";
import { uploadPromotionImages } from "../config/cloudinary";

const router = express.Router();

// ============================================================================
// PROMOTION ROUTES
// ============================================================================

// @route   GET /api/promotions
// @desc    Get all promotions
// @access  Public
router.get("/", getPromotions);

// @route   GET /api/promotions/test-images
// @desc    Test image access for React applications
// @access  Public
router.get("/test-images", testImageAccess);

// @route   GET /api/promotions/test-cloudinary
// @desc    Test Cloudinary connection for promotions
// @access  Private (Admin only)
router.get("/test-cloudinary", protect, adminOnly, testCloudinaryConnection);

// @route   GET /api/promotions/game/:gameType
// @desc    Get promotions by game type
// @access  Public
router.get("/game/:gameType", getPromotionsByGameType);

// @route   GET /api/promotions/:id
// @desc    Get single promotion by ID
// @access  Public
router.get("/:id", getPromotion);

// @route   POST /api/promotions
// @desc    Create new promotion
// @access  Private (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  uploadPromotionImages.single("promotion_image"),
  createPromotion
);

// @route   PUT /api/promotions/:id
// @desc    Update promotion
// @access  Private (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  uploadPromotionImages.single("promotion_image"),
  updatePromotion
);

// @route   DELETE /api/promotions/:id
// @desc    Delete promotion
// @access  Private (Admin only)
router.delete("/:id", protect, adminOnly, deletePromotion);

// @route   PATCH /api/promotions/:id/status
// @desc    Toggle promotion status (Active/Inactive)
// @access  Private (Admin only)
router.patch("/:id/status", protect, adminOnly, togglePromotionStatus);

export default router;
