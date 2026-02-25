import express from "express";
import {
  getReferralSettings,
  updateReferralSettings,
  getReferralInfo,
  getReferralTransactions,
  generateReferralCodeForUser,
  updateReferralTransactionStatus,
  withdrawReferralEarnings,
  getAllReferralData,
  validateReferralCode,
  getReferralStats,
  getReferralAnalytics,
  fixReferralRelationships,
  debugReferralRelationships,
  fixSpecificReferral,
  fixJAM657Referral,
  fixJKDII8Referral,
  debugSpecificReferralCode,
  getUsersByReferralCode,
  getAllReferralCodesWithUsers,
  getUserReferralRelationship,
  debugAllUsers,
  testReferralCode,
  getAdminReferralSettings,
  getUserReferralSettings,
  updateUserReferralSettings,
  getAllUsersReferralSettings,
  testLoginWithReferralSettings,
  getReferralSystemOverview,
  setComprehensiveUserReferralSettings,
  getReferralImpactAnalysis,
} from "../controllers/referralController";
import { protect, adminOnly } from "../middleware/auth";

import express from "express";
import {
  getReferralSettings,
  updateReferralSettings,
  getReferralInfo,
  getReferralTransactions,
  generateReferralCodeForUser,
  updateReferralTransactionStatus,
  withdrawReferralEarnings,
  getAllReferralData,
  validateReferralCode,
  getReferralStats,
  getReferralAnalytics,
  fixReferralRelationships,
  debugReferralRelationships,
  fixSpecificReferral,
  fixJAM657Referral,
  fixJKDII8Referral,
  debugSpecificReferralCode,
  getUsersByReferralCode,
  getAllReferralCodesWithUsers,
  getUserReferralRelationship,
  debugAllUsers,
  testReferralCode,
  getAdminReferralSettings,
  getUserReferralSettings,
  updateUserReferralSettings,
  getAllUsersReferralSettings,
  testLoginWithReferralSettings,
  getReferralSystemOverview,
  setComprehensiveUserReferralSettings,
  getReferralImpactAnalysis,
} from "../controllers/referralController";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/referral/settings:
 *   get:
 *     summary: Get referral settings
 *     tags: [Referral]
 *     responses:
 *       200:
 *         description: Referral settings
 */
router.route("/settings").get(getReferralSettings);

/**
 * @swagger
 * /api/referral/validate-code/{code}:
 *   get:
 *     summary: Validate referral code
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Code validation result
 */
router.route("/validate-code/:code").get(validateReferralCode);

/**
 * @swagger
 * /api/referral/test-code/{code}:
 *   get:
 *     summary: Test referral code
 *     tags: [Referral]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Code test result
 */
router.route("/test-code/:code").get(testReferralCode);

/**
 * @swagger
 * /api/referral/test-login:
 *   post:
 *     summary: Test login with referral settings
 *     tags: [Referral]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Login test result
 */
router.route("/test-login").post(testLoginWithReferralSettings);

/**
 * @swagger
 * /api/referral/admin/system-overview:
 *   get:
 *     summary: Get referral system overview (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System overview
 */
router
  .route("/admin/system-overview")
  .get(protect, adminOnly, getReferralSystemOverview);

/**
 * @swagger
 * /api/referral/admin/user-settings/{userId}:
 *   put:
 *     summary: Set comprehensive user referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Settings updated
 */
router
  .route("/admin/user-settings/:userId")
  .put(protect, adminOnly, setComprehensiveUserReferralSettings);

/**
 * @swagger
 * /api/referral/admin/impact-analysis/{userId}:
 *   get:
 *     summary: Get referral impact analysis (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Impact analysis
 */
router
  .route("/admin/impact-analysis/:userId")
  .get(protect, adminOnly, getReferralImpactAnalysis);

/**
 * @swagger
 * /api/referral/info:
 *   get:
 *     summary: Get user referral info
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User referral info
 */
router.route("/info").get(protect, getReferralInfo);

/**
 * @swagger
 * /api/referral/transactions:
 *   get:
 *     summary: Get user referral transactions
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral transactions
 */
router.route("/transactions").get(protect, getReferralTransactions);

/**
 * @swagger
 * /api/referral/generate-code:
 *   post:
 *     summary: Generate referral code for user
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Referral code generated
 */
router.route("/generate-code").post(protect, generateReferralCodeForUser);

/**
 * @swagger
 * /api/referral/stats:
 *   get:
 *     summary: Get referral statistics
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral statistics
 */
router.route("/stats").get(protect, getReferralStats);

/**
 * @swagger
 * /api/referral/withdraw:
 *   post:
 *     summary: Withdraw referral earnings
 *     tags: [Referral]
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
 *     responses:
 *       200:
 *         description: Withdrawal processed
 */
router.route("/withdraw").post(protect, withdrawReferralEarnings);

/**
 * @swagger
 * /api/referral/settings:
 *   put:
 *     summary: Update referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.route("/settings").put(protect, adminOnly, updateReferralSettings);

/**
 * @swagger
 * /api/referral/admin/settings:
 *   get:
 *     summary: Get admin referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin referral settings
 */
router
  .route("/admin/settings")
  .get(protect, adminOnly, getAdminReferralSettings);

/**
 * @swagger
 * /api/referral/user-settings/{userId}:
 *   get:
 *     summary: Get user referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User referral settings
 */
router
  .route("/user-settings/:userId")
  .get(protect, adminOnly, getUserReferralSettings);

/**
 * @swagger
 * /api/referral/user-settings/{userId}:
 *   put:
 *     summary: Update user referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Settings updated
 */
router
  .route("/user-settings/:userId")
  .put(protect, adminOnly, updateUserReferralSettings);

/**
 * @swagger
 * /api/referral/all-users-settings:
 *   get:
 *     summary: Get all users referral settings (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users referral settings
 */
router
  .route("/all-users-settings")
  .get(protect, adminOnly, getAllUsersReferralSettings);

/**
 * @swagger
 * /api/referral/analytics:
 *   get:
 *     summary: Get referral analytics (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral analytics
 */
router.route("/analytics").get(protect, adminOnly, getReferralAnalytics);

/**
 * @swagger
 * /api/referral/debug:
 *   get:
 *     summary: Debug referral relationships (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Debug information
 */
router.route("/debug").get(protect, adminOnly, debugReferralRelationships);

/**
 * @swagger
 * /api/referral/debug/{code}:
 *   get:
 *     summary: Debug specific referral code (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Debug information
 */
router.route("/debug/:code").get(protect, adminOnly, debugSpecificReferralCode);

/**
 * @swagger
 * /api/referral/debug-all-users:
 *   get:
 *     summary: Debug all users (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users debug info
 */
router.route("/debug-all-users").get(protect, adminOnly, debugAllUsers);

/**
 * @swagger
 * /api/referral/users-by-code/{code}:
 *   get:
 *     summary: Get users by referral code
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users for code
 */
router.route("/users-by-code/:code").get(protect, getUsersByReferralCode);

/**
 * @swagger
 * /api/referral/all-codes-with-users:
 *   get:
 *     summary: Get all referral codes with users (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All codes with users
 */
router
  .route("/all-codes-with-users")
  .get(protect, adminOnly, getAllReferralCodesWithUsers);

/**
 * @swagger
 * /api/referral/user-relationship/{email}:
 *   get:
 *     summary: Get user referral relationship (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User relationship
 */
router
  .route("/user-relationship/:email")
  .get(protect, adminOnly, getUserReferralRelationship);

/**
 * @swagger
 * /api/referral/fix-jam657:
 *   post:
 *     summary: Fix JAM657 referral (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixed
 */
router.route("/fix-jam657").post(protect, adminOnly, fixJAM657Referral);

/**
 * @swagger
 * /api/referral/fix-jkdii8:
 *   post:
 *     summary: Fix JKDII8 referral (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixed
 */
router.route("/fix-jkdii8").post(protect, adminOnly, fixJKDII8Referral);

/**
 * @swagger
 * /api/referral/fix-specific:
 *   post:
 *     summary: Fix specific referral (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixed
 */
router.route("/fix-specific").post(protect, adminOnly, fixSpecificReferral);

/**
 * @swagger
 * /api/referral/fix-relationships:
 *   post:
 *     summary: Fix referral relationships (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixed
 */
router
  .route("/fix-relationships")
  .post(protect, adminOnly, fixReferralRelationships);

/**
 * @swagger
 * /api/referral/admin/all:
 *   get:
 *     summary: Get all referral data (Admin only)
 *     tags: [Referral]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All referral data
 */
router.route("/admin/all").get(protect, adminOnly, getAllReferralData);

/**
 * @swagger
 * /api/referral/transactions/{id}:
 *   put:
 *     summary: Update referral transaction status (Admin only)
 *     tags: [Referral]
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
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */
router
  .route("/transactions/:id")
  .put(protect, adminOnly, updateReferralTransactionStatus);

export default router;
