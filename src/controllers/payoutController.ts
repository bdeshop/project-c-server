import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import PayoutRequest from "../models/PayoutRequest";
import PayoutHistory from "../models/PayoutHistory";
import GameSession from "../models/GameSession";

/**
 * @desc    Distribute payout to selected affiliates
 * @route   POST /api/payout/distribute
 * @access  Private (Admin)
 */
export const distributePayout = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { affiliateIds, notes } = req.body;

    console.log("=== Distribute Payout ===");
    console.log("Selected Affiliates:", affiliateIds);
    console.log("Admin ID:", req.user?.id);

    if (
      !affiliateIds ||
      !Array.isArray(affiliateIds) ||
      affiliateIds.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "affiliateIds array is required and must not be empty",
      });
      return;
    }

    // Get selected affiliates
    const affiliates = await Affiliate.find({ _id: { $in: affiliateIds } });

    if (affiliates.length === 0) {
      res.status(400).json({
        success: false,
        message: "No affiliates found with provided IDs",
      });
      return;
    }

    // Process payout for each selected affiliate
    const payoutDistribution = [];
    let totalAmountDistributed = 0;

    for (const affiliate of affiliates) {
      // Get referral count
      const userCount = await User.countDocuments({
        referredBy: affiliate.myReferralCode,
      });

      // Get referrals
      const referrals = await User.find({
        referredBy: affiliate.myReferralCode,
      }).select("username");

      const referredUsernames = referrals.map(r => r.username);

      // Get game sessions
      const gameSessions = await GameSession.find({
        username: { $in: referredUsernames }
      });

      // Calculate total wins and losses
      let totalWinAmount = 0;
      let totalLossAmount = 0;

      gameSessions.forEach((session) => {
        totalWinAmount += session.totalWin || 0;
        const netLoss = Math.max(0, (session.totalBet || 0) - (session.totalWin || 0));
        totalLossAmount += netLoss;
      });

      // Calculate current commissions
      const winCommissionEarned =
        totalWinAmount * ((affiliate.betWinCommission || 0) / 100);
      const lossCommissionEarned =
        totalLossAmount * ((affiliate.betLossCommission || 0) / 100);

      // Calculate net amount to distribute (loss - win)
      const netDistributionAmount = lossCommissionEarned - winCommissionEarned;

      // Store previous payout balance
      const previousPayoutBalance = affiliate.payoutBalance || 0;

      // Transfer net amount to payout balance
      const newPayoutBalance = previousPayoutBalance + netDistributionAmount;
      affiliate.payoutBalance = newPayoutBalance;

      // Save last distribution amounts
      affiliate.lastDistributedWinCommission = parseFloat(
        winCommissionEarned.toFixed(2),
      );
      affiliate.lastDistributedLossCommission = parseFloat(
        lossCommissionEarned.toFixed(2),
      );
      affiliate.lastDistributedAt = new Date();

      // Reset current balance to 0 after distribution
      affiliate.balance = 0;

      await affiliate.save();

      totalAmountDistributed += netDistributionAmount;

      console.log(
        `✅ Payout processed for ${affiliate.userName}: Win Commission ${winCommissionEarned.toFixed(2)} | Loss Commission ${lossCommissionEarned.toFixed(2)} | Net ${netDistributionAmount.toFixed(2)} → Payout Balance ${newPayoutBalance.toFixed(2)}`,
      );

      payoutDistribution.push({
        affiliateId: affiliate._id,
        affiliateName: affiliate.userName,
        affiliateCode: affiliate.myReferralCode,
        userCount: userCount,
        currentBalance: parseFloat(netDistributionAmount.toFixed(2)),
        previousPayoutBalance: parseFloat(previousPayoutBalance.toFixed(2)),
        newPayoutBalance: parseFloat(newPayoutBalance.toFixed(2)),
      });
    }

    // Save payout history
    const payoutHistoryRecord = new PayoutHistory({
      adminId: req.user?.id,
      adminName: req.user?.email || "Admin",
      adminEmail: req.user?.email,
      affiliates: payoutDistribution,
      totalAffiliatesProcessed: payoutDistribution.length,
      totalAmountDistributed: parseFloat(totalAmountDistributed.toFixed(2)),
      distributedAt: new Date(),
      notes: notes || "",
    });

    await payoutHistoryRecord.save();

    console.log(`✅ Payout history saved: ${payoutHistoryRecord._id}`);

    res.status(200).json({
      success: true,
      message: "Payout distributed successfully",
      data: {
        payoutHistoryId: payoutHistoryRecord._id,
        totalAffiliatesProcessed: payoutDistribution.length,
        totalAmountDistributed: parseFloat(totalAmountDistributed.toFixed(2)),
        distribution: payoutDistribution,
      },
    });
  } catch (error: any) {
    console.error("❌ Error distributing payout:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get affiliate payout history and balance
 * @route   GET /api/affiliate/payout/history
 * @access  Private (Affiliate)
 */
export const getPayoutHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get referral count
    const totalUsersCount = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
    });

    // Get referrals
    const referrals = await User.find({
      referredBy: affiliate.myReferralCode,
    }).select("username");

    const referredUsernames = referrals.map(r => r.username);

    // Get game sessions
    const gameSessions = await GameSession.find({
      username: { $in: referredUsernames }
    });

    // Calculate total wins and losses
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    gameSessions.forEach((session) => {
      totalWinAmount += session.totalWin || 0;
      const netLoss = Math.max(0, (session.totalBet || 0) - (session.totalWin || 0));
      totalLossAmount += netLoss;
    });

    // Calculate commissions
    const winCommissionEarned =
      totalWinAmount * ((affiliate.betWinCommission || 0) / 100);
    const lossCommissionEarned =
      totalLossAmount * ((affiliate.betLossCommission || 0) / 100);

    // Calculate current balance from game commissions
    const currentBalance = lossCommissionEarned - winCommissionEarned;

    // Get minimum payout balance (default 100)
    const minimumPayoutBalance = 100;

    // Check if eligible for payout (based on payoutBalance only)
    const payoutBalance = affiliate.payoutBalance || 0;
    const isEligibleForPayout = payoutBalance >= minimumPayoutBalance;

    // Calculate remaining amount needed for payout
    const remainingForPayout = isEligibleForPayout
      ? 0
      : parseFloat((minimumPayoutBalance - payoutBalance).toFixed(2));

    // Get payout request history
    const payoutRequests = await PayoutRequest.find({
      affiliateId: affiliate._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        affiliateInfo: {
          id: affiliate._id,
          userName: affiliate.userName,
          fullName: affiliate.fullName,
          email: affiliate.email,
          myReferralCode: affiliate.myReferralCode,
          totalUsers: totalUsersCount,
        },
        balance: {
          currentBalance: parseFloat(currentBalance.toFixed(2)),
          payoutBalance: parseFloat(payoutBalance.toFixed(2)),
          totalAvailable: parseFloat(
            (currentBalance + payoutBalance).toFixed(2),
          ),
        },
        payoutSettings: {
          minimumPayoutBalance: minimumPayoutBalance,
          isEligibleForPayout: isEligibleForPayout,
          remainingForPayout: remainingForPayout,
        },
        gameStats: {
          totalWinAmount: parseFloat(totalWinAmount.toFixed(2)),
          totalLossAmount: parseFloat(totalLossAmount.toFixed(2)),
          winCommissionEarned: parseFloat(winCommissionEarned.toFixed(2)),
          lossCommissionEarned: parseFloat(lossCommissionEarned.toFixed(2)),
        },
        commissionRates: {
          betWinCommission: affiliate.betWinCommission || 0,
          betLossCommission: affiliate.betLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          registrationCommission: affiliate.registrationCommission || 0,
        },
        payoutHistory: payoutRequests.map((req) => ({
          id: req._id,
          amount: req.amount,
          paymentMethod: req.paymentMethod,
          status: req.status,
          rejectionReason: req.rejectionReason,
          createdAt: req.createdAt,
          approvedAt: req.approvedAt,
          rejectedAt: req.rejectedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching payout history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get payout settings (minimum payout balance)
 * @route   GET /api/payout/settings
 * @access  Private (Admin)
 */
export const getPayoutSettings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const minimumPayoutBalance = 100;

    res.status(200).json({
      success: true,
      data: {
        minimumPayoutBalance: minimumPayoutBalance,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payout settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Update payout settings (minimum payout balance)
 * @route   PUT /api/payout/settings
 * @access  Private (Admin)
 */
export const updatePayoutSettings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { minimumPayoutBalance } = req.body;

    if (minimumPayoutBalance === undefined || minimumPayoutBalance < 0) {
      res.status(400).json({
        success: false,
        message: "Minimum payout balance must be a non-negative number",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payout settings updated successfully",
      data: {
        minimumPayoutBalance: minimumPayoutBalance,
      },
    });
  } catch (error: any) {
    console.error("Error updating payout settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get payout distribution history (Admin)
 * @route   GET /api/payout/distribution-history
 * @access  Private (Admin)
 */
export const getPayoutDistributionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10, affiliateId } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (affiliateId) {
      filter["affiliates.affiliateId"] = affiliateId;
    }

    const total = await PayoutHistory.countDocuments(filter);

    const history = await PayoutHistory.find(filter)
      .sort({ distributedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        pagination: {
          total: total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
        history: history.map((record: any) => ({
          id: record._id,
          adminName: record.adminName,
          adminEmail: record.adminEmail,
          totalAffiliatesProcessed: record.totalAffiliatesProcessed,
          totalAmountDistributed: record.totalAmountDistributed,
          distributedAt: record.distributedAt,
          notes: record.notes,
          affiliates: record.affiliates.map((aff: any) => ({
            affiliateId: aff.affiliateId,
            affiliateName: aff.affiliateName,
            affiliateCode: aff.affiliateCode,
            userCount: aff.userCount,
            currentBalance: aff.currentBalance,
            previousPayoutBalance: aff.previousPayoutBalance,
            newPayoutBalance: aff.newPayoutBalance,
          })),
          createdAt: record.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching payout distribution history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get single payout distribution record (Admin)
 * @route   GET /api/payout/distribution-history/:id
 * @access  Private (Admin)
 */
export const getPayoutDistributionDetail = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await PayoutHistory.findById(id).lean();

    if (!record) {
      res.status(404).json({
        success: false,
        message: "Payout distribution record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: record._id,
        adminName: record.adminName,
        adminEmail: record.adminEmail,
        totalAffiliatesProcessed: record.totalAffiliatesProcessed,
        totalAmountDistributed: record.totalAmountDistributed,
        distributedAt: record.distributedAt,
        notes: record.notes,
        affiliates: record.affiliates.map((aff: any) => ({
          affiliateId: aff.affiliateId,
          affiliateName: aff.affiliateName,
          affiliateCode: aff.affiliateCode,
          userCount: aff.userCount,
          currentBalance: aff.currentBalance,
          previousPayoutBalance: aff.previousPayoutBalance,
          newPayoutBalance: aff.newPayoutBalance,
        })),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payout distribution detail:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
