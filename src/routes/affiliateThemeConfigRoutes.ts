import express from "express";
import {
  getAffiliateThemeConfig,
  updateAffiliateThemeConfig,
  uploadAffiliateLogo,
  uploadAffiliateFavicon,
} from "../controllers/affiliateThemeConfigController";
import { protect, adminOnly } from "../middleware/auth";
import upload from "../middleware/multer";

const router = express.Router();

router.get("/", getAffiliateThemeConfig);

// Admin routes
router.use(protect, adminOnly);

router.put("/", updateAffiliateThemeConfig);
router.post("/upload-logo", upload.single("file"), uploadAffiliateLogo);
router.post("/upload-favicon", upload.single("file"), uploadAffiliateFavicon);

export default router;
