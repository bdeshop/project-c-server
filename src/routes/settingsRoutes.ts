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

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get application settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Application settings
 */
router.get("/", getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update application settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 *       403:
 *         description: Admin access required
 */
router.put("/", protect, adminOnly, updateSettingsValidation, updateSettings);

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset settings to default (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset
 *       403:
 *         description: Admin access required
 */
router.post("/reset", protect, adminOnly, resetSettings);

/**
 * @swagger
 * /api/settings/theme:
 *   patch:
 *     summary: Update theme colors (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primaryColor: { type: string }
 *               secondaryColor: { type: string }
 *     responses:
 *       200:
 *         description: Theme updated
 *       403:
 *         description: Admin access required
 */
router.patch("/theme", protect, adminOnly, updateThemeValidation, updateTheme);

/**
 * @swagger
 * /api/settings/organization:
 *   patch:
 *     summary: Update organization details (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               logo: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Organization updated
 *       403:
 *         description: Admin access required
 */
router.patch(
  "/organization",
  protect,
  adminOnly,
  upload.single("organizationImage"),
  updateOrganizationValidation,
  updateOrganization,
);

/**
 * @swagger
 * /api/settings/landing-page/header:
 *   patch:
 *     summary: Update landing page header (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               headerLogo: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Header updated
 *       403:
 *         description: Admin access required
 */
router.patch(
  "/landing-page/header",
  protect,
  adminOnly,
  upload.single("headerLogo"),
  updateOrganizationValidation,
  updateLandingPageHeader,
);

/**
 * @swagger
 * /api/settings/landing-page/navigation:
 *   patch:
 *     summary: Update landing page navigation (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Navigation updated
 *       403:
 *         description: Admin access required
 */
router.patch(
  "/landing-page/navigation",
  protect,
  adminOnly,
  updateUISettingsValidation,
  updateNavigationItemsValidation,
  updateLandingPageNavigation,
);

/**
 * @swagger
 * /api/settings/landing-page/fonts:
 *   patch:
 *     summary: Update landing page fonts (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Fonts updated
 *       403:
 *         description: Admin access required
 */
router.patch(
  "/landing-page/fonts",
  protect,
  adminOnly,
  updateUISettingsValidation,
  updateLandingPageFonts,
);

/**
 * @swagger
 * /api/settings/ui:
 *   patch:
 *     summary: Update global UI customization
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: UI settings updated
 */
router.patch("/ui", updateUISettingsValidation, updateUISettings);

export default router;
