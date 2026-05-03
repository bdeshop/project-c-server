import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import GameSession from "../models/GameSession";

/**
 * @desc    Get all affiliates (Admin)
 * @route   GET /api/affiliate/users
 * @access  Private (Admin)
 */
export const getAllAffiliates = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliates = await Affiliate.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: affiliates.length,
      users: affiliates.map((affiliate) => ({
        id: affiliate._id,
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        callingCode: affiliate.callingCode,
        myReferralCode: affiliate.myReferralCode,
        balance: affiliate.balance,
        role: affiliate.role,
        status: affiliate.status,
        paymentMethod: affiliate.paymentMethod,
        paymentDetails: affiliate.paymentDetails,
        betWinCommission: affiliate.betWinCommission,
        betLossCommission: affiliate.betLossCommission,
        depositCommission: affiliate.depositCommission,
        registrationCommission: affiliate.registrationCommission,
        totalReferrals: affiliate.totalReferrals,
        totalEarnings: affiliate.balance,
        createdAt: affiliate.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get pending affiliates (Admin)
 * @route   GET /api/affiliate/users/pending
 * @access  Private (Admin)
 */
export const getPendingAffiliates = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliates = await Affiliate.find({ status: "pending" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: affiliates.length,
      users: affiliates.map((affiliate) => ({
        id: affiliate._id,
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        myReferralCode: affiliate.myReferralCode,
        paymentMethod: affiliate.paymentMethod,
        paymentDetails: affiliate.paymentDetails,
        status: affiliate.status,
        createdAt: affiliate.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching pending affiliates:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get single affiliate details (Admin)
 * @route   GET /api/affiliate/users/:id
 * @access  Private (Admin)
 */
export const getAffiliateById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const affiliate = await Affiliate.findById(id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get total referrals for this affiliate
    const totalUsers = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
    });

    // Get referrals to get their usernames
    const referrals = await User.find({
      referredBy: affiliate.myReferralCode,
    }).select("username");

    const referredUsernames = referrals.map(r => r.username);

    // Get game sessions for these users
    const gameSessions = await GameSession.find({
      username: { $in: referredUsernames }
    });

    // Calculate total wins and losses
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    gameSessions.forEach((session) => {
      totalWinAmount += session.totalWin || 0;
      // In this system, totalBet is the amount lost if it's not won
      // But typically we track Net Loss = (Bet - Win)
      const netLoss = Math.max(0, (session.totalBet || 0) - (session.totalWin || 0));
      totalLossAmount += netLoss;
    });

    // Calculate commissions
    const winCommissionEarned =
      totalWinAmount * ((affiliate.betWinCommission || 0) / 100);
    const lossCommissionEarned =
      totalLossAmount * ((affiliate.betLossCommission || 0) / 100);

    // Calculate total earnings (losses - wins)
    const totalEarnings = lossCommissionEarned - winCommissionEarned;

    res.status(200).json({
      success: true,
      data: {
        id: affiliate._id,
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        callingCode: affiliate.callingCode,
        status: affiliate.status,
        role: affiliate.role,
        myReferralCode: affiliate.myReferralCode,
        paymentMethod: affiliate.paymentMethod,
        paymentDetails: affiliate.paymentDetails,
        balance: parseFloat(affiliate.balance.toFixed(2)),
        payoutBalance: parseFloat(affiliate.payoutBalance.toFixed(2)),
        betWinCommission: affiliate.betWinCommission || 0,
        betLossCommission: affiliate.betLossCommission || 0,
        depositCommission: affiliate.depositCommission || 0,
        registrationCommission: affiliate.registrationCommission || 0,
        totalUsers: totalUsers,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        gameStats: {
          totalWinAmount: parseFloat(totalWinAmount.toFixed(2)),
          totalLossAmount: parseFloat(totalLossAmount.toFixed(2)),
          winCommissionEarned: parseFloat(winCommissionEarned.toFixed(2)),
          lossCommissionEarned: parseFloat(lossCommissionEarned.toFixed(2)),
        },
        lastDistribution: {
          winCommissionEarned: parseFloat(
            (affiliate.lastDistributedWinCommission || 0).toFixed(2),
          ),
          lossCommissionEarned: parseFloat(
            (affiliate.lastDistributedLossCommission || 0).toFixed(2),
          ),
          distributedAmount: parseFloat(
            (
              (affiliate.lastDistributedLossCommission || 0) -
              (affiliate.lastDistributedWinCommission || 0)
            ).toFixed(2),
          ),
          distributedAt: affiliate.lastDistributedAt || null,
        },
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Activate affiliate (Admin)
 * @route   POST /api/affiliate/users/:id/activate
 * @access  Private (Admin)
 */
export const activateAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      betWinCommission,
      betLossCommission,
      depositCommission,
      registrationCommission,
      role,
    } = req.body;

    console.log("=== Activate Affiliate ===");
    console.log("Affiliate ID:", id);
    console.log("Commission settings:", req.body);

    const affiliate = await Affiliate.findById(id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    if (affiliate.status === "active") {
      res.status(400).json({
        success: false,
        message: "Affiliate is already active",
      });
      return;
    }

    // Update affiliate
    affiliate.status = "active";
    if (betWinCommission !== undefined)
      affiliate.betWinCommission = betWinCommission;
    if (betLossCommission !== undefined)
      affiliate.betLossCommission = betLossCommission;
    if (depositCommission !== undefined)
      affiliate.depositCommission = depositCommission;
    if (registrationCommission !== undefined)
      affiliate.registrationCommission = registrationCommission;
    if (role !== undefined) affiliate.role = role;

    await affiliate.save();

    console.log("✅ Affiliate activated successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate activated successfully",
      affiliate: {
        id: affiliate._id,
        userName: affiliate.userName,
        status: affiliate.status,
        role: affiliate.role,
        betWinCommission: affiliate.betWinCommission,
        betLossCommission: affiliate.betLossCommission,
        depositCommission: affiliate.depositCommission,
        registrationCommission: affiliate.registrationCommission,
      },
    });
  } catch (error) {
    console.error("❌ Error activating affiliate:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Update affiliate info (Admin)
 * @route   PUT /api/affiliate/users/:id
 * @access  Private (Admin)
 */
export const updateAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      status,
      role,
      balance,
      betWinCommission,
      betLossCommission,
      depositCommission,
      registrationCommission,
    } = req.body;

    const affiliate = await Affiliate.findById(id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Update fields if provided
    if (fullName !== undefined) affiliate.fullName = fullName;
    if (email !== undefined) affiliate.email = email;
    if (phone !== undefined) affiliate.phone = phone;
    if (status !== undefined) affiliate.status = status;
    if (role !== undefined) affiliate.role = role;
    if (balance !== undefined) affiliate.balance = balance;
    if (betWinCommission !== undefined)
      affiliate.betWinCommission = betWinCommission;
    if (betLossCommission !== undefined)
      affiliate.betLossCommission = betLossCommission;
    if (depositCommission !== undefined)
      affiliate.depositCommission = depositCommission;
    if (registrationCommission !== undefined)
      affiliate.registrationCommission = registrationCommission;

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Affiliate updated successfully",
      affiliate: {
        id: affiliate._id,
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        status: affiliate.status,
        role: affiliate.role,
        balance: affiliate.balance,
        betWinCommission: affiliate.betWinCommission,
        betLossCommission: affiliate.betLossCommission,
        depositCommission: affiliate.depositCommission,
        registrationCommission: affiliate.registrationCommission,
      },
    });
  } catch (error) {
    console.error("Error updating affiliate:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Delete affiliate (Admin)
 * @route   DELETE /api/affiliate/users/:id
 * @access  Private (Admin)
 */
export const deleteAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const affiliate = await Affiliate.findByIdAndDelete(id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Affiliate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Toggle affiliate status (Admin)
 * @route   PATCH /api/affiliate/users/:id/status
 * @access  Private (Admin)
 */
export const toggleAffiliateStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("=== Toggle Affiliate Status ===");
    console.log("Affiliate ID:", id);
    console.log("New Status:", status);

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const validStatuses = ["active", "inactive", "pending"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const affiliate = await Affiliate.findById(id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Don't allow changing status of pending affiliates to active without commission settings
    if (affiliate.status === "pending" && status === "active") {
      if (
        !affiliate.betWinCommission &&
        !affiliate.betLossCommission &&
        !affiliate.depositCommission &&
        !affiliate.registrationCommission
      ) {
        res.status(400).json({
          success: false,
          message:
            "Cannot activate affiliate without commission settings. Use /activate endpoint instead.",
        });
        return;
      }
    }

    const oldStatus = affiliate.status;
    affiliate.status = status;
    await affiliate.save();

    console.log(`✅ Affiliate status changed from ${oldStatus} to ${status}`);

    res.status(200).json({
      success: true,
      message: `Affiliate status changed from ${oldStatus} to ${status}`,
      affiliate: {
        id: affiliate._id,
        userName: affiliate.userName,
        status: affiliate.status,
        role: affiliate.role,
      },
    });
  } catch (error) {
    console.error("❌ Error toggling affiliate status:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get affiliate statistics (Admin)
 * @route   GET /api/affiliate/stats
 * @access  Private (Admin)
 */
export const getAffiliateStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliates = await Affiliate.find().sort({ createdAt: -1 });

    // Calculate stats for each affiliate
    const affiliateStats = await Promise.all(
      affiliates.map(async (affiliate) => {
        // Get total referrals for this affiliate
        const totalUsersCount = await User.countDocuments({
          referredBy: affiliate.myReferralCode,
        });

        // Get referrals to get their usernames
        const referrals = await User.find({
          referredBy: affiliate.myReferralCode,
        }).select("username");

        const referredUsernames = referrals.map(r => r.username);

        // Get game sessions for these users
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

        // Calculate total earnings (losses - wins)
        const totalEarnings = lossCommissionEarned - winCommissionEarned;

        return {
          id: affiliate._id,
          userName: affiliate.userName,
          fullName: affiliate.fullName,
          email: affiliate.email,
          phone: affiliate.phone,
          status: affiliate.status,
          role: affiliate.role,
          myReferralCode: affiliate.myReferralCode,
          totalUsers: totalUsersCount,
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          currentBalance: parseFloat(totalEarnings.toFixed(2)),
          betWinCommission: affiliate.betWinCommission || 0,
          betLossCommission: affiliate.betLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          registrationCommission: affiliate.registrationCommission || 0,
          gameStats: {
            totalWinAmount: parseFloat(totalWinAmount.toFixed(2)),
            totalLossAmount: parseFloat(totalLossAmount.toFixed(2)),
            winCommissionEarned: parseFloat(winCommissionEarned.toFixed(2)),
            lossCommissionEarned: parseFloat(lossCommissionEarned.toFixed(2)),
          },
          lastDistribution: {
            winCommissionEarned: parseFloat(
              (affiliate.lastDistributedWinCommission || 0).toFixed(2),
            ),
            lossCommissionEarned: parseFloat(
              (affiliate.lastDistributedLossCommission || 0).toFixed(2),
            ),
            distributedAmount: parseFloat(
              (
                (affiliate.lastDistributedLossCommission || 0) -
                (affiliate.lastDistributedWinCommission || 0)
              ).toFixed(2),
            ),
            distributedAt: affiliate.lastDistributedAt || null,
          },
          createdAt: affiliate.createdAt,
        };
      }),
    );

    // Calculate platform totals
    const platformTotals = {
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter((a) => a.status === "active").length,
      pendingAffiliates: affiliates.filter((a) => a.status === "pending")
        .length,
      inactiveAffiliates: affiliates.filter((a) => a.status === "inactive")
        .length,
      totalUsers: await User.countDocuments({
        referredBy: { $exists: true, $ne: null },
      }),
      totalEarnings: parseFloat(
        affiliateStats
          .reduce((sum, stat) => sum + stat.totalEarnings, 0)
          .toFixed(2),
      ),
      topEarners: affiliateStats
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5),
    };

    res.status(200).json({
      success: true,
      data: {
        platformTotals,
        affiliates: affiliateStats,
      },
    });
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
