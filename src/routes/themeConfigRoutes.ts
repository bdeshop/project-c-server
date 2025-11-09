import express from "express";
import {
  getThemeConfig,
  updateThemeConfig,
  patchThemeConfig,
  resetThemeConfig,
  toggleThemeConfig
} from "../controllers/themeConfigController";
import { themeConfigValidation } from "../middleware/themeConfigValidation";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

// ============================================================================
// THEME CONFIGURATION ROUTES
// ============================================================================

// @route   GET /api/theme-config
// @desc    Get theme configuration
// @access  Public
router.get("/", getThemeConfig);

// @route   PUT /api/theme-config
// @desc    Update all theme configuration
// @access  Private (Admin only)
router.put("/", protect, adminOnly, themeConfigValidation, updateThemeConfig);

// @route   PATCH /api/theme-config
// @desc    Partially update theme configuration
// @access  Private (Admin only)
router.patch("/", protect, adminOnly, themeConfigValidation, patchThemeConfig);

// @route   POST /api/theme-config/reset
// @desc    Reset theme configuration to default values
// @access  Private (Admin only)
router.post("/reset", protect, adminOnly, resetThemeConfig);

// @route   PATCH /api/theme-config/toggle
// @desc    Toggle theme configuration active status
// @access  Private (Admin only)
router.patch("/toggle", protect, adminOnly, toggleThemeConfig);

export default router;