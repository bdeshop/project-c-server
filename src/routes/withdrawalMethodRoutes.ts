import express from "express";
import {
  getWithdrawalMethods,
  getWithdrawalMethod,
  createWithdrawalMethod,
  updateWithdrawalMethod,
  deleteWithdrawalMethod,
  toggleWithdrawalMethodStatus,
} from "../controllers/withdrawalMethodController";
import { protect } from "../middleware/auth";
import { uploadPaymentMethodImages } from "../config/cloudinary";

const router = express.Router();

// Public routes
router.get("/", getWithdrawalMethods);
router.get("/:id", getWithdrawalMethod);

// Admin only routes
router.post(
  "/",
  protect,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "withdrawal_page_image", maxCount: 1 },
  ]),
  createWithdrawalMethod
);

router.put(
  "/:id",
  protect,
  uploadPaymentMethodImages.fields([
    { name: "method_image", maxCount: 1 },
    { name: "withdrawal_page_image", maxCount: 1 },
  ]),
  updateWithdrawalMethod
);

router.delete("/:id", protect, deleteWithdrawalMethod);
router.patch("/:id/status", protect, toggleWithdrawalMethodStatus);

export default router;
