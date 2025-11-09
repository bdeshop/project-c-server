import express from 'express';
const router = express.Router();
import { 
  getPromoSection,
  updatePromoSection,
  togglePromoSection
} from '../controllers/promoSectionController';
import { protect, adminOnly, optionalProtect } from '../middleware/auth';

// Get promo section (Public access with optional auth for admin)
router.get('/', optionalProtect, getPromoSection);

// Update promo section (Admin only)
router.put('/', protect, adminOnly, updatePromoSection);

// Toggle promo section active status (Admin only)
router.patch('/toggle', protect, adminOnly, togglePromoSection);

export default router;