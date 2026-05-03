import express from "express";
import {
  distributePayout,
  getPayoutHistory,
  getPayoutSettings,
  updatePayoutSettings,
  getPayoutDistributionHistory,
  getPayoutDistributionDetail,
} from "../controllers/payoutController";
import {
  createPayoutRequest,
  getPayoutRequests,
  approvePayoutRequest,
  rejectPayoutRequest,
  getAffiliatePayoutRequests,
} from "../controllers/payoutRequestController";
import {
  protect,
  adminOnly,
} from "../middleware/auth";

const router = express.Router();

// Affiliate routes
router.post("/request", protect, createPayoutRequest);
router.get("/my-requests", protect, getAffiliatePayoutRequests);
router.get("/history", protect, getPayoutHistory);

// Admin routes
router.use(protect, adminOnly);

router.post("/distribute", distributePayout);
router.get("/requests", getPayoutRequests);
router.patch("/requests/:id/approve", approvePayoutRequest);
router.patch("/requests/:id/reject", rejectPayoutRequest);
router.get("/settings", getPayoutSettings);
router.put("/settings", updatePayoutSettings);
router.get("/distribution-history", getPayoutDistributionHistory);
router.get("/distribution-history/:id", getPayoutDistributionDetail);

export default router;
