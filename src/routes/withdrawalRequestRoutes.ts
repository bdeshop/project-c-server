import express from "express";
import {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  cancelWithdrawalRequest,
} from "../controllers/withdrawalRequestController";
import { protect } from "../middleware/auth";

import express from "express";
import {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  cancelWithdrawalRequest,
} from "../controllers/withdrawalRequestController";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/withdrawal-requests:
 *   post:
 *     summary: Create withdrawal request
 *     tags: [Withdrawal Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               method: { type: string }
 *     responses:
 *       201:
 *         description: Withdrawal request created
 */
router.post("/", protect, createWithdrawalRequest);

/**
 * @swagger
 * /api/withdrawal-requests:
 *   get:
 *     summary: Get user withdrawal requests
 *     tags: [Withdrawal Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User withdrawal requests
 */
router.get("/", protect, getUserWithdrawalRequests);

/**
 * @swagger
 * /api/withdrawal-requests/{id}/cancel:
 *   patch:
 *     summary: Cancel withdrawal request
 *     tags: [Withdrawal Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Withdrawal request cancelled
 */
router.patch("/:id/cancel", protect, cancelWithdrawalRequest);

/**
 * @swagger
 * /api/withdrawal-requests/all:
 *   get:
 *     summary: Get all withdrawal requests
 *     tags: [Withdrawal Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All withdrawal requests
 */
router.get("/all", protect, getAllWithdrawalRequests);

export default router;
