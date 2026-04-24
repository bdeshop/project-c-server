import express from "express";
import DepositBonus from "../models/DepositBonus";
import { protect, adminOnly } from "../middleware/auth";

const router = express.Router();

// Create a new deposit bonus (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      welcomeBonusName,
      minimumBonusBDT,
      bonusType,
      bonusCode,
      totalAmountBDT,
      percentageValue,
      minimumDepositBDT,
      wageringRequirement,
      validityPeriodDays,
      applicableTo,
      depositMethodId,
      startDate,
      endDate,
      status,
    } = req.body;

    // Validation
    if (!welcomeBonusName || !bonusCode) {
      return res.status(400).json({
        success: false,
        message: "welcomeBonusName and bonusCode are required",
      });
    }

    // Check if bonus code already exists
    const existingBonus = await DepositBonus.findOne({ bonusCode });
    if (existingBonus) {
      return res.status(400).json({
        success: false,
        message: "Bonus code already exists",
      });
    }

    const depositBonus = await DepositBonus.create({
      welcomeBonusName,
      minimumBonusBDT: minimumBonusBDT || 0,
      bonusType: bonusType || "Winnable",
      bonusCode,
      totalAmountBDT: totalAmountBDT || 0,
      percentageValue: percentageValue || 0,
      minimumDepositBDT: minimumDepositBDT || 0,
      wageringRequirement: wageringRequirement || 0,
      validityPeriodDays: validityPeriodDays || 30,
      applicableTo: applicableTo || "All Users",
      depositMethodId: depositMethodId || undefined,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Deposit bonus created successfully",
      depositBonus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get all deposit bonuses (Admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, bonusType } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (bonusType) {
      filter.bonusType = bonusType;
    }

    const depositBonuses = await DepositBonus.find(filter)
      .populate("depositMethodId", "method_name_en method_name_bd _id")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: depositBonuses.length,
      depositBonuses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get single deposit bonus by ID (Admin only)
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const depositBonus = await DepositBonus.findById(req.params.id).populate(
      "depositMethodId",
      "method_name_en method_name_bd _id"
    );

    if (!depositBonus) {
      return res.status(404).json({
        success: false,
        message: "Deposit bonus not found",
      });
    }

    res.json({
      success: true,
      depositBonus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update deposit bonus (Admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.depositMethodId === "") {
      updates.depositMethodId = undefined;
    }

    const depositBonus = await DepositBonus.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!depositBonus) {
      return res.status(404).json({
        success: false,
        message: "Deposit bonus not found",
      });
    }

    res.json({
      success: true,
      message: "Deposit bonus updated successfully",
      depositBonus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete deposit bonus (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const depositBonus = await DepositBonus.findByIdAndDelete(req.params.id);

    if (!depositBonus) {
      return res.status(404).json({
        success: false,
        message: "Deposit bonus not found",
      });
    }

    res.json({
      success: true,
      message: "Deposit bonus deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
