import express from "express";
import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  testCloudinaryConnection,
} from "../controllers/paymentMethodController";
import { protect, adminOnly } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

const router = express.Router();

// ============================================================================
// PAYMENT METHOD ROUTES
// ============================================================================

// @route   GET /api/payment-methods/test-cloudinary
// @desc    Test Cloudinary connection
// @access  Private (Admin only)
router.get("/test-cloudinary", protect, adminOnly, testCloudinaryConnection);

// @route   GET /api/payment-methods
// @desc    Get all payment methods
// @access  Public
router.get("/", getPaymentMethods);

// @route   GET /api/payment-methods/:id
// @desc    Get single payment method by ID
// @access  Public
router.get("/:id", getPaymentMethod);

// @route   POST /api/payment-methods
// @desc    Create new payment method (Add Deposit Method)
// @access  Private (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "payment_page_image", maxCount: 1 },
  ]),
  createPaymentMethod
);

// @route   PUT /api/payment-methods/:id
// @desc    Update payment method
// @access  Private (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "payment_page_image", maxCount: 1 },
  ]),
  updatePaymentMethod
);

// @route   DELETE /api/payment-methods/:id
// @desc    Delete payment method
// @access  Private (Admin only)
router.delete("/:id", protect, adminOnly, deletePaymentMethod);

// @route   PATCH /api/payment-methods/:id/status
// @desc    Toggle payment method status (Active/Inactive)
// @access  Private (Admin only)
router.patch("/:id/status", protect, adminOnly, togglePaymentMethodStatus);

export default router;
