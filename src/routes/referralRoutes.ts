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

// Public routes
router.route("/settings").get(getReferralSettings);

// Validate referral code (public route for signup form)
router.route("/validate-code/:code").get(validateReferralCode);

// Test referral code (public route for testing)
router.route("/test-code/:code").get(testReferralCode);

// Test login with referral settings logic (public route for testing)
router.route("/test-login").post(testLoginWithReferralSettings);

// Comprehensive admin referral management
router
  .route("/admin/system-overview")
  .get(protect, adminOnly, getReferralSystemOverview);
router
  .route("/admin/user-settings/:userId")
  .put(protect, adminOnly, setComprehensiveUserReferralSettings);
router
  .route("/admin/impact-analysis/:userId")
  .get(protect, adminOnly, getReferralImpactAnalysis);

// Private routes (user)
router.route("/info").get(protect, getReferralInfo);

router.route("/transactions").get(protect, getReferralTransactions);

router.route("/generate-code").post(protect, generateReferralCodeForUser);

router.route("/stats").get(protect, getReferralStats);

// Withdrawal route
router.route("/withdraw").post(protect, withdrawReferralEarnings);

// Admin routes
router.route("/settings").put(protect, adminOnly, updateReferralSettings);

// Get detailed admin referral settings
router
  .route("/admin/settings")
  .get(protect, adminOnly, getAdminReferralSettings);

// Individual user referral settings
router
  .route("/user-settings/:userId")
  .get(protect, adminOnly, getUserReferralSettings);
router
  .route("/user-settings/:userId")
  .put(protect, adminOnly, updateUserReferralSettings);

// Get all users with their referral settings
router
  .route("/all-users-settings")
  .get(protect, adminOnly, getAllUsersReferralSettings);

// Get referral analytics for admin dashboard
router.route("/analytics").get(protect, adminOnly, getReferralAnalytics);

// Debug referral relationships
router.route("/debug").get(protect, adminOnly, debugReferralRelationships);

// Debug specific referral code
router.route("/debug/:code").get(protect, adminOnly, debugSpecificReferralCode);

// Debug all users and their referral data
router.route("/debug-all-users").get(protect, adminOnly, debugAllUsers);

// Get users who used a specific referral code
router.route("/users-by-code/:code").get(protect, getUsersByReferralCode);

// Get all referral codes with their referred users
router
  .route("/all-codes-with-users")
  .get(protect, adminOnly, getAllReferralCodesWithUsers);

// Get referral relationship for a specific user
router
  .route("/user-relationship/:email")
  .get(protect, adminOnly, getUserReferralRelationship);

// Fix JAM657 referral case
router.route("/fix-jam657").post(protect, adminOnly, fixJAM657Referral);

// Fix JKDII8 referral case
router.route("/fix-jkdii8").post(protect, adminOnly, fixJKDII8Referral);

// Fix specific referral case (KARX5D and jamal@gmail.com)
router.route("/fix-specific").post(protect, adminOnly, fixSpecificReferral);

// Fix referral relationships (one-time fix)
router
  .route("/fix-relationships")
  .post(protect, adminOnly, fixReferralRelationships);

// Get all referral data for admin dashboard
router.route("/admin/all").get(protect, adminOnly, getAllReferralData);

// Transaction status update (admin only)
router
  .route("/transactions/:id")
  .put(protect, adminOnly, updateReferralTransactionStatus);

export default router;
