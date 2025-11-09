import express from "express";
import {
  signup,
  login,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import {
  signupValidation,
  loginValidation,
  updateUserValidation,
} from "../middleware/validation";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   POST /api/users/signup
// @desc    Register a new user with betting platform fields
// @access  Public
// @body    { name?, email, password, country?, currency?, phoneNumber?, player_id, promoCode?, bonusSelection?, birthday? }
router.post("/signup", signupValidation, signup);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, login);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, getProfile);

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private (Admin recommended)
router.get("/", protect, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", protect, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put("/:id", protect, updateUserValidation, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only recommended)
router.delete("/:id", protect, deleteUser);

export default router;
