import express from "express";
const router = express.Router();
import {
  createUpcomingMatch,
  getAllUpcomingMatches,
  getUpcomingMatchesByCategory,
  getLiveMatches,
  updateUpcomingMatch,
  deleteUpcomingMatch,
} from "../controllers/upcomingMatchController";

/**
 * @swagger
 * /api/upcoming-matches:
 *   post:
 *     summary: Create a new upcoming match
 *     tags: [Upcoming Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               startTime: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Match created
 */
router.post("/", createUpcomingMatch);

/**
 * @swagger
 * /api/upcoming-matches:
 *   get:
 *     summary: Get all upcoming matches
 *     tags: [Upcoming Matches]
 *     responses:
 *       200:
 *         description: List of upcoming matches
 */
router.get("/", getAllUpcomingMatches);

/**
 * @swagger
 * /api/upcoming-matches/category/{category}:
 *   get:
 *     summary: Get upcoming matches by category
 *     tags: [Upcoming Matches]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matches for category
 */
router.get("/category/:category", getUpcomingMatchesByCategory);

/**
 * @swagger
 * /api/upcoming-matches/live:
 *   get:
 *     summary: Get live matches
 *     tags: [Upcoming Matches]
 *     responses:
 *       200:
 *         description: Live matches
 */
router.get("/live", getLiveMatches);

/**
 * @swagger
 * /api/upcoming-matches/{id}:
 *   put:
 *     summary: Update upcoming match
 *     tags: [Upcoming Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Match updated
 */
router.put("/:id", updateUpcomingMatch);

/**
 * @swagger
 * /api/upcoming-matches/{id}:
 *   delete:
 *     summary: Delete upcoming match
 *     tags: [Upcoming Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Match deleted
 */
router.delete("/:id", deleteUpcomingMatch);

export default router;
