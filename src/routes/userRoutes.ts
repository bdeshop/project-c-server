import express from "express";
import {
  signup,
  login,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  updateProfileWithImage,
  getUserBalance,
  updateUserBalance,
} from "../controllers/userController";
import {
  signupValidation,
  loginValidation,
  updateUserValidation,
  changePasswordValidation,
} from "../middleware/validation";
import { protect, adminOnly } from "../middleware/auth";
import { uploadProfileImage } from "../config/cloudinary";

import express from "express";
import {
  signup,
  login,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  updateProfileWithImage,
  getUserBalance,
  updateUserBalance,
} from "../controllers/userController";
import {
  signupValidation,
  loginValidation,
  updateUserValidation,
  changePasswordValidation,
} from "../middleware/validation";
import { protect, adminOnly } from "../middleware/auth";
import { uploadProfileImage } from "../config/cloudinary";

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               country: { type: string }
 *               currency: { type: string }
 *               phoneNumber: { type: string }
 *               player_id: { type: string }
 *               promoCode: { type: string }
 *               bonusSelection: { type: string }
 *               birthday: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/signup", signupValidation, signup);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
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
 */
router.post("/login", loginValidation, login);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, getProfile);

/**
 * @swagger
 * /api/users/profile/{id}:
 *   put:
 *     summary: Update user profile with image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/profile/:id",
  protect,
  uploadProfileImage.single("profileImage"),
  updateProfileWithImage,
);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword,
);

/**
 * @swagger
 * /api/users/balance:
 *   get:
 *     summary: Get user balance
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User balance retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/balance", protect, getUserBalance);

/**
 * @swagger
 * /api/users/balance/{id}:
 *   put:
 *     summary: Update user balance (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [deposit, withdrawal] }
 *     responses:
 *       200:
 *         description: Balance updated
 *       403:
 *         description: Admin access required
 */
router.put("/balance/:id", protect, adminOnly, updateUserBalance);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get("/", protect, adminOnly, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:id", protect, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               country: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Admin access required
 */
router.put("/:id", protect, adminOnly, updateUserValidation, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
