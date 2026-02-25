import express from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  getTransactionStats,
  getTransactionsByProvider,
} from "../controllers/transactionController";
import { protect, adminOnly } from "../middleware/auth";

import express from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  getTransactionStats,
  getTransactionsByProvider,
} from "../controllers/transactionController";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     summary: Get transaction statistics (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction statistics
 *       403:
 *         description: Admin access required
 */
router.get("/stats", protect, adminOnly, getTransactionStats);

/**
 * @swagger
 * /api/transactions/provider/{provider}:
 *   get:
 *     summary: Get transactions by wallet provider (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transactions for provider
 *       403:
 *         description: Admin access required
 */
router.get(
  "/provider/:provider",
  protect,
  adminOnly,
  getTransactionsByProvider,
);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", protect, getTransaction);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               amount: { type: number }
 *               type: { type: string, enum: [deposit, withdrawal, bet, win] }
 *               provider: { type: string }
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post("/", createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction (Admin only)
 *     tags: [Transactions]
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
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Admin access required
 */
router.put("/:id", protect, adminOnly, updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", protect, adminOnly, deleteTransaction);

/**
 * @swagger
 * /api/transactions/{id}/status:
 *   patch:
 *     summary: Update transaction status (Admin only)
 *     tags: [Transactions]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, completed, failed] }
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Admin access required
 */
router.patch("/:id/status", protect, adminOnly, updateTransactionStatus);

export default router;
