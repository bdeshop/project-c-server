import express from "express";
import {
  getWithdrawalMethods,
  getWithdrawalMethod,
  createWithdrawalMethod,
  updateWithdrawalMethod,
  deleteWithdrawalMethod,
  toggleWithdrawalMethodStatus,
} from "../controllers/withdrawalMethodController";
import { protect } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

import express from "express";
import {
  getWithdrawalMethods,
  getWithdrawalMethod,
  createWithdrawalMethod,
  updateWithdrawalMethod,
  deleteWithdrawalMethod,
  toggleWithdrawalMethodStatus,
} from "../controllers/withdrawalMethodController";
import { protect } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

const router = express.Router();

/**
 * @swagger
 * /api/withdrawal-methods:
 *   get:
 *     summary: Get all withdrawal methods
 *     tags: [Withdrawal Methods]
 *     responses:
 *       200:
 *         description: List of withdrawal methods
 */
router.get("/", getWithdrawalMethods);

/**
 * @swagger
 * /api/withdrawal-methods/{id}:
 *   get:
 *     summary: Get withdrawal method by ID
 *     tags: [Withdrawal Methods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Withdrawal method details
 */
router.get("/:id", getWithdrawalMethod);

/**
 * @swagger
 * /api/withdrawal-methods:
 *   post:
 *     summary: Create withdrawal method (Admin only)
 *     tags: [Withdrawal Methods]
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
 *               method_image: { type: string, format: binary }
 *               withdrawal_page_image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Withdrawal method created
 */
router.post(
  "/",
  protect,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "withdrawal_page_image", maxCount: 1 },
  ]),
  createWithdrawalMethod,
);

/**
 * @swagger
 * /api/withdrawal-methods/{id}:
 *   put:
 *     summary: Update withdrawal method (Admin only)
 *     tags: [Withdrawal Methods]
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
 *     responses:
 *       200:
 *         description: Withdrawal method updated
 */
router.put(
  "/:id",
  protect,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "withdrawal_page_image", maxCount: 1 },
  ]),
  updateWithdrawalMethod,
);

/**
 * @swagger
 * /api/withdrawal-methods/{id}:
 *   delete:
 *     summary: Delete withdrawal method (Admin only)
 *     tags: [Withdrawal Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Withdrawal method deleted
 */
router.delete("/:id", protect, deleteWithdrawalMethod);

/**
 * @swagger
 * /api/withdrawal-methods/{id}/status:
 *   patch:
 *     summary: Toggle withdrawal method status (Admin only)
 *     tags: [Withdrawal Methods]
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
 */
router.patch("/:id/status", protect, toggleWithdrawalMethodStatus);

export default router;
