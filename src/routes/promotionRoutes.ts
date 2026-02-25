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

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: List of promotions
 */
router.get("/", getPromotions);

/**
 * @swagger
 * /api/promotions/test-images:
 *   get:
 *     summary: Test image access
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Image access test result
 */
router.get("/test-images", testImageAccess);

/**
 * @swagger
 * /api/promotions/test-cloudinary:
 *   get:
 *     summary: Test Cloudinary connection
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cloudinary connection successful
 *       403:
 *         description: Admin access required
 */
router.get("/test-cloudinary", protect, adminOnly, testCloudinaryConnection);

/**
 * @swagger
 * /api/promotions/game/{gameType}:
 *   get:
 *     summary: Get promotions by game type
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: gameType
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promotions for game type
 */
router.get("/game/:gameType", getPromotionsByGameType);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promotion details
 *       404:
 *         description: Promotion not found
 */
router.get("/:id", getPromotion);

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create new promotion (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               discount: { type: number }
 *               promotion_image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Promotion created
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  protect,
  adminOnly,
  uploadPromotionImages.single("promotion_image"),
  createPromotion,
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update promotion (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               discount: { type: number }
 *               promotion_image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Promotion updated
 *       403:
 *         description: Admin access required
 */
router.put(
  "/:id",
  protect,
  adminOnly,
  uploadPromotionImages.single("promotion_image"),
  updatePromotion,
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete promotion (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promotion deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", protect, adminOnly, deletePromotion);

/**
 * @swagger
 * /api/promotions/{id}/status:
 *   patch:
 *     summary: Toggle promotion status (Admin only)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status toggled
 *       403:
 *         description: Admin access required
 */
router.patch("/:id/status", protect, adminOnly, togglePromotionStatus);

export default router;
