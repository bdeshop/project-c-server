import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import DailyReward from "../models/DailyReward";
import RewardConfig from "../models/RewardConfig";
import ReferralSettings from "../models/ReferralSettings";
import QRCode from "qrcode";

/**
 * @desc    Get referral and rewards dashboard
 * @route   GET /api/referrals/dashboard
 * @access  Private (Frontend User)
 */
export const getReferralDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get referral count
    const referralCount = await User.countDocuments({
      referredBy: user.referralCode,
    });

    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's rewards
    const todayRewards = await DailyReward.find({
      userId: user._id,
      rewardDate: { $gte: today, $lt: tomorrow },
    });

    const todayRewardAmount = todayRewards.reduce(
      (sum, reward) => sum + reward.amount,
      0,
    );

    // Get yesterday's rewards
    const yesterdayRewards = await DailyReward.find({
      userId: user._id,
      rewardDate: { $gte: yesterday, $lt: today },
    });

    const yesterdayRewardAmount = yesterdayRewards.reduce(
      (sum, reward) => sum + reward.amount,
      0,
    );

    // Get available (unclaimed) rewards
    const unclaimedRewards = await DailyReward.find({
      userId: user._id,
      isClaimed: false,
    });

    const availableCashRewards = unclaimedRewards.reduce(
      (sum, reward) => sum + reward.amount,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        myReferralCode: user.referralCode,
        referralCount,
        todayRewards: todayRewardAmount,
        yesterdayRewards: yesterdayRewardAmount,
        availableCashRewards,
        balance: user.balance,
      },
    });
  } catch (error: any) {
    console.error("Error fetching referral dashboard:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get list of referred users
 * @route   GET /api/referrals/my-referrals
 * @access  Private (Frontend User)
 */
export const getMyReferrals = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const referredUsers = await User.find({
      referredBy: user.referralCode,
    }).select("name email phoneNumber createdAt status balance");

    res.status(200).json({
      success: true,
      count: referredUsers.length,
      referrals: referredUsers,
    });
  } catch (error: any) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Claim available rewards
 * @route   POST /api/referrals/claim-rewards
 * @access  Private (Frontend User)
 */
export const claimRewards = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get unclaimed rewards
    const unclaimedRewards = await DailyReward.find({
      userId: user._id,
      isClaimed: false,
    });

    if (unclaimedRewards.length === 0) {
      res.status(400).json({
        success: false,
        message: "No unclaimed rewards available",
      });
      return;
    }

    // Calculate total amount
    const totalAmount = unclaimedRewards.reduce(
      (sum, reward) => sum + reward.amount,
      0,
    );

    // Update user balance
    user.balance += totalAmount;
    user.referralEarnings += totalAmount;
    await user.save();

    // Mark rewards as claimed
    const now = new Date();
    await DailyReward.updateMany(
      { _id: { $in: unclaimedRewards.map((r) => r._id) } },
      { isClaimed: true, claimedAt: now },
    );

    res.status(200).json({
      success: true,
      message: "Rewards claimed successfully",
      data: {
        claimedAmount: totalAmount,
        newBalance: user.balance,
        rewardsCount: unclaimedRewards.length,
      },
    });
  } catch (error: any) {
    console.error("Error claiming rewards:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get reward history
 * @route   GET /api/referrals/reward-history
 * @access  Private (Frontend User)
 */
export const getRewardHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const rewards = await DailyReward.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await DailyReward.countDocuments({
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: rewards.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      rewards,
    });
  } catch (error: any) {
    console.error("Error fetching reward history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get redeem history
 * @route   GET /api/referrals/redeem-history
 * @access  Private (Frontend User)
 */
export const getRedeemHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const claimedRewards = await DailyReward.find({
      userId: req.user._id,
      isClaimed: true,
    })
      .sort({ claimedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await DailyReward.countDocuments({
      userId: req.user._id,
      isClaimed: true,
    });

    res.status(200).json({
      success: true,
      count: claimedRewards.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      redeemHistory: claimedRewards,
    });
  } catch (error: any) {
    console.error("Error fetching redeem history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Generate daily reward
 * @route   POST /api/referrals/generate-daily-reward
 * @access  Private (Frontend User)
 */
export const generateDailyReward = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get reward config
    const config = await RewardConfig.findOne();
    if (!config) {
      res.status(500).json({
        success: false,
        message: "Reward configuration not found",
      });
      return;
    }

    // Check if reward already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingReward = await DailyReward.findOne({
      userId: user._id,
      rewardDate: { $gte: today, $lt: tomorrow },
    });

    if (existingReward) {
      res.status(400).json({
        success: false,
        message: "Daily reward already generated for today",
      });
      return;
    }

    // Create daily reward
    const reward = await DailyReward.create({
      userId: user._id,
      amount: config.dailyRewardAmount,
      rewardDate: today,
      source: "daily",
      description: "Daily login reward",
    });

    res.status(201).json({
      success: true,
      message: "Daily reward generated successfully",
      reward,
    });
  } catch (error: any) {
    console.error("Error generating daily reward:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get reward configuration
 * @route   GET /api/referrals/reward-config
 * @access  Private (Frontend User)
 */
export const getRewardConfig = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    let config = await RewardConfig.findOne();
    if (!config) {
      config = await RewardConfig.create({});
    }

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error("Error fetching reward config:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Update reward configuration (Admin only)
 * @route   PUT /api/referrals/reward-config
 * @access  Private (Admin)
 */
export const updateRewardConfig = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { dailyRewardAmount, referralBonusAmount, depositBonusPercentage } =
      req.body;

    let config = await RewardConfig.findOne();
    if (!config) {
      config = await RewardConfig.create({});
    }

    if (dailyRewardAmount !== undefined)
      config.dailyRewardAmount = dailyRewardAmount;
    if (referralBonusAmount !== undefined)
      config.referralBonusAmount = referralBonusAmount;
    if (depositBonusPercentage !== undefined)
      config.depositBonusPercentage = depositBonusPercentage;

    await config.save();

    res.status(200).json({
      success: true,
      message: "Reward configuration updated successfully",
      config,
    });
  } catch (error: any) {
    console.error("Error updating reward config:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get referral statistics
 * @route   GET /api/referrals/statistics
 * @access  Private (Frontend User)
 */
export const getReferralStatistics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get referral count
    const totalReferrals = await User.countDocuments({
      referredBy: user.referralCode,
    });

    const activeReferrals = await User.countDocuments({
      referredBy: user.referralCode,
      status: "active",
    });

    // Get total earnings from referrals
    const totalEarnings = user.referralEarnings;

    // Get this month's earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthRewards = await DailyReward.find({
      userId: user._id,
      createdAt: { $gte: monthStart },
      isClaimed: true,
    });

    const monthEarnings = monthRewards.reduce(
      (sum, reward) => sum + reward.amount,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        monthEarnings,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Error fetching referral statistics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Generate QR code for referral link
 * @route   GET /api/referrals/generate-qr
 * @access  Private (Frontend User)
 */
export const generateReferralQRCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const referralLink = `${frontendUrl}/register?ref=${user.referralCode}`;

    const qrCode = await QRCode.toDataURL(referralLink);

    res.status(200).json({
      success: true,
      data: {
        qrCode,
        referralLink,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get referred users details
 * @route   GET /api/referrals/referred-users-details
 * @access  Private (Frontend User)
 */
export const getReferredUsersDetails = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const referredUsers = await User.find({
      referredBy: user.referralCode,
    })
      .select("name email phoneNumber status balance createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: referredUsers.length,
      referredUsers,
    });
  } catch (error: any) {
    console.error("Error fetching referred users details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get all referred users list with pagination
 * @route   GET /api/referrals/all-referred-users
 * @access  Private (Frontend User)
 */
export const getAllReferredUsersList = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const referredUsers = await User.find({
      referredBy: user.referralCode,
    })
      .select("name email phoneNumber status balance createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments({
      referredBy: user.referralCode,
    });

    res.status(200).json({
      success: true,
      count: referredUsers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      referredUsers,
    });
  } catch (error: any) {
    console.error("Error fetching all referred users:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
