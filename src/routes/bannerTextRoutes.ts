import express from 'express';
const router = express.Router();
import { 
  getBannerText,
  updateBannerText
} from '../controllers/bannerTextController';
import { protect, adminOnly } from '../middleware/auth';

// Get banner text
router.get('/', getBannerText);

// Update banner text (Admin only)
router.put('/', protect, adminOnly, updateBannerText);

export default router;