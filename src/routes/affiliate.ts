import express from "express";
import {
  getAllAffiliates,
  getPendingAffiliates,
  getAffiliateById,
  activateAffiliate,
  updateAffiliate,
  deleteAffiliate,
  toggleAffiliateStatus,
  getAffiliateStats,
} from "../controllers/affiliateController";
import { getAffiliateDashboard } from "../controllers/affiliateDashboardController";
import {
  getAffiliateProfile,
  updateAffiliateProfile,
  updateAffiliatePayment,
  changeAffiliatePassword,
} from "../controllers/affiliateProfileController";
import {
  getAffiliateReferralDashboard,
  generateAffiliateCode,
  createAffiliateLink,
  trackAffiliateClick,
} from "../controllers/affiliateReferralController";
import { getPayoutHistory } from "../controllers/payoutController";
import { getAffiliateEarnings } from "../controllers/affiliateEarningsController";
import {
  getActiveAffiliateWithdrawMethods,
  getActiveAffiliateWithdrawMethod,
  createAffiliateWithdrawMethod,
  getAllAffiliateWithdrawMethods,
  getAffiliateWithdrawMethod,
  updateAffiliateWithdrawMethod,
  deleteAffiliateWithdrawMethod,
} from "../controllers/affiliateWithdrawMethodController";
import upload from "../middleware/multer";
import {
  protect,
  adminOnly,
} from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/referral/track-click", trackAffiliateClick);
router.get("/withdraw-methods/active", getActiveAffiliateWithdrawMethods);
router.get("/withdraw-methods/active/:id", getActiveAffiliateWithdrawMethod);

// Protected routes (Affiliate/User)
router.get("/dashboard", protect, getAffiliateDashboard);
router.get("/user/profile", protect, getAffiliateProfile);
router.put("/user/profile", protect, updateAffiliateProfile);
router.put("/user/payment", protect, updateAffiliatePayment);
router.put("/user/password", protect, changeAffiliatePassword);
router.get("/earnings", protect, getAffiliateEarnings);
router.get("/payout/history", protect, getPayoutHistory);
router.get("/referral/dashboard", protect, getAffiliateReferralDashboard);
router.post("/referral/generate-code", protect, generateAffiliateCode);
router.post("/referral/links", protect, createAffiliateLink);

// Admin only routes
router.use(protect, adminOnly);

router.get("/stats", getAffiliateStats);
router.get("/users", getAllAffiliates);
router.get("/users/pending", getPendingAffiliates);
router.get("/users/:id", getAffiliateById);
router.post("/users/:id/activate", activateAffiliate);
router.put("/users/:id", updateAffiliate);
router.delete("/users/:id", deleteAffiliate);
router.patch("/users/:id/status", toggleAffiliateStatus);

// Withdraw Methods Admin
router.get("/withdraw-methods", getAllAffiliateWithdrawMethods);
router.post(
  "/withdraw-methods",
  upload.fields([
    { name: "methodImage", maxCount: 1 },
    { name: "withdrawPageImage", maxCount: 1 },
  ]),
  createAffiliateWithdrawMethod,
);
router.get("/withdraw-methods/:id", getAffiliateWithdrawMethod);
router.put(
  "/withdraw-methods/:id",
  upload.fields([
    { name: "methodImage", maxCount: 1 },
    { name: "withdrawPageImage", maxCount: 1 },
  ]),
  updateAffiliateWithdrawMethod,
);
router.delete("/withdraw-methods/:id", deleteAffiliateWithdrawMethod);

export default router;
