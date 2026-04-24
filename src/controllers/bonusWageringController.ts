import { Request, Response } from "express";
import BonusWagering from "../models/BonusWagering";

/**
 * @desc    Get user's wagering progress
 * @route   GET /api/bonus-wagering/my-progress
 * @access  Private (User)
 */
export const getMyWageringProgress = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = { userId: req.user._id };

    if (status) {
      filter.status = status;
    }

    const wageringRecords = await BonusWagering.find(filter)
      .populate(
        "depositBonusId",
        "nameEn nameBn bonusCode welcomeBonusName wageringRequirement",
      )
      .populate("depositTransactionId", "transactionId amount")
      .sort({ createdAt: -1 });

    // Check for expired records
    const now = new Date();
    for (const record of wageringRecords) {
      if (record.status === "active" && record.expiresAt < now) {
        record.status = "expired";
        await record.save();
      }
    }

    // Calculate summary stats
    const activeWagering = wageringRecords.filter((w) => w.status === "active");
    const completedWagering = wageringRecords.filter(
      (w) => w.status === "completed",
    );
    const expiredWagering = wageringRecords.filter(
      (w) => w.status === "expired",
    );

    const totalBonusAmount = wageringRecords.reduce(
      (sum, w) => sum + w.bonusAmount,
      0,
    );
    const totalRequiredWagering = wageringRecords.reduce(
      (sum, w) => sum + w.requiredWageringAmount,
      0,
    );
    const totalCurrentWagering = wageringRecords.reduce(
      (sum, w) => sum + w.currentWageringAmount,
      0,
    );

    const overallProgress =
      totalRequiredWagering > 0
        ? Math.round((totalCurrentWagering / totalRequiredWagering) * 100)
        : 0;

    res.status(200).json({
      success: true,
      count: wageringRecords.length,
      summary: {
        totalBonusAmount,
        totalRequiredWagering,
        totalCurrentWagering,
        remainingWagering: Math.max(
          0,
          totalRequiredWagering - totalCurrentWagering,
        ),
        overallProgress,
        activeCount: activeWagering.length,
        completedCount: completedWagering.length,
        expiredCount: expiredWagering.length,
      },
      wageringRecords: wageringRecords.map((w) => {
        const bonusData = w.depositBonusId as any;
        const remaining = Math.max(
          0,
          w.requiredWageringAmount - w.currentWageringAmount,
        );

        return {
          _id: w._id,
          bonusName:
            bonusData?.welcomeBonusName || bonusData?.nameEn || "Bonus",
          bonusCode: bonusData?.bonusCode,
          bonusAmount: w.bonusAmount,
          requiredWageringAmount: w.requiredWageringAmount,
          currentWageringAmount: w.currentWageringAmount,
          remainingWagering: remaining,
          wageringProgress: w.wageringProgress,
          status: w.status,
          expiresAt: w.expiresAt,
          completedAt: w.completedAt,
          createdAt: w.createdAt,
          depositTransaction: w.depositTransactionId,
        };
      }),
    });
  } catch (error: any) {
    console.error("Error fetching wagering progress:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Check if user can withdraw (no active wagering requirements)
 * @route   GET /api/bonus-wagering/can-withdraw
 * @access  Private (User)
 */
export const canUserWithdraw = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Get active wagering requirements (must be active AND not expired)
    const activeWagering = await BonusWagering.find({
      userId: userId,
      status: "active",
      expiresAt: { $gt: now },
    }).populate("depositBonusId", "nameEn nameBn bonusCode welcomeBonusName");

    const canWithdraw = activeWagering.length === 0;

    res.status(200).json({
      success: true,
      canWithdraw,
      activeWageringCount: activeWagering.length,
      activeWagering: activeWagering.map((w) => {
        const bonusData = w.depositBonusId as any;
        return {
          wageringId: w._id,
          bonusName: bonusData?.nameEn || bonusData?.welcomeBonusName,
          progress: w.wageringProgress,
          currentAmount: w.currentWageringAmount,
          requiredAmount: w.requiredWageringAmount,
          expiresAt: w.expiresAt,
        };
      }),
    });
  } catch (error: any) {
    console.error("Error checking withdraw eligibility:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get all wagering records (Admin)
 * @route   GET /api/bonus-wagering/admin/all
 * @access  Private (Admin)
 */
export const getAllWageringRecords = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const { status, userId } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const wageringRecords = await BonusWagering.find(filter)
      .populate("userId", "name username phoneNumber email")
      .populate("depositBonusId", "nameEn nameBn welcomeBonusName bonusCode")
      .populate("depositTransactionId", "transactionId amount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: wageringRecords.length,
      wageringRecords,
    });
  } catch (error: any) {
    console.error("Error fetching all wagering records:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
