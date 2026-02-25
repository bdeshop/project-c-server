import express from "express";
import {
  getContactSettings,
  updateContactSettings,
} from "../controllers/contactController";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get contact settings
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Contact settings
 */
router.get("/", getContactSettings);

/**
 * @swagger
 * /api/contact:
 *   put:
 *     summary: Update contact settings
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       200:
 *         description: Contact settings updated
 */
router.put("/", protect, updateContactSettings);

export default router;
