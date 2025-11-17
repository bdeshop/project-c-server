import express from "express";
import {
  getAdminStats,
  getUserStats,
  getRecentActivityLog,
  getTransactionChartData,
  getUserGrowthChart,
  getFinancialChartData,
  getReferralChartData,
} from "../controllers/statsController";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

// @route   GET /api/stats/admin
// @desc    Get comprehensive admin dashboard statistics
// @access  Private (Admin only)
router.get("/admin", protect, adminOnly, getAdminStats);

// @route   GET /api/stats/user
// @desc    Get user dashboard statistics
// @access  Private (User)
router.get("/user", protect, getUserStats);

// ============================================================================
// CHART DATA ROUTES
// ============================================================================

// @route   GET /api/stats/activity-log
// @desc    Get recent activity log (admin sees all, user sees own)
// @access  Private
router.get("/activity-log", protect, getRecentActivityLog);

// @route   GET /api/stats/charts/transactions
// @desc    Get transaction chart data (line chart + pie charts)
// @access  Private
router.get("/charts/transactions", protect, getTransactionChartData);

// @route   GET /api/stats/charts/user-growth
// @desc    Get user growth chart data
// @access  Private (Admin only)
router.get("/charts/user-growth", protect, adminOnly, getUserGrowthChart);

// @route   GET /api/stats/charts/financial
// @desc    Get financial chart data
// @access  Private (Admin only)
router.get("/charts/financial", protect, adminOnly, getFinancialChartData);

// @route   GET /api/stats/charts/referrals
// @desc    Get referral chart data
// @access  Private (Admin only)
router.get("/charts/referrals", protect, adminOnly, getReferralChartData);

export default router;
