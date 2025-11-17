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

// ============================================================================
// TRANSACTION ROUTES
// ============================================================================

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private (Admin only)
router.get("/stats", protect, adminOnly, getTransactionStats);

// @route   GET /api/transactions/provider/:provider
// @desc    Get transactions by wallet provider
// @access  Private (Admin only)
router.get(
  "/provider/:provider",
  protect,
  adminOnly,
  getTransactionsByProvider
);

// @route   GET /api/transactions
// @desc    Get all transactions (admin sees all, user sees own)
// @access  Private
router.get("/", protect, getTransactions);

// @route   GET /api/transactions/:id
// @desc    Get single transaction by ID (admin sees all, user sees own)
// @access  Private
router.get("/:id", protect, getTransaction);

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Public (Anyone can create transactions)
router.post("/", createTransaction);

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private (Admin only)
router.put("/:id", protect, adminOnly, updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private (Admin only)
router.delete("/:id", protect, adminOnly, deleteTransaction);

// @route   PATCH /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private (Admin only)
router.patch("/:id/status", protect, adminOnly, updateTransactionStatus);

export default router;
