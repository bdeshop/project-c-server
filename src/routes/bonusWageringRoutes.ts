import express from "express";
import {
  getMyWageringProgress,
  canUserWithdraw,
  getAllWageringRecords,
} from "../controllers/bonusWageringController";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/bonus-wagering/my-progress:
 *   get:
 *     summary: Get user's wagering progress
 *     tags: [Bonus Wagering]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, expired]
 *         description: Filter by wagering status
 *     responses:
 *       200:
 *         description: Wagering progress retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-progress", protect, getMyWageringProgress);

/**
 * @swagger
 * /api/bonus-wagering/can-withdraw:
 *   get:
 *     summary: Check if user can withdraw (no active wagering requirements)
 *     tags: [Bonus Wagering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Withdrawal eligibility checked successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/can-withdraw", protect, canUserWithdraw);

/**
 * @swagger
 * /api/bonus-wagering/admin/all:
 *   get:
 *     summary: Get all wagering records (Admin)
 *     tags: [Bonus Wagering]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, expired]
 *         description: Filter by wagering status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: All wagering records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllWageringRecords,
);

export default router;
