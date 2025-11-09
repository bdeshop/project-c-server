import express from "express";
import {
  getSettings,
  updateSettings,
  resetSettings,
  updateTheme,
  updateOrganization,
  updateUISettings,
  updateLandingPageHeader,
  updateLandingPageNavigation,
  updateLandingPageFonts,
} from "../controllers/settingsController";
import {
  updateSettingsValidation,
  updateThemeValidation,
  updateOrganizationValidation,
  updateUISettingsValidation,
  updateNavigationItemsValidation,
} from "../middleware/validation";
import { protect, adminOnly } from "../middleware/auth";
import upload from "../middleware/multer";

const router = express.Router();

// ============================================================================
// GENERAL SETTINGS ROUTES
// ============================================================================

// @route   GET /api/settings
// @desc    Get application settings
// @access  Public (filtered response for non-admin users)
router.get("/", getSettings);

// @route   PUT /api/settings
// @desc    Update all application settings
// @access  Private (Admin only)
router.put("/", protect, adminOnly, updateSettingsValidation, updateSettings);

// @route   POST /api/settings/reset
// @desc    Reset settings to default values
// @access  Private (Admin only)
router.post("/reset", protect, adminOnly, resetSettings);

// ============================================================================
// THEME CUSTOMIZATION ROUTES
// ============================================================================

// @route   PATCH /api/settings/theme
// @desc    Update theme colors only
// @access  Private (Admin only)
router.patch("/theme", protect, adminOnly, updateThemeValidation, updateTheme);

// ============================================================================
// ORGANIZATION SETTINGS ROUTES
// ============================================================================

// @route   PATCH /api/settings/organization
// @desc    Update organization details (name, logo, contact info)
// @access  Private (Admin only)
router.patch(
  "/organization",
  protect,
  adminOnly,
  upload.single("organizationImage"), // Handle image upload
  updateOrganizationValidation,
  updateOrganization
);

// ============================================================================
// LANDING PAGE CUSTOMIZATION ROUTES
// ============================================================================

// @route   PATCH /api/settings/landing-page/header
// @desc    Update landing page header settings (logo, colors)
// @access  Private (Admin only)
router.patch(
  "/landing-page/header",
  protect,
  adminOnly,
  upload.single("headerLogo"), // Handle header logo upload
  updateOrganizationValidation, // Reusing organization validation for logo/image URLs
  updateLandingPageHeader
);

// @route   PATCH /api/settings/landing-page/navigation
// @desc    Update landing page navigation settings (menu items, fonts)
// @access  Private (Admin only)
router.patch(
  "/landing-page/navigation",
  protect,
  adminOnly,
  updateUISettingsValidation, // Using UI validation for navigation styling
  updateNavigationItemsValidation, // Adding navigation items validation
  updateLandingPageNavigation
);

// @route   PATCH /api/settings/landing-page/fonts
// @desc    Update landing page font settings (sizes, families)
// @access  Private (Admin only)
router.patch(
  "/landing-page/fonts",
  protect,
  adminOnly,
  updateUISettingsValidation, // Using UI validation for font settings
  updateLandingPageFonts
);

// ============================================================================
// GLOBAL UI CUSTOMIZATION ROUTES
// ============================================================================

// @route   PATCH /api/settings/ui
// @desc    Update global UI customization settings
// @access  Public (but should be protected in production)
router.patch(
  "/ui",
  // NOTE: Removed protect and adminOnly middleware for easier testing
  // In production, you should uncomment the line below:
  // protect,
  updateUISettingsValidation,
  updateUISettings
);

export default router;
