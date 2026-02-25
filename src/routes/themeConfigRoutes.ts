import express from "express";
import {
  getThemeConfig,
  updateThemeConfig,
  patchThemeConfig,
  resetThemeConfig,
  toggleThemeConfig,
} from "../controllers/themeConfigController";
import { themeConfigValidation } from "../middleware/themeConfigValidation";
import { protect, adminOnly } from "../middleware/auth";

import express from "express";
import {
  getThemeConfig,
  updateThemeConfig,
  patchThemeConfig,
  resetThemeConfig,
  toggleThemeConfig,
} from "../controllers/themeConfigController";
import { themeConfigValidation } from "../middleware/themeConfigValidation";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/theme-config:
 *   get:
 *     summary: Get theme configuration
 *     tags: [Theme Config]
 *     responses:
 *       200:
 *         description: Theme configuration
 */
router.get("/", getThemeConfig);

/**
 * @swagger
 * /api/theme-config:
 *   put:
 *     summary: Update theme configuration (Admin only)
 *     tags: [Theme Config]
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
 *         description: Theme configuration updated
 *       403:
 *         description: Admin access required
 */
router.put("/", protect, adminOnly, themeConfigValidation, updateThemeConfig);

/**
 * @swagger
 * /api/theme-config:
 *   patch:
 *     summary: Partially update theme configuration (Admin only)
 *     tags: [Theme Config]
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
 *         description: Theme configuration updated
 *       403:
 *         description: Admin access required
 */
router.patch("/", protect, adminOnly, themeConfigValidation, patchThemeConfig);

/**
 * @swagger
 * /api/theme-config/reset:
 *   post:
 *     summary: Reset theme configuration (Admin only)
 *     tags: [Theme Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Theme configuration reset
 *       403:
 *         description: Admin access required
 */
router.post("/reset", protect, adminOnly, resetThemeConfig);

/**
 * @swagger
 * /api/theme-config/toggle:
 *   patch:
 *     summary: Toggle theme configuration status (Admin only)
 *     tags: [Theme Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status toggled
 *       403:
 *         description: Admin access required
 */
router.patch("/toggle", protect, adminOnly, toggleThemeConfig);

export default router;
