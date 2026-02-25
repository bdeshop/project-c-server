import express from "express";
import {
  dashboardLogin,
  dashboardSignup,
} from "../controllers/dashboardAuthController";
import {
  loginValidation,
  dashboardSignupValidation,
} from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /api/users/dashboard/login:
 *   post:
 *     summary: Dashboard user login
 *     tags: [Dashboard Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: No dashboard access
 */
router.post("/login", loginValidation, dashboardLogin);

/**
 * @swagger
 * /api/users/dashboard/signup:
 *   post:
 *     summary: Dashboard user signup
 *     tags: [Dashboard Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, user] }
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post("/signup", dashboardSignupValidation, dashboardSignup);

export default router;
