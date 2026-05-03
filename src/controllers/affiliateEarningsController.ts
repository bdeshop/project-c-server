import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import AffiliateClick from "../models/AffiliateClick";
import GameSession from "../models/GameSession";

/**
 * @desc    Get affiliate earnings dashboard with all statistics
 * @route   GET /api/affiliate/earnings
 * @access  Private (Affiliate)
 */
export const getAffiliateEarnings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { period = "all" } = req.query;

    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get referral count
    const totalReferrals = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
    });

    const activeReferrals = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
      status: "active",
    });

    // Get total clicks
    const totalClicks = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
    });

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date(0); // All time

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        startDate = new Date(0);
    }

    // Get referrals
    const referrals = await User.find({
      referredBy: affiliate.myReferralCode,
    }).select("username createdAt");

    const referredUsernames = referrals.map(r => r.username);

    // Get game sessions
    const gameSessions = await GameSession.find({
      username: { $in: referredUsernames }
    });

    // Calculate earnings for the period
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let periodWinAmount = 0;
    let periodLossAmount = 0;
    let periodReferrals = 0;

    // Map of referral join dates
    const joinDateMap = new Map(referrals.map(r => [r.username, r.createdAt]));

    referrals.forEach((referral) => {
      if (new Date(referral.createdAt) >= startDate) {
        periodReferrals += 1;
      }
    });

    gameSessions.forEach((session) => {
      const sessionDate = new Date(session.createdAt);
      const win = session.totalWin || 0;
      const netLoss = Math.max(0, (session.totalBet || 0) - (session.totalWin || 0));

      totalWinAmount += win;
      totalLossAmount += netLoss;

      if (sessionDate >= startDate) {
        periodWinAmount += win;
        periodLossAmount += netLoss;
      }
    });

    // Calculate commissions
    const winCommissionEarned =
      totalWinAmount * ((affiliate.betWinCommission || 0) / 100);
    const lossCommissionEarned =
      totalLossAmount * ((affiliate.betLossCommission || 0) / 100);

    const periodWinCommission =
      periodWinAmount * ((affiliate.betWinCommission || 0) / 100);
    const periodLossCommission =
      periodLossAmount * ((affiliate.betLossCommission || 0) / 100);

    // Calculate balances
    const currentBalance = lossCommissionEarned - winCommissionEarned;
    const periodEarnings = periodLossCommission - periodWinCommission;
    const payoutBalance = affiliate.payoutBalance || 0;
    const minimumPayoutBalance = 100;
    const isEligibleForPayout = payoutBalance >= minimumPayoutBalance;
    const remainingForPayout = isEligibleForPayout
      ? 0
      : minimumPayoutBalance - payoutBalance;

    // Get clicks for period
    const periodClicks = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: startDate },
    });

    // Calculate growth percentages (Simplified for now)
    const earningsGrowth = 0; // Placeholder for more complex growth logic if needed

    res.status(200).json({
      success: true,
      data: {
        period: period,
        affiliateInfo: {
          id: affiliate._id,
          userName: affiliate.userName,
          fullName: affiliate.fullName,
          myReferralCode: affiliate.myReferralCode,
        },

        // Total Earnings
        totalEarnings: {
          amount: parseFloat(currentBalance.toFixed(2)),
          currency: "BDT",
          growth: 0,
          label: "Lifetime earnings",
        },

        // Pending Earnings (Current Balance)
        pendingEarnings: {
          amount: parseFloat(currentBalance.toFixed(2)),
          currency: "BDT",
          growth: parseFloat(earningsGrowth.toFixed(2)),
          label: "Available for withdrawal",
          period: period,
        },

        // Paid Earnings (Payout Balance)
        paidEarnings: {
          amount: parseFloat(payoutBalance.toFixed(2)),
          currency: "BDT",
          label: "Total paid out",
        },

        // Commission Rate
        commissionRate: {
          betWinCommission: affiliate.betWinCommission || 0,
          betLossCommission: affiliate.betLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          registrationCommission: affiliate.registrationCommission || 0,
          currentTier: "Standard",
          tierGrowth: 0,
        },

        // Referrals
        referrals: {
          total: totalReferrals,
          active: activeReferrals,
          thisPeriod: periodReferrals,
          growth:
            totalReferrals === 0
              ? 0
              : ((periodReferrals / totalReferrals) * 100).toFixed(2),
        },

        // Clicks
        clicks: {
          total: totalClicks,
          thisPeriod: periodClicks,
        },

        // Payout Status
        payoutStatus: {
          availableForPayout: parseFloat(payoutBalance.toFixed(2)),
          minimumRequired: minimumPayoutBalance,
          isEligible: isEligibleForPayout,
          remainingNeeded: parseFloat(remainingForPayout.toFixed(2)),
          status: isEligibleForPayout
            ? "Ready to withdraw"
            : `Need BDT ${remainingForPayout.toFixed(2)} more`,
        },

        // Detailed Earnings Breakdown
        earningsBreakdown: {
          allTime: {
            wins: {
              amount: parseFloat(totalWinAmount.toFixed(2)),
              commission: parseFloat(winCommissionEarned.toFixed(2)),
              rate: affiliate.betWinCommission || 0,
            },
            losses: {
              amount: parseFloat(totalLossAmount.toFixed(2)),
              commission: parseFloat(lossCommissionEarned.toFixed(2)),
              rate: affiliate.betLossCommission || 0,
            },
            netEarnings: parseFloat(currentBalance.toFixed(2)),
          },
          period: {
            wins: {
              amount: parseFloat(periodWinAmount.toFixed(2)),
              commission: parseFloat(periodWinCommission.toFixed(2)),
              rate: affiliate.betWinCommission || 0,
            },
            losses: {
              amount: parseFloat(periodLossAmount.toFixed(2)),
              commission: parseFloat(periodLossCommission.toFixed(2)),
              rate: affiliate.betLossCommission || 0,
            },
            netEarnings: parseFloat(periodEarnings.toFixed(2)),
          },
        },

        // Balance Summary
        balanceSummary: {
          currentBalance: parseFloat(currentBalance.toFixed(2)),
          payoutBalance: parseFloat(payoutBalance.toFixed(2)),
          totalAvailable: parseFloat(
            (currentBalance + payoutBalance).toFixed(2),
          ),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching affiliate earnings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
