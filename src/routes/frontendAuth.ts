import express from "express";
import {
  registerAffiliate,
  loginAffiliate,
} from "../controllers/affiliateAuthController";
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

export default router;
