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

// @route   PUT /api/users/profile
// @desc    Update user profile with image upload
// @access  Private
router.put(
  "/profile/:id",
  protect,
  uploadProfileImage.single("profileImage"),
  updateProfileWithImage
);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword
);

// @route   GET /api/users/balance
// @desc    Get logged-in user's balance
// @access  Private
router.get("/balance", protect, getUserBalance);

// @route   PUT /api/users/balance/:id
// @desc    Update user balance (deposit/withdraw) - Admin only
// @access  Private (Admin only)
router.put("/balance/:id", protect, adminOnly, updateUserBalance);

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private (Admin only)
router.get("/", protect, adminOnly, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", protect, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin only)
router.put("/:id", protect, adminOnly, updateUserValidation, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
