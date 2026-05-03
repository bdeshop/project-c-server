import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import GameSession from "../models/GameSession";

/**
 * @desc    Get logged-in affiliate's complete dashboard information
 * @route   GET /api/affiliate/dashboard
 * @access  Private (Affiliate)
 */
export const getAffiliateDashboard = async (
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

    // Get referral count (users who used this affiliate's referral code)
    const referralCount = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
    });

    // Get referrals list
    const referrals = await User.find({
      referredBy: affiliate.myReferralCode,
    })
      .select("username name email balance createdAt role status")
      .sort({ createdAt: -1 })
      .limit(10);

    const referredUsernames = referrals.map(r => r.username);

    // Get game sessions for these users
    const gameSessions = await GameSession.find({
      username: { $in: referredUsernames }
    });

    // Calculate win/loss breakdown
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let totalWins = 0;
    let totalLosses = 0;

    gameSessions.forEach((session) => {
      totalWinAmount += session.totalWin || 0;
      totalWins += 1; // Simplification: counting sessions as "wins" if they have win amount? 
      // Actually, we'll just use the cumulative amounts.
      
      const netLoss = Math.max(0, (session.totalBet || 0) - (session.totalWin || 0));
      totalLossAmount += netLoss;
      if (netLoss > 0) totalLosses += 1;
    });

    // Calculate net earnings from wins and losses
    const winCommissionEarned =
      totalWinAmount * ((affiliate.betWinCommission || 0) / 100);
    const lossCommissionEarned =
      totalLossAmount * ((affiliate.betLossCommission || 0) / 100);

    // Calculate balance from commissions (losses add, wins deduct)
    const currentBalance = lossCommissionEarned - winCommissionEarned;

    res.status(200).json({
      success: true,
      data: {
        // Basic Affiliate Info
        userInfo: {
          id: affiliate._id,
          userName: affiliate.userName,
          fullName: affiliate.fullName,
          email: affiliate.email,
          phone: affiliate.phone,
          callingCode: affiliate.callingCode,
          role: affiliate.role,
          status: affiliate.status,
          myReferralCode: affiliate.myReferralCode,
          paymentMethod: affiliate.paymentMethod,
          paymentDetails: affiliate.paymentDetails,
          createdAt: affiliate.createdAt,
        },

        // Balance & Commissions
        balanceAndCommissions: {
          currentBalance: parseFloat(currentBalance.toFixed(2)),
          betWinCommission: affiliate.betWinCommission || 0,
          betLossCommission: affiliate.betLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          registrationCommission: affiliate.registrationCommission || 0,
          totalEarnings: parseFloat(currentBalance.toFixed(2)),
        },

        // Account Summary
        accountSummary: {
          currentBalance: parseFloat(currentBalance.toFixed(2)),
          referralCode: affiliate.myReferralCode,
          totalEarnings: parseFloat(currentBalance.toFixed(2)),
          referralCount: referralCount,
          totalReferrals: affiliate.totalReferrals || referralCount,
          memberSince: affiliate.createdAt,
        },

        // Referrals
        referrals: {
          count: referralCount,
          recentReferrals: referrals.map((r) => ({
            id: r._id,
            userName: r.username,
            phone: r.email, // Or phone if available
            balance: r.balance,
            role: r.role,
            status: r.status,
            joinedAt: r.createdAt,
          })),
        },

        // Win/Loss Breakdown
        winLossBreakdown: {
          totalWins: totalWins,
          totalLosses: totalLosses,
          totalWinAmount: parseFloat(totalWinAmount.toFixed(2)),
          totalLossAmount: parseFloat(totalLossAmount.toFixed(2)),
          winCommissionEarned: parseFloat(winCommissionEarned.toFixed(2)),
          lossCommissionEarned: parseFloat(lossCommissionEarned.toFixed(2)),
          // Display format: wins as negative, losses as positive
          displayWins: -parseFloat(winCommissionEarned.toFixed(2)),
          displayLosses: parseFloat(lossCommissionEarned.toFixed(2)),
        },

        // Payment Information
        paymentInfo: {
          method: affiliate.paymentMethod,
          details: affiliate.paymentDetails,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching affiliate dashboard:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
