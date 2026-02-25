import express from "express";
import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  testCloudinaryConnection,
} from "../controllers/paymentMethodController";
import { protect, adminOnly } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

import express from "express";
import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  testCloudinaryConnection,
} from "../controllers/paymentMethodController";
import { protect, adminOnly } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

const router = express.Router();

/**
 * @swagger
 * /api/payment-methods/test-cloudinary:
 *   get:
 *     summary: Test Cloudinary connection
 *     tags: [Payment Methods]
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
 * /api/payment-methods:
 *   get:
 *     summary: Get all payment methods
 *     tags: [Payment Methods]
 *     responses:
 *       200:
 *         description: List of payment methods
 */
router.get("/", getPaymentMethods);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   get:
 *     summary: Get payment method by ID
 *     tags: [Payment Methods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment method details
 *       404:
 *         description: Payment method not found
 */
router.get("/:id", getPaymentMethod);

/**
 * @swagger
 * /api/payment-methods:
 *   post:
 *     summary: Create new payment method (Admin only)
 *     tags: [Payment Methods]
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
 *               description: { type: string }
 *               method_image: { type: string, format: binary }
 *               payment_page_image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Payment method created
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  protect,
  adminOnly,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "payment_page_image", maxCount: 1 },
  ]),
  createPaymentMethod,
);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   put:
 *     summary: Update payment method (Admin only)
 *     tags: [Payment Methods]
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
 *               name: { type: string }
 *               description: { type: string }
 *               method_image: { type: string, format: binary }
 *               payment_page_image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Payment method updated
 *       403:
 *         description: Admin access required
 */
router.put(
  "/:id",
  protect,
  adminOnly,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "payment_page_image", maxCount: 1 },
  ]),
  updatePaymentMethod,
);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   delete:
 *     summary: Delete payment method (Admin only)
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment method deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", protect, adminOnly, deletePaymentMethod);

/**
 * @swagger
 * /api/payment-methods/{id}/status:
 *   patch:
 *     summary: Toggle payment method status (Admin only)
 *     tags: [Payment Methods]
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
router.patch("/:id/status", protect, adminOnly, togglePaymentMethodStatus);

export default router;
