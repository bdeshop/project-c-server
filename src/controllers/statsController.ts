import { Request, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";
import ReferralTransaction from "../models/ReferralTransaction";
import Promotion from "../models/Promotion";
import Slider from "../models/Slider";
import TopWinner from "../models/TopWinner";
import UpcomingMatch from "../models/UpcomingMatch";
import PaymentMethod from "../models/PaymentMethod";
import WithdrawalMethod from "../models/WithdrawalMethod";

// ============================================================================
// ADMIN DASHBOARD STATS
// ============================================================================

export const getAdminStats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const bannedUsers = await User.countDocuments({ status: "banned" });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // Financial Statistics
    const totalBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);
    const totalDeposits = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$deposit" } } },
    ]);
    const totalWithdrawals = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$withdraw" } } },
    ]);

    // Transaction Statistics
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({
      status: "Pending",
    });
    const completedTransactions = await Transaction.countDocuments({
      status: "Completed",
    });
    const failedTransactions = await Transaction.countDocuments({
      status: "Failed",
    });

    const transactionsByType = await Transaction.aggregate([
      { $group: { _id: "$transaction_type", count: { $count: {} } } },
    ]);

    const transactionsToday = await Transaction.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // Referral Statistics
    const totalReferralEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$referralEarnings" } } },
    ]);
    const totalReferralTransactions =
      await ReferralTransaction.countDocuments();
    const pendingReferralPayouts = await ReferralTransaction.countDocuments({
      status: "pending",
    });
    const usersWithReferrals = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });
    const totalReferredUsers = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });

    // Content Statistics
    const totalPromotions = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({
      status: "Active",
    });
    const totalSliders = await Slider.countDocuments();
    const totalTopWinners = await TopWinner.countDocuments();
    const totalUpcomingMatches = await UpcomingMatch.countDocuments();

    // Payment Methods
    const activePaymentMethods = await PaymentMethod.countDocuments({
      status: "Active",
    });
    const activeWithdrawalMethods = await WithdrawalMethod.countDocuments({
      status: "Active",
    });

    // Recent Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentTransactions = await Transaction.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Top Referrers
    const topReferrers = await User.find({ referralCode: { $exists: true } })
      .sort({ referralEarnings: -1 })
      .limit(5)
      .select("name email referralCode referralEarnings referredUsers");

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
          recentWeek: recentUsers,
        },
        financial: {
          totalBalance: totalBalance[0]?.total || 0,
          totalDeposits: totalDeposits[0]?.total || 0,
          totalWithdrawals: totalWithdrawals[0]?.total || 0,
          netRevenue:
            (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0),
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          completed: completedTransactions,
          failed: failedTransactions,
          today: transactionsToday,
          recentWeek: recentTransactions,
          byType: transactionsByType,
        },
        referrals: {
          totalEarnings: totalReferralEarnings[0]?.total || 0,
          totalTransactions: totalReferralTransactions,
          pendingPayouts: pendingReferralPayouts,
          usersWithReferralCodes: usersWithReferrals,
          totalReferredUsers: totalReferredUsers,
          topReferrers: topReferrers,
        },
        content: {
          promotions: { total: totalPromotions, active: activePromotions },
          sliders: totalSliders,
          topWinners: totalTopWinners,
          upcomingMatches: totalUpcomingMatches,
        },
        paymentMethods: {
          activeDeposit: activePaymentMethods,
          activeWithdrawal: activeWithdrawalMethods,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};

// ============================================================================
// USER DASHBOARD STATS
// ============================================================================

export const getUserStats = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get user data
    const user = await User.findById(userId).select(
      "balance deposit withdraw referralEarnings referralCode referredUsers"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // User's transaction statistics
    const totalTransactions = await Transaction.countDocuments({
      user_id: userId,
    });
    const pendingTransactions = await Transaction.countDocuments({
      user_id: userId,
      status: "Pending",
    });
    const completedTransactions = await Transaction.countDocuments({
      user_id: userId,
      status: "Completed",
    });

    const transactionsByType = await Transaction.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: "$transaction_type", count: { $count: {} } } },
    ]);

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("amount transaction_type status createdAt");

    // Referral statistics
    const referralTransactions = await ReferralTransaction.find({
      referrer: userId,
    })
      .populate("referee", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalReferralEarnings = user.referralEarnings || 0;
    const totalReferrals = user.referredUsers?.length || 0;

    const pendingReferralEarnings = await ReferralTransaction.aggregate([
      { $match: { referrer: userId, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Active promotions for user
    const activePromotions = await Promotion.countDocuments({
      status: "Active",
    });

    res.status(200).json({
      success: true,
      data: {
        account: {
          balance: user.balance,
          totalDeposits: user.deposit,
          totalWithdrawals: user.withdraw,
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          completed: completedTransactions,
          byType: transactionsByType,
          recent: recentTransactions,
        },
        referrals: {
          code: user.referralCode || null,
          totalEarnings: totalReferralEarnings,
          pendingEarnings: pendingReferralEarnings[0]?.total || 0,
          totalReferrals: totalReferrals,
          recentTransactions: referralTransactions,
        },
        promotions: {
          available: activePromotions,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error: error.message,
    });
  }
};

// ============================================================================
// CHART DATA ENDPOINTS
// ============================================================================

export const getRecentActivityLog = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const isAdmin = req.user?.role === "admin";
    const userId = req.user?.id || req.user?._id;

    // Get last 10 activities
    const limit = parseInt(req.query.limit as string) || 10;

    let activities: any[] = [];

    if (isAdmin) {
      // Admin sees all activities
      const recentTransactions = await Transaction.find()
        .populate("user_id", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("amount transaction_type status createdAt user_id");

      activities = recentTransactions.map((tx: any) => ({
        type: "transaction",
        action: tx.transaction_type,
        amount: tx.amount,
        status: tx.status,
        user: tx.user_id?.name || "Unknown",
        timestamp: tx.createdAt,
      }));
    } else {
      // User sees only their activities
      const recentTransactions = await Transaction.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("amount transaction_type status createdAt");

      activities = recentTransactions.map((tx: any) => ({
        type: "transaction",
        action: tx.transaction_type,
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.createdAt,
      }));
    }

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log",
      error: error.message,
    });
  }
};

export const getTransactionChartData = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const isAdmin = req.user?.role === "admin";
    const userId = req.user?.id || req.user?._id;
    const days = parseInt(req.query.days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchQuery = isAdmin ? {} : { user_id: userId };

    // Daily transaction data for line chart
    const dailyData = await Transaction.aggregate([
      { $match: { ...matchQuery, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$transaction_type",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Transaction type distribution for pie chart
    const typeDistribution = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$transaction_type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Status distribution for pie chart
    const statusDistribution = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyTransactions: dailyData,
        typeDistribution: typeDistribution,
        statusDistribution: statusDistribution,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
      error: error.message,
    });
  }
};

export const getUserGrowthChart = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily user signups
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User status distribution
    const statusDistribution = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailySignups: dailySignups,
        statusDistribution: statusDistribution,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user growth data",
      error: error.message,
    });
  }
};

export const getFinancialChartData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily financial overview
    const dailyFinancials = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: "Completed" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$transaction_type",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Top wallet providers
    const topProviders = await Transaction.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: "$wallet_provider",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyFinancials: dailyFinancials,
        topProviders: topProviders,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial chart data",
      error: error.message,
    });
  }
};

export const getReferralChartData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily referral signups
    const dailyReferrals = await User.aggregate([
      {
        $match: {
          referredBy: { $exists: true, $ne: null },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Referral transaction status distribution
    const referralStatusDistribution = await ReferralTransaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Top referrers by earnings
    const topReferrers = await User.find({ referralCode: { $exists: true } })
      .sort({ referralEarnings: -1 })
      .limit(10)
      .select("name referralCode referralEarnings referredUsers");

    res.status(200).json({
      success: true,
      data: {
        dailyReferrals: dailyReferrals,
        statusDistribution: referralStatusDistribution,
        topReferrers: topReferrers.map((user) => ({
          name: user.name,
          code: user.referralCode,
          earnings: user.referralEarnings,
          referrals: user.referredUsers.length,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch referral chart data",
      error: error.message,
    });
  }
};
