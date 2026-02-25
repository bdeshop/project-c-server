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

/**
 * @swagger
 * /api/stats/admin:
 *   get:
 *     summary: Get admin dashboard statistics (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *       403:
 *         description: Admin access required
 */
router.get("/admin", protect, adminOnly, getAdminStats);

/**
 * @swagger
 * /api/stats/user:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get("/user", protect, getUserStats);

/**
 * @swagger
 * /api/stats/activity-log:
 *   get:
 *     summary: Get recent activity log
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity log
 */
router.get("/activity-log", protect, getRecentActivityLog);

/**
 * @swagger
 * /api/stats/charts/transactions:
 *   get:
 *     summary: Get transaction chart data
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction chart data
 */
router.get("/charts/transactions", protect, getTransactionChartData);

/**
 * @swagger
 * /api/stats/charts/user-growth:
 *   get:
 *     summary: Get user growth chart data (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User growth chart data
 *       403:
 *         description: Admin access required
 */
router.get("/charts/user-growth", protect, adminOnly, getUserGrowthChart);

/**
 * @swagger
 * /api/stats/charts/financial:
 *   get:
 *     summary: Get financial chart data (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial chart data
 *       403:
 *         description: Admin access required
 */
router.get("/charts/financial", protect, adminOnly, getFinancialChartData);

/**
 * @swagger
 * /api/stats/charts/referrals:
 *   get:
 *     summary: Get referral chart data (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral chart data
 *       403:
 *         description: Admin access required
 */
router.get("/charts/referrals", protect, adminOnly, getReferralChartData);

export default router;
