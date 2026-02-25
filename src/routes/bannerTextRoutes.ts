import express from "express";
const router = express.Router();
import {
  getBannerText,
  updateBannerText,
} from "../controllers/bannerTextController";
import { protect, adminOnly } from "../middleware/auth";

/**
 * @swagger
 * /api/banner-text:
 *   get:
 *     summary: Get banner text
 *     tags: [Banner Text]
 *     responses:
 *       200:
 *         description: Banner text content
 */
router.get("/", getBannerText);

/**
 * @swagger
 * /api/banner-text:
 *   put:
 *     summary: Update banner text (Admin only)
 *     tags: [Banner Text]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string }
 *     responses:
 *       200:
 *         description: Banner text updated
 *       403:
 *         description: Admin access required
 */
router.put("/", protect, adminOnly, updateBannerText);

export default router;
