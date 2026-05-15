import express from "express";
import {
  registerAffiliate,
  loginAffiliate,
} from "../controllers/affiliateAuthController";
import { getCurrentUser } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @desc    Register a new affiliate
 * @route   POST /api/frontend/auth/register/affiliate
 */
router.post("/register/affiliate", registerAffiliate);

/**
 * @desc    Affiliate login
 * @route   POST /api/frontend/auth/login/affiliate
 */
router.post("/login/affiliate", loginAffiliate);

/**
 * @desc    Get current logged-in user
 * @route   GET /api/frontend/auth/me
 * @access  Private
 */
router.get("/me", protect, getCurrentUser);

export default router;
