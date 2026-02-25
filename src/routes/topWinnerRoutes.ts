import express from "express";
const router = express.Router();
import {
  createTopWinner,
  getAllTopWinners,
  getLiveTopWinners,
  getTopWinnersByCategory,
  updateTopWinner,
  deleteTopWinner,
} from "../controllers/topWinnerController";

/**
 * @swagger
 * /api/top-winners:
 *   post:
 *     summary: Create a new top winner
 *     tags: [Top Winners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               amount: { type: number }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Top winner created
 */
router.post("/", createTopWinner);

/**
 * @swagger
 * /api/top-winners:
 *   get:
 *     summary: Get all top winners
 *     tags: [Top Winners]
 *     responses:
 *       200:
 *         description: List of top winners
 */
router.get("/", getAllTopWinners);

/**
 * @swagger
 * /api/top-winners/live:
 *   get:
 *     summary: Get live top winners
 *     tags: [Top Winners]
 *     responses:
 *       200:
 *         description: Live top winners
 */
router.get("/live", getLiveTopWinners);

/**
 * @swagger
 * /api/top-winners/category/{category}:
 *   get:
 *     summary: Get top winners by category
 *     tags: [Top Winners]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Top winners for category
 */
router.get("/category/:category", getTopWinnersByCategory);

/**
 * @swagger
 * /api/top-winners/{id}:
 *   put:
 *     summary: Update top winner
 *     tags: [Top Winners]
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
 *         description: Top winner updated
 */
router.put("/:id", updateTopWinner);

/**
 * @swagger
 * /api/top-winners/{id}:
 *   delete:
 *     summary: Delete top winner
 *     tags: [Top Winners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Top winner deleted
 */
router.delete("/:id", deleteTopWinner);

export default router;
