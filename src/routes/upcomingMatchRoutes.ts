import express from 'express';
const router = express.Router();
import { 
  createUpcomingMatch,
  getAllUpcomingMatches,
  getUpcomingMatchesByCategory,
  getLiveMatches,
  updateUpcomingMatch,
  deleteUpcomingMatch
} from '../controllers/upcomingMatchController';

// Create a new upcoming match
router.post('/', createUpcomingMatch);

// Get all upcoming matches with optional filtering
router.get('/', getAllUpcomingMatches);

// Get upcoming matches by category
router.get('/category/:category', getUpcomingMatchesByCategory);

// Get live matches
router.get('/live', getLiveMatches);

// Update an upcoming match
router.put('/:id', updateUpcomingMatch);

// Delete an upcoming match
router.delete('/:id', deleteUpcomingMatch);

export default router;