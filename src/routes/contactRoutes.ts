import express from "express";
import {
  getContactSettings,
  updateContactSettings,
} from "../controllers/contactController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Public route - Get contact settings
router.get("/", getContactSettings);

// Admin only route - Update contact settings
router.put("/", protect, updateContactSettings);

export default router;
