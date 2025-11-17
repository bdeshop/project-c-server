import express from "express";
import {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  cancelWithdrawalRequest,
} from "../controllers/withdrawalRequestController";
import { protect } from "../middleware/auth";

const router = express.Router();

// User routes
router.post("/", protect, createWithdrawalRequest);
router.get("/", protect, getUserWithdrawalRequests);
router.patch("/:id/cancel", protect, cancelWithdrawalRequest);

// Get all withdrawal requests (admin sees all, user sees own)
router.get("/all", protect, getAllWithdrawalRequests);

export default router;
