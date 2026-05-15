import express from "express";
import {
  getReferralDashboard,
  getMyReferrals,
  claimRewards,
  getRewardHistory,
  getRedeemHistory,
  generateDailyReward,
  getRewardConfig,
  updateRewardConfig,
  getReferralStatistics,
  generateReferralQRCode,
  getReferredUsersDetails,
  getAllReferredUsersList,
} from "../controllers/referralRewardController";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Referrals & Rewards
 *   description: Referral and reward management
 */

/**
 * @swagger
 * /api/referrals/dashboard:
 *   get:
 *     summary: Get referral and rewards dashboard (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/dashboard", protect, getReferralDashboard);

/**
 * @swagger
 * /api/referrals/my-referrals:
 *   get:
 *     summary: Get list of users referred by me (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of referred users
 *       401:
 *         description: Unauthorized
 */
router.get("/my-referrals", protect, getMyReferrals);

/**
 * @swagger
 * /api/referrals/generate-qr:
 *   get:
 *     summary: Generate QR code for referral link (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code generated successfully
 */
router.get("/generate-qr", protect, generateReferralQRCode);

/**
 * @swagger
 * /api/referrals/statistics:
 *   get:
 *     summary: Get referral statistics (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral statistics retrieved successfully
 */
router.get("/statistics", protect, getReferralStatistics);

/**
 * @swagger
 * /api/referrals/referred-users-details:
 *   get:
 *     summary: Get referred users details (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referred users details retrieved successfully
 */
router.get("/referred-users-details", protect, getReferredUsersDetails);

/**
 * @swagger
 * /api/referrals/all-referred-users:
 *   get:
 *     summary: Get all referred users with pagination (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: All referred users retrieved successfully
 */
router.get("/all-referred-users", protect, getAllReferredUsersList);

/**
 * @swagger
 * /api/referrals/claim-rewards:
 *   post:
 *     summary: Claim available rewards (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rewards claimed successfully
 *       400:
 *         description: No unclaimed rewards available
 */
router.post("/claim-rewards", protect, claimRewards);

/**
 * @swagger
 * /api/referrals/generate-daily-reward:
 *   post:
 *     summary: Generate daily reward (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Daily reward generated successfully
 *       400:
 *         description: Daily reward already generated for today
 */
router.post("/generate-daily-reward", protect, generateDailyReward);

/**
 * @swagger
 * /api/referrals/reward-history:
 *   get:
 *     summary: Get reward history (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Reward history retrieved successfully
 */
router.get("/reward-history", protect, getRewardHistory);

/**
 * @swagger
 * /api/referrals/redeem-history:
 *   get:
 *     summary: Get redeem history (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Redeem history retrieved successfully
 */
router.get("/redeem-history", protect, getRedeemHistory);

/**
 * @swagger
 * /api/referrals/reward-config:
 *   get:
 *     summary: Get reward configuration (Frontend User)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reward configuration retrieved successfully
 */
router.get("/reward-config", protect, getRewardConfig);

/**
 * @swagger
 * /api/referrals/reward-config:
 *   put:
 *     summary: Update reward configuration (Admin only)
 *     tags: [Referrals & Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyRewardAmount:
 *                 type: number
 *               referralBonusAmount:
 *                 type: number
 *               depositBonusPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reward configuration updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put("/reward-config", protect, adminOnly, updateRewardConfig);

export default router;
