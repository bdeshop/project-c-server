import express from 'express';
const router = express.Router();
import { 
  createTopWinner,
  getAllTopWinners,
  getLiveTopWinners,
  getTopWinnersByCategory,
  updateTopWinner,
  deleteTopWinner
} from '../controllers/topWinnerController';

// Create a new top winner
router.post('/', createTopWinner);

// Get all top winners with optional filtering
router.get('/', getAllTopWinners);

// Get live top winners
router.get('/live', getLiveTopWinners);

// Get top winners by category
router.get('/category/:category', getTopWinnersByCategory);

// Update a top winner
router.put('/:id', updateTopWinner);

// Delete a top winner
router.delete('/:id', deleteTopWinner);

export default router;