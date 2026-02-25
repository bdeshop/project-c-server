import express from "express";
const router = express.Router();
import {
  getPromoSection,
  updatePromoSection,
  togglePromoSection,
} from "../controllers/promoSectionController";
import { protect, adminOnly, optionalProtect } from "../middleware/auth";

/**
 * @swagger
 * /api/promo-section:
 *   get:
 *     summary: Get promo section
 *     tags: [Promo Section]
 *     responses:
 *       200:
 *         description: Promo section details
 */
router.get("/", optionalProtect, getPromoSection);

/**
 * @swagger
 * /api/promo-section:
 *   put:
 *     summary: Update promo section (Admin only)
 *     tags: [Promo Section]
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
 *         description: Promo section updated
 *       403:
 *         description: Admin access required
 */
router.put("/", protect, adminOnly, updatePromoSection);

/**
 * @swagger
 * /api/promo-section/toggle:
 *   patch:
 *     summary: Toggle promo section status (Admin only)
 *     tags: [Promo Section]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status toggled
 *       403:
 *         description: Admin access required
 */
router.patch("/toggle", protect, adminOnly, togglePromoSection);

export default router;
