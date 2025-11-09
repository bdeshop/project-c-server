import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import ReferralTransaction, {
  IReferralTransaction,
} from "../models/ReferralTransaction";
import ReferralSettings, {
  IReferralSettings,
} from "../models/ReferralSettings";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Generate a unique referral code
const generateReferralCode = (username?: string): string => {
  if (username && username.length >= 3) {
    // Use first 3 characters of username + random 3 characters
    const prefix = username.substring(0, 3).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${suffix}`;
  }
  // Fallback to random 6-character code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Get referral settings
// @route   GET /api/referral/settings
// @access  Public
export const getReferralSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await ReferralSettings.getInstance();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update referral settings
// @route   PUT /api/referral/settings
// @access  Private/Admin
export const updateReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔧 Admin updating referral settings:", req.body);

    const {
      signupBonus,
      referralCommission,
      referralDepositBonus,
      maxCommissionLimit,
      minWithdrawAmount,
      minTransferAmount,
    } = req.body;

    // Validate the input values
    const validationErrors = [];

    if (signupBonus !== undefined && (signupBonus < 0 || signupBonus > 1000)) {
      validationErrors.push("Signup bonus must be between 0 and 1000");
    }

    if (
      referralCommission !== undefined &&
      (referralCommission < 0 || referralCommission > 100)
    ) {
      validationErrors.push("Referral commission must be between 0 and 100");
    }

    if (
      referralDepositBonus !== undefined &&
      (referralDepositBonus < 0 || referralDepositBonus > 1000)
    ) {
      validationErrors.push(
        "Referral deposit bonus must be between 0 and 1000"
      );
    }

    if (
      minWithdrawAmount !== undefined &&
      (minWithdrawAmount < 1 || minWithdrawAmount > 10000)
    ) {
      validationErrors.push(
        "Minimum withdraw amount must be between 1 and 10000"
      );
    }

    if (
      minTransferAmount !== undefined &&
      (minTransferAmount < 1 || minTransferAmount > 1000)
    ) {
      validationErrors.push(
        "Minimum transfer amount must be between 1 and 1000"
      );
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const settings = await ReferralSettings.getInstance();

    // Update only provided fields
    if (signupBonus !== undefined) settings.signupBonus = signupBonus;
    if (referralCommission !== undefined)
      settings.referralCommission = referralCommission;
    if (referralDepositBonus !== undefined)
      settings.referralDepositBonus = referralDepositBonus;
    if (maxCommissionLimit !== undefined)
      settings.maxCommissionLimit = maxCommissionLimit;
    if (minWithdrawAmount !== undefined)
      settings.minWithdrawAmount = minWithdrawAmount;
    if (minTransferAmount !== undefined)
      settings.minTransferAmount = minTransferAmount;

    await settings.save();

    console.log("✅ Referral settings updated:", {
      signupBonus: settings.signupBonus,
      referralCommission: settings.referralCommission,
      referralDepositBonus: settings.referralDepositBonus,
      minWithdrawAmount: settings.minWithdrawAmount,
      minTransferAmount: settings.minTransferAmount,
    });

    res.status(200).json({
      success: true,
      message: "Referral settings updated successfully",
      data: settings,
    });
  } catch (error: any) {
    console.error("Update referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user's referral info
// @route   GET /api/referral/info
// @access  Private
export const getReferralInfo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const user = await User.findById(req.user.id).select(
      "referralCode referredBy referralEarnings referredUsers"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Populate referred users with more details
    await user.populate(
      "referredUsers",
      "name email username createdAt status"
    );

    // Get referral transactions for this user to show earnings breakdown
    const transactions = await ReferralTransaction.find({
      referrer: req.user.id,
    })
      .populate("referee", "name email username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        totalReferrals: user.referredUsers.length,
        referralTransactions: transactions,
      },
    });
  } catch (error: any) {
    console.error("Get referral info error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user's referral transactions
// @route   GET /api/referral/transactions
// @access  Private
export const getReferralTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const transactions = await ReferralTransaction.find({
      $or: [{ referrer: req.user.id }, { referee: req.user.id }],
    })
      .populate("referrer", "name email")
      .populate("referee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    console.error("Get referral transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Generate referral code for user
// @route   POST /api/referral/generate-code
// @access  Private
export const generateReferralCodeForUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    // Get user details including name for code generation
    const existingUser = await User.findById(req.user.id).select(
      "referralCode name username"
    );

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if user already has a referral code
    if (existingUser.referralCode) {
      res.status(200).json({
        success: true,
        message: "Referral code already exists",
        data: {
          referralCode: existingUser.referralCode,
          shareUrl: `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/signup?ref=${existingUser.referralCode}`,
        },
      });
      return;
    }

    // Generate unique referral code using username or name
    const baseName = existingUser.username || existingUser.name || "USER";
    let referralCode = generateReferralCode(baseName);
    let userWithCode = await User.findOne({ referralCode });

    // Ensure uniqueness (max 10 attempts)
    let attempts = 0;
    while (userWithCode && attempts < 10) {
      referralCode = generateReferralCode(baseName);
      userWithCode = await User.findOne({ referralCode });
      attempts++;
    }

    // If still not unique after 10 attempts, use completely random code
    if (userWithCode) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Update user with the new referral code
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { referralCode },
      { new: true, runValidators: false }
    ).select("referralCode name");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Referral code generated successfully",
      data: {
        referralCode: updatedUser.referralCode,
        shareUrl: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/signup?ref=${updatedUser.referralCode}`,
        ownerName: updatedUser.name,
      },
    });
  } catch (error: any) {
    console.error("Generate referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update referral transaction status
// @route   PUT /api/referral/transactions/:id
// @access  Private/Admin
export const updateReferralTransactionStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "approved", "paid"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, approved, paid",
      });
      return;
    }

    const transaction = await ReferralTransaction.findById(id);
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    transaction.status = status;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction status updated",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Update referral transaction status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Withdraw referral earnings
// @route   POST /api/referral/withdraw
// @access  Private
export const withdrawReferralEarnings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const settings = await ReferralSettings.getInstance();
    if (!settings) {
      res.status(500).json({
        success: false,
        message: "Referral settings not found",
      });
      return;
    }

    // Check if user has enough earnings to withdraw
    if (user.referralEarnings < settings.minWithdrawAmount) {
      res.status(400).json({
        success: false,
        message: `Not enough balance to withdraw. Minimum amount is ${settings.minWithdrawAmount}`,
      });
      return;
    }

    // For now, we'll just reset the earnings
    // In a real implementation, you might want to integrate with a wallet system
    const withdrawalAmount = user.referralEarnings;
    user.referralEarnings = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal successful. ${withdrawalAmount} has been withdrawn.`,
      data: {
        amount: withdrawalAmount,
      },
    });
  } catch (error: any) {
    console.error("Withdraw referral earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Validate referral code
// @route   GET /api/referral/validate-code/:code
// @access  Public
export const validateReferralCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({
        success: false,
        message: "Referral code is required",
      });
      return;
    }

    const referrer = await User.findOne({ referralCode: code }).select(
      "name email referralCode"
    );

    if (!referrer) {
      res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Valid referral code",
      data: {
        referrerName: referrer.name,
        referralCode: referrer.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Validate referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all referral data for admin
// @route   GET /api/referral/admin/all
// @access  Private/Admin
export const getAllReferralData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get all users with referral codes and their referral data
    const usersWithReferrals = await User.find({
      referralCode: { $exists: true, $ne: null },
    })
      .select(
        "name email referralCode referralEarnings referredUsers createdAt"
      )
      .populate("referredUsers", "name email createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });

    // Get all referral transactions with details
    const transactions = await ReferralTransaction.find()
      .populate("referrer", "name email referralCode")
      .populate("referee", "name email")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 transactions

    // Calculate summary statistics
    const totalReferrals = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });
    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$referralEarnings" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithReferrals,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit,
        },
        summary: {
          totalUsersWithReferralCodes: totalUsers,
          totalReferrals,
          totalEarnings: totalEarnings[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Get all referral data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user's referral statistics
// @route   GET /api/referral/stats
// @access  Private
export const getReferralStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const user = await User.findById(req.user.id)
      .select("referralCode referralEarnings referredUsers")
      .populate("referredUsers", "name email createdAt");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get referral transactions for this user
    const transactions = await ReferralTransaction.find({
      referrer: req.user.id,
    })
      .populate("referee", "name email")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalReferrals = user.referredUsers.length;
    const totalEarnings = user.referralEarnings;
    const pendingEarnings = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const approvedEarnings = transactions
      .filter((t) => t.status === "approved")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals,
        totalEarnings,
        pendingEarnings,
        approvedEarnings,
        referredUsers: user.referredUsers,
        recentTransactions: transactions.slice(0, 10), // Last 10 transactions
      },
    });
  } catch (error: any) {
    console.error("Get referral stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Debug referral relationships
// @route   GET /api/referral/debug
// @access  Private/Admin
export const debugReferralRelationships = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    // Find user with referral code KARX5D
    const referrer = await User.findOne({ referralCode: "KARX5D" }).select(
      "name email referralCode referredUsers referralEarnings"
    );

    // Find user jamal@gmail.com
    const jamal = await User.findOne({ email: "jamal@gmail.com" }).select(
      "name email referredBy createdAt"
    );

    // Find all users who were referred by KARX5D
    const usersReferredByKARX5D = await User.find({
      referredBy: "KARX5D",
    }).select("name email referredBy createdAt");

    // Find referral transactions involving KARX5D
    const transactions = await ReferralTransaction.find({
      $or: [{ referrer: referrer?._id }, { referee: jamal?._id }],
    })
      .populate("referrer", "name email referralCode")
      .populate("referee", "name email");

    res.status(200).json({
      success: true,
      data: {
        referrer: referrer,
        jamal: jamal,
        usersReferredByKARX5D: usersReferredByKARX5D,
        transactions: transactions,
        debug: {
          referrerFound: !!referrer,
          jamalFound: !!jamal,
          jamalHasReferredBy: jamal?.referredBy === "KARX5D",
          referrerHasJamalInArray: referrer?.referredUsers?.some(
            (userId) => userId.toString() === jamal?._id?.toString()
          ),
        },
      },
    });
  } catch (error: any) {
    console.error("Debug referral relationships error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Fix JAM657 referral case
// @route   POST /api/referral/fix-jam657
// @access  Private/Admin
export const fixJAM657Referral = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔧 Fixing JAM657 referral case...");

    // Find the referrer with code JAM657 (jamal)
    const jamalReferrer = await User.findOne({ referralCode: "JAM657" });

    // Find all users who should be referred by JAM657
    const usersReferredByJAM657 = await User.find({ referredBy: "JAM657" });

    if (!jamalReferrer) {
      res.status(404).json({
        success: false,
        message: "Referrer with code JAM657 not found",
      });
      return;
    }

    let fixedCount = 0;
    let message = "";

    console.log(
      `Found ${usersReferredByJAM657.length} users referred by JAM657`
    );
    console.log(
      `Jamal's current referredUsers array has ${jamalReferrer.referredUsers.length} users`
    );

    // For each user referred by JAM657, ensure they're in jamal's referredUsers array
    for (const referredUser of usersReferredByJAM657) {
      const isAlreadyInArray = jamalReferrer.referredUsers.some(
        (userId) => userId.toString() === referredUser._id.toString()
      );

      if (!isAlreadyInArray) {
        jamalReferrer.referredUsers.push(referredUser._id);
        fixedCount++;
        console.log(
          `✅ Added ${
            referredUser.name || referredUser.email
          } to jamal's referredUsers`
        );
      }

      // Create referral transaction if it doesn't exist
      const existingTransaction = await ReferralTransaction.findOne({
        referrer: jamalReferrer._id,
        referee: referredUser._id,
      });

      if (!existingTransaction) {
        const settings = await ReferralSettings.getInstance();
        const commission = settings?.referralCommission || 25;

        const transaction = new ReferralTransaction({
          referrer: jamalReferrer._id,
          referee: referredUser._id,
          amount: commission,
          status: "approved",
        });
        await transaction.save();

        // Add commission to referrer
        jamalReferrer.referralEarnings += commission;
        console.log(
          `✅ Created transaction and added ${commission} commission`
        );
      }
    }

    // Save the updated referrer
    await jamalReferrer.save();

    message = `✅ Fixed JAM657 referral case. Added ${fixedCount} users to referredUsers array.`;

    // Get updated data
    const updatedReferrer = await User.findById(jamalReferrer._id)
      .select("name email referralCode referredUsers referralEarnings")
      .populate("referredUsers", "name email");

    res.status(200).json({
      success: true,
      message: message,
      data: {
        referrer: updatedReferrer,
        usersReferredByJAM657: usersReferredByJAM657,
        fixedCount: fixedCount,
      },
    });
  } catch (error: any) {
    console.error("Fix JAM657 referral error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Fix specific referral case (KARX5D and jamal@gmail.com)
// @route   POST /api/referral/fix-specific
// @access  Private/Admin
export const fixSpecificReferral = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔧 Fixing specific referral case: KARX5D and jamal@gmail.com");

    // Find the referrer with code KARX5D
    const referrer = await User.findOne({ referralCode: "KARX5D" });

    // Find jamal@gmail.com
    const jamal = await User.findOne({ email: "jamal@gmail.com" });

    if (!referrer) {
      res.status(404).json({
        success: false,
        message: "Referrer with code KARX5D not found",
      });
      return;
    }

    if (!jamal) {
      res.status(404).json({
        success: false,
        message: "User jamal@gmail.com not found",
      });
      return;
    }

    let fixed = false;
    let message = "";

    // Check if jamal has the referredBy field set
    if (jamal.referredBy !== "KARX5D") {
      jamal.referredBy = "KARX5D";
      await jamal.save();
      message += "✅ Set jamal's referredBy to KARX5D. ";
      fixed = true;
    }

    // Check if jamal is in referrer's referredUsers array
    const isAlreadyReferred = referrer.referredUsers.some(
      (userId) => userId.toString() === jamal._id.toString()
    );

    if (!isAlreadyReferred) {
      referrer.referredUsers.push(jamal._id);
      await referrer.save();
      message += "✅ Added jamal to referrer's referredUsers array. ";
      fixed = true;
    }

    // Create referral transaction if it doesn't exist
    const existingTransaction = await ReferralTransaction.findOne({
      referrer: referrer._id,
      referee: jamal._id,
    });

    if (!existingTransaction) {
      const settings = await ReferralSettings.getInstance();
      const commission = settings?.referralCommission || 25;

      const transaction = new ReferralTransaction({
        referrer: referrer._id,
        referee: jamal._id,
        amount: commission,
        status: "approved",
      });
      await transaction.save();

      // Add commission to referrer
      referrer.referralEarnings += commission;
      await referrer.save();

      message += `✅ Created referral transaction with ${commission} commission. `;
      fixed = true;
    }

    if (!fixed) {
      message = "ℹ️ No fixes needed - relationship already exists correctly.";
    }

    // Get updated data
    const updatedReferrer = await User.findById(referrer._id)
      .select("name email referralCode referredUsers referralEarnings")
      .populate("referredUsers", "name email");

    res.status(200).json({
      success: true,
      message: message,
      data: {
        referrer: updatedReferrer,
        jamal: {
          name: jamal.name,
          email: jamal.email,
          referredBy: jamal.referredBy,
        },
        fixed: fixed,
      },
    });
  } catch (error: any) {
    console.error("Fix specific referral error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Fix referral relationships (sync referredUsers arrays)
// @route   POST /api/referral/fix-relationships
// @access  Private/Admin
export const fixReferralRelationships = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔧 Starting referral relationship fix...");

    // Find all users who were referred by someone
    const referredUsers = await User.find({
      referredBy: { $exists: true, $ne: null },
    }).select("_id name email referredBy");

    let fixedCount = 0;
    let errorCount = 0;

    for (const referredUser of referredUsers) {
      try {
        // Find the referrer
        const referrer = await User.findOne({
          referralCode: referredUser.referredBy,
        });

        if (referrer) {
          // Check if this user is already in referrer's referredUsers array
          const isAlreadyReferred = referrer.referredUsers.some(
            (userId) => userId.toString() === referredUser._id.toString()
          );

          if (!isAlreadyReferred) {
            // Add the referred user to referrer's array
            referrer.referredUsers.push(referredUser._id);
            await referrer.save();
            fixedCount++;
            console.log(
              `✅ Fixed: Added ${referredUser.name} to ${referrer.name}'s referredUsers`
            );
          }
        } else {
          console.log(
            `⚠️ Warning: Referrer not found for code ${referredUser.referredBy}`
          );
        }
      } catch (error) {
        console.error(`❌ Error processing ${referredUser.name}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: "Referral relationships fix completed",
      data: {
        totalProcessed: referredUsers.length,
        fixedCount,
        errorCount,
      },
    });
  } catch (error: any) {
    console.error("Fix referral relationships error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get referral analytics for admin dashboard
// @route   GET /api/referral/analytics
// @access  Private/Admin
export const getReferralAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    // Get current date for time-based analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Total referrals count
    const totalReferrals = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });

    // Total users with referral codes
    const totalReferrers = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });

    // Total commissions paid
    const totalCommissionsPaid = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$referralEarnings" } } },
    ]);

    // Pending transactions
    const pendingTransactions = await ReferralTransaction.countDocuments({
      status: "pending",
    });

    // Approved transactions
    const approvedTransactions = await ReferralTransaction.countDocuments({
      status: "approved",
    });

    // Paid transactions
    const paidTransactions = await ReferralTransaction.countDocuments({
      status: "paid",
    });

    // Monthly referrals
    const monthlyReferrals = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
      createdAt: { $gte: startOfMonth },
    });

    // Weekly referrals
    const weeklyReferrals = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
      createdAt: { $gte: startOfWeek },
    });

    // Top referrers (users with most referrals)
    const topReferrers = await User.aggregate([
      {
        $match: {
          referralCode: { $exists: true, $ne: null },
          referredUsers: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          referralCode: 1,
          referralEarnings: 1,
          referralCount: { $size: "$referredUsers" },
        },
      },
      { $sort: { referralCount: -1 } },
      { $limit: 10 },
    ]);

    // Recent transactions
    const recentTransactions = await ReferralTransaction.find()
      .populate("referrer", "name email referralCode")
      .populate("referee", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly transaction amounts
    const monthlyTransactionAmounts = await ReferralTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReferrals,
          totalReferrers,
          totalCommissionsPaid: totalCommissionsPaid[0]?.total || 0,
          pendingTransactions,
          approvedTransactions,
          paidTransactions,
        },
        timeBasedStats: {
          monthlyReferrals,
          weeklyReferrals,
          monthlyTransactionAmounts,
        },
        topReferrers,
        recentTransactions,
      },
    });
  } catch (error: any) {
    console.error("Get referral analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Fix JKDII8 referral relationships
// @route   POST /api/referral/fix-jkdii8
// @access  Private/Admin
export const fixJKDII8Referral = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔧 Fixing JKDII8 referral relationships...");

    // Find the referrer with code JKDII8 (f@gmail.com)
    const referrer = await User.findOne({ referralCode: "JKDII8" });

    if (!referrer) {
      res.status(404).json({
        success: false,
        message: "Referrer with code JKDII8 not found",
      });
      return;
    }

    // Find all users who were referred by JKDII8
    const usersReferredByJKDII8 = await User.find({ referredBy: "JKDII8" });

    let fixedCount = 0;
    let transactionsCreated = 0;
    let message = "";

    console.log(
      `Found ${usersReferredByJKDII8.length} users referred by JKDII8`
    );
    console.log(
      `Referrer's current referredUsers array has ${referrer.referredUsers.length} users`
    );

    // For each user referred by JKDII8, ensure they're in referrer's referredUsers array
    for (const referredUser of usersReferredByJKDII8) {
      const isAlreadyInArray = referrer.referredUsers.some(
        (userId) => userId.toString() === referredUser._id.toString()
      );

      if (!isAlreadyInArray) {
        referrer.referredUsers.push(referredUser._id);
        fixedCount++;
        console.log(
          `✅ Added ${
            referredUser.name || referredUser.email
          } to referrer's referredUsers`
        );
      }

      // Create referral transaction if it doesn't exist
      const existingTransaction = await ReferralTransaction.findOne({
        referrer: referrer._id,
        referee: referredUser._id,
      });

      if (!existingTransaction) {
        const settings = await ReferralSettings.getInstance();
        const commission = settings?.referralCommission || 25;

        const transaction = new ReferralTransaction({
          referrer: referrer._id,
          referee: referredUser._id,
          amount: commission,
          status: "approved",
        });
        await transaction.save();

        // Add commission to referrer
        referrer.referralEarnings += commission;
        transactionsCreated++;
        console.log(
          `✅ Created transaction and added ${commission} commission for ${referredUser.name}`
        );
      }
    }

    // Save the updated referrer
    await referrer.save();

    message = `✅ Fixed JKDII8 referral case. Added ${fixedCount} users to referredUsers array and created ${transactionsCreated} transactions.`;

    // Get updated data
    const updatedReferrer = await User.findById(referrer._id)
      .select("name email referralCode referredUsers referralEarnings")
      .populate("referredUsers", "name email createdAt");

    res.status(200).json({
      success: true,
      message: message,
      data: {
        referrer: updatedReferrer,
        usersReferredByJKDII8: usersReferredByJKDII8,
        fixedCount: fixedCount,
        transactionsCreated: transactionsCreated,
      },
    });
  } catch (error: any) {
    console.error("Fix JKDII8 referral error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Debug specific referral code relationships
// @route   GET /api/referral/debug/:code
// @access  Private/Admin
export const debugSpecificReferralCode = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { code } = req.params;
    console.log(`🔍 Debugging referral code: ${code}`);

    // Find the referrer with this code
    const referrer = await User.findOne({ referralCode: code })
      .select(
        "name email referralCode referredUsers referralEarnings createdAt"
      )
      .populate("referredUsers", "name email createdAt referredBy");

    // Find all users who were referred by this code
    const usersReferredByCode = await User.find({ referredBy: code }).select(
      "name email referredBy createdAt"
    );

    // Find all transactions for this referrer
    const transactions = await ReferralTransaction.find({
      $or: [
        { referrer: referrer?._id },
        { referee: { $in: usersReferredByCode.map((u) => u._id) } },
      ],
    })
      .populate("referrer", "name email referralCode")
      .populate("referee", "name email");

    const debugInfo = {
      referralCode: code,
      referrer: referrer
        ? {
            id: referrer._id,
            name: referrer.name,
            email: referrer.email,
            referralEarnings: referrer.referralEarnings,
            createdAt: referrer.createdAt,
            referredUsersInArray: referrer.referredUsers.length,
            referredUsersDetails: referrer.referredUsers,
          }
        : null,
      usersWithReferredByField: {
        count: usersReferredByCode.length,
        users: usersReferredByCode,
      },
      transactions: {
        count: transactions.length,
        details: transactions,
      },
      inconsistencies: [],
    };

    // Check for inconsistencies
    if (referrer) {
      // Check if all users with referredBy field are in referrer's array
      for (const user of usersReferredByCode) {
        const isInArray = referrer.referredUsers.some(
          (refUser: any) => refUser._id.toString() === user._id.toString()
        );
        if (!isInArray) {
          debugInfo.inconsistencies.push({
            type: "missing_in_array",
            message: `User ${user.name} (${user.email}) has referredBy=${code} but is not in referrer's referredUsers array`,
          });
        }
      }

      // Check if all users in referrer's array have correct referredBy field
      for (const refUser of referrer.referredUsers) {
        if ((refUser as any).referredBy !== code) {
          debugInfo.inconsistencies.push({
            type: "incorrect_referredBy",
            message: `User ${
              (refUser as any).name
            } is in referrer's array but has referredBy=${
              (refUser as any).referredBy
            } instead of ${code}`,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Debug information for referral code ${code}`,
      data: debugInfo,
    });
  } catch (error: any) {
    console.error("Debug specific referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get users who used a specific referral code
// @route   GET /api/referral/users-by-code/:code
// @access  Private/Admin
export const getUsersByReferralCode = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;

    // Find all users who used this referral code
    const usersWhoUsedCode = await User.find({ referredBy: code })
      .select("name email username createdAt referredBy")
      .sort({ createdAt: -1 });

    // Find the referrer (owner of this code)
    const referrer = await User.findOne({ referralCode: code }).select(
      "name email username referralCode"
    );

    res.status(200).json({
      success: true,
      message: `Found ${usersWhoUsedCode.length} users who used referral code ${code}`,
      data: {
        referralCode: code,
        referrer: referrer
          ? {
              name: referrer.name,
              email: referrer.email,
              username: referrer.username,
            }
          : null,
        usersWhoUsedThisCode: usersWhoUsedCode,
        totalCount: usersWhoUsedCode.length,
      },
    });
  } catch (error: any) {
    console.error("Get users by referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get all referral codes and their referred users
// @route   GET /api/referral/all-codes-with-users
// @access  Private/Admin
export const getAllReferralCodesWithUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("� API CnALL: /api/referral/all-codes-with-users");
    console.log("👤 Request user:", req.user);
    console.log("✅ User is admin, proceeding...");
    console.log("📋 Getting all referral codes with their referred users...");

    // Find all users who have referral codes
    const usersWithReferralCodes = await User.find({
      referralCode: { $exists: true, $ne: null },
    })
      .select(
        "name email referralCode referredUsers referralEarnings createdAt"
      )
      .populate("referredUsers", "name email createdAt referredBy")
      .sort({ createdAt: -1 });

    console.log(
      `🔍 Found ${usersWithReferralCodes.length} users with referral codes:`
    );
    usersWithReferralCodes.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.name} (${user.email}) - Code: ${
          user.referralCode
        }`
      );
    });

    // Build the response data
    const referralData = [];

    for (const user of usersWithReferralCodes) {
      console.log(
        `\n🔄 Processing referrer: ${user.name} (${user.referralCode})`
      );

      // Find all users who signed up with this referral code
      const usersReferredByThisCode = await User.find({
        referredBy: user.referralCode,
      }).select("name email createdAt referredBy");

      console.log(
        `  📊 Users with referredBy="${user.referralCode}": ${usersReferredByThisCode.length}`
      );
      usersReferredByThisCode.forEach((refUser, idx) => {
        console.log(`    ${idx + 1}. ${refUser.name} (${refUser.email})`);
      });

      // Get referral transactions for this referrer
      const transactions = await ReferralTransaction.find({
        referrer: user._id,
      }).populate("referee", "name email");

      console.log(
        `  💰 Transactions for this referrer: ${transactions.length}`
      );

      const referralInfo = {
        referrer: {
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          referralEarnings: user.referralEarnings,
          createdAt: user.createdAt,
        },
        referredUsers: {
          fromReferredByField: {
            count: usersReferredByThisCode.length,
            users: usersReferredByThisCode,
          },
          fromReferredUsersArray: {
            count: user.referredUsers.length,
            users: user.referredUsers,
          },
        },
        transactions: {
          count: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          details: transactions,
        },
        // Check for inconsistencies
        isConsistent:
          usersReferredByThisCode.length === user.referredUsers.length,
      };

      console.log(`  ✅ Referral info created for ${user.name}`);
      console.log(
        `     - ReferredBy field count: ${usersReferredByThisCode.length}`
      );
      console.log(
        `     - ReferredUsers array count: ${user.referredUsers.length}`
      );
      console.log(`     - Is consistent: ${referralInfo.isConsistent}`);

      referralData.push(referralInfo);
    }

    // Calculate summary statistics
    const totalReferredUsersCount = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });

    console.log(
      `📈 Total referred users in database: ${totalReferredUsersCount}`
    );

    const summary = {
      totalReferrers: usersWithReferralCodes.length,
      totalReferredUsers: totalReferredUsersCount,
      totalEarnings: usersWithReferralCodes.reduce(
        (sum, user) => sum + (user.referralEarnings || 0),
        0
      ),
      inconsistentReferrers: referralData.filter((r) => !r.isConsistent).length,
    };

    console.log("📊 SUMMARY:", summary);

    const responseData = {
      success: true,
      message: `Found ${referralData.length} users with referral codes`,
      data: {
        summary,
        referralCodes: referralData,
      },
    };

    console.log("📤 SENDING RESPONSE:");
    console.log("Response message:", responseData.message);
    console.log("Response data summary:", responseData.data.summary);
    console.log(
      "Number of referral codes in response:",
      responseData.data.referralCodes.length
    );

    res.status(200).json(responseData);
  } catch (error: any) {
    console.error("❌ ERROR in getAllReferralCodesWithUsers:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Debug all users and their referral data
// @route   GET /api/referral/debug-all-users
// @access  Private/Admin
export const debugAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("🔍 DEBUG: Getting ALL users and their referral data...");

    // Get ALL users from database
    const allUsers = await User.find({})
      .select(
        "name email referralCode referredBy referredUsers referralEarnings createdAt"
      )
      .sort({ createdAt: -1 });

    console.log(`📊 Total users in database: ${allUsers.length}`);

    // Categorize users
    const usersWithReferralCodes = allUsers.filter((user) => user.referralCode);
    const usersWithReferredBy = allUsers.filter((user) => user.referredBy);
    const usersWithReferredUsers = allUsers.filter(
      (user) => user.referredUsers && user.referredUsers.length > 0
    );

    console.log(
      `👥 Users with referral codes: ${usersWithReferralCodes.length}`
    );
    console.log(
      `🎯 Users with referredBy field: ${usersWithReferredBy.length}`
    );
    console.log(
      `📋 Users with referredUsers array: ${usersWithReferredUsers.length}`
    );

    // Log each user's details
    console.log("\n📋 ALL USERS DETAILS:");
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - Referral Code: ${user.referralCode || "None"}`);
      console.log(`   - Referred By: ${user.referredBy || "None"}`);
      console.log(
        `   - Referred Users Count: ${user.referredUsers?.length || 0}`
      );
      console.log(`   - Referral Earnings: ${user.referralEarnings || 0}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log("");
    });

    // Check for specific referral code JKDII8
    console.log("\n🎯 SPECIFIC CHECK FOR JKDII8:");
    const jkdii8Referrer = allUsers.find(
      (user) => user.referralCode === "JKDII8"
    );
    const jkdii8Referred = allUsers.filter(
      (user) => user.referredBy === "JKDII8"
    );

    console.log(
      `Referrer with JKDII8: ${
        jkdii8Referrer
          ? jkdii8Referrer.name + " (" + jkdii8Referrer.email + ")"
          : "Not found"
      }`
    );
    console.log(`Users referred by JKDII8: ${jkdii8Referred.length}`);
    jkdii8Referred.forEach((user, idx) => {
      console.log(
        `  ${idx + 1}. ${user.name} (${user.email}) - Created: ${
          user.createdAt
        }`
      );
    });

    const responseData = {
      totalUsers: allUsers.length,
      usersWithReferralCodes: usersWithReferralCodes.length,
      usersWithReferredBy: usersWithReferredBy.length,
      usersWithReferredUsers: usersWithReferredUsers.length,
      allUsers: allUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referredUsersCount: user.referredUsers?.length || 0,
        referralEarnings: user.referralEarnings,
        createdAt: user.createdAt,
      })),
      jkdii8Analysis: {
        referrer: jkdii8Referrer
          ? {
              name: jkdii8Referrer.name,
              email: jkdii8Referrer.email,
              referredUsersCount: jkdii8Referrer.referredUsers?.length || 0,
            }
          : null,
        referredUsers: jkdii8Referred.map((user) => ({
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        })),
      },
    };

    res.status(200).json({
      success: true,
      message: `Debug complete - found ${allUsers.length} total users`,
      data: responseData,
    });
  } catch (error: any) {
    console.error("❌ ERROR in debugAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Test referral code validation
// @route   GET /api/referral/test-code/:code
// @access  Public (for testing)
export const testReferralCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    console.log(`🧪 Testing referral code: ${code}`);

    // Find the referrer with this code
    const referrer = await User.findOne({ referralCode: code });

    if (referrer) {
      console.log(`✅ Referral code ${code} is valid`);
      console.log(`   Belongs to: ${referrer.name} (${referrer.email})`);
      console.log(
        `   Current referred users: ${referrer.referredUsers?.length || 0}`
      );

      res.status(200).json({
        success: true,
        message: "Referral code is valid",
        data: {
          isValid: true,
          referrer: {
            name: referrer.name,
            email: referrer.email,
            referralCode: referrer.referralCode,
            currentReferredCount: referrer.referredUsers?.length || 0,
          },
        },
      });
    } else {
      console.log(`❌ Referral code ${code} is invalid`);
      res.status(404).json({
        success: false,
        message: "Invalid referral code",
        data: {
          isValid: false,
          referrer: null,
        },
      });
    }
  } catch (error: any) {
    console.error("❌ ERROR in testReferralCode:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get referral relationship for a specific user
// @route   GET /api/referral/user-relationship/:email
// @access  Private/Admin
export const getUserReferralRelationship = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { email } = req.params;
    console.log(`🔍 Getting referral relationship for: ${email}`);

    // Find the user
    const user = await User.findOne({ email })
      .select(
        "name email referredBy referralCode referredUsers referralEarnings createdAt"
      )
      .populate("referredUsers", "name email createdAt");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Find who referred this user (if anyone)
    let referrerInfo = null;
    if (user.referredBy) {
      const referrer = await User.findOne({
        referralCode: user.referredBy,
      }).select("name email referralCode referralEarnings");
      referrerInfo = referrer;
    }

    // Find all users this user has referred
    const usersReferredByThisUser = await User.find({
      referredBy: user.referralCode,
    }).select("name email createdAt");

    // Get transactions
    const transactionsAsReferrer = await ReferralTransaction.find({
      referrer: user._id,
    }).populate("referee", "name email");

    const transactionsAsReferee = await ReferralTransaction.find({
      referee: user._id,
    }).populate("referrer", "name email referralCode");

    const relationshipData = {
      user: {
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        createdAt: user.createdAt,
      },
      wasReferredBy: {
        referralCode: user.referredBy,
        referrerInfo: referrerInfo,
        hasReferrer: !!referrerInfo,
      },
      hasReferred: {
        count: usersReferredByThisUser.length,
        users: usersReferredByThisUser,
        inReferredUsersArray: user.referredUsers.length,
        isConsistent:
          usersReferredByThisUser.length === user.referredUsers.length,
      },
      transactions: {
        asReferrer: {
          count: transactionsAsReferrer.length,
          details: transactionsAsReferrer,
        },
        asReferee: {
          count: transactionsAsReferee.length,
          details: transactionsAsReferee,
        },
      },
    };

    console.log(
      "📊 Relationship data:",
      JSON.stringify(relationshipData, null, 2)
    );

    res.status(200).json({
      success: true,
      message: `Referral relationship for ${email}`,
      data: relationshipData,
    });
  } catch (error: any) {
    console.error("Get user referral relationship error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get detailed referral settings for admin
// @route   GET /api/referral/admin/settings
// @access  Private/Admin
export const getAdminReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const settings = await ReferralSettings.getInstance();

    // Get some statistics
    const totalReferrers = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });

    const totalReferredUsers = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });

    const totalEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$referralEarnings" } } },
    ]);

    const pendingTransactions = await ReferralTransaction.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Referral settings retrieved successfully",
      data: {
        settings: {
          signupBonus: settings.signupBonus,
          referralCommission: settings.referralCommission,
          referralDepositBonus: settings.referralDepositBonus,
          minWithdrawAmount: settings.minWithdrawAmount,
          minTransferAmount: settings.minTransferAmount,
          maxCommissionLimit: settings.maxCommissionLimit,
          updatedAt: settings.updatedAt,
        },
        statistics: {
          totalReferrers,
          totalReferredUsers,
          totalEarnings: totalEarnings[0]?.total || 0,
          pendingTransactions,
        },
        fieldDescriptions: {
          signupBonus:
            "Bonus amount given to new users when they sign up with a referral code",
          referralCommission:
            "Commission amount given to referrer when someone signs up with their code",
          referralDepositBonus:
            "Bonus amount given to referrer when referred user makes their first deposit",
          minWithdrawAmount:
            "Minimum amount required to withdraw referral earnings",
          minTransferAmount: "Minimum amount for referral transfers",
          maxCommissionLimit: "Maximum commission limit per referrer",
        },
      },
    });
  } catch (error: any) {
    console.error("Get admin referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get individual user referral settings
// @route   GET /api/referral/user-settings/:userId
// @access  Private/Admin
export const getUserReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { userId } = req.params;
    console.log(`🔍 Getting referral settings for user: ${userId}`);

    const user = await User.findById(userId).select(
      "name email individualReferralSettings referralCode referralEarnings referredUsers"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get global settings for comparison
    const globalSettings = await ReferralSettings.getInstance();

    // Determine effective settings (individual or global)
    const effectiveSettings = user.individualReferralSettings.useGlobalSettings
      ? {
          signupBonus: globalSettings.signupBonus,
          referralCommission: globalSettings.referralCommission,
          referralDepositBonus: globalSettings.referralDepositBonus,
          minWithdrawAmount: globalSettings.minWithdrawAmount,
          minTransferAmount: globalSettings.minTransferAmount,
          maxCommissionLimit: globalSettings.maxCommissionLimit,
          useGlobalSettings: true,
        }
      : user.individualReferralSettings;

    res.status(200).json({
      success: true,
      message: `Referral settings for ${user.name}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          referralEarnings: user.referralEarnings,
          totalReferrals: user.referredUsers.length,
        },
        individualSettings: user.individualReferralSettings,
        effectiveSettings: effectiveSettings,
        globalSettings: {
          signupBonus: globalSettings.signupBonus,
          referralCommission: globalSettings.referralCommission,
          referralDepositBonus: globalSettings.referralDepositBonus,
          minWithdrawAmount: globalSettings.minWithdrawAmount,
          minTransferAmount: globalSettings.minTransferAmount,
          maxCommissionLimit: globalSettings.maxCommissionLimit,
        },
      },
    });
  } catch (error: any) {
    console.error("Get user referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update individual user referral settings
// @route   PUT /api/referral/user-settings/:userId
// @access  Private/Admin
export const updateUserReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { userId } = req.params;
    const {
      signupBonus,
      referralCommission,
      referralDepositBonus,
      minWithdrawAmount,
      minTransferAmount,
      maxCommissionLimit,
      useGlobalSettings,
    } = req.body;

    console.log(`🔧 Updating referral settings for user: ${userId}`, req.body);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Validate the input values
    const validationErrors = [];

    if (signupBonus !== undefined && (signupBonus < 0 || signupBonus > 1000)) {
      validationErrors.push("Signup bonus must be between 0 and 1000");
    }

    if (
      referralCommission !== undefined &&
      (referralCommission < 0 || referralCommission > 100)
    ) {
      validationErrors.push("Referral commission must be between 0 and 100");
    }

    if (
      referralDepositBonus !== undefined &&
      (referralDepositBonus < 0 || referralDepositBonus > 1000)
    ) {
      validationErrors.push(
        "Referral deposit bonus must be between 0 and 1000"
      );
    }

    if (
      minWithdrawAmount !== undefined &&
      (minWithdrawAmount < 1 || minWithdrawAmount > 10000)
    ) {
      validationErrors.push(
        "Minimum withdraw amount must be between 1 and 10000"
      );
    }

    if (
      minTransferAmount !== undefined &&
      (minTransferAmount < 1 || minTransferAmount > 1000)
    ) {
      validationErrors.push(
        "Minimum transfer amount must be between 1 and 1000"
      );
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    // Update individual settings
    if (useGlobalSettings !== undefined) {
      user.individualReferralSettings.useGlobalSettings = useGlobalSettings;
    }

    // Only update individual values if not using global settings
    if (!user.individualReferralSettings.useGlobalSettings) {
      if (signupBonus !== undefined)
        user.individualReferralSettings.signupBonus = signupBonus;
      if (referralCommission !== undefined)
        user.individualReferralSettings.referralCommission = referralCommission;
      if (referralDepositBonus !== undefined)
        user.individualReferralSettings.referralDepositBonus =
          referralDepositBonus;
      if (minWithdrawAmount !== undefined)
        user.individualReferralSettings.minWithdrawAmount = minWithdrawAmount;
      if (minTransferAmount !== undefined)
        user.individualReferralSettings.minTransferAmount = minTransferAmount;
      if (maxCommissionLimit !== undefined)
        user.individualReferralSettings.maxCommissionLimit = maxCommissionLimit;
    }

    await user.save();

    console.log(
      `✅ Updated referral settings for ${user.name}:`,
      user.individualReferralSettings
    );

    res.status(200).json({
      success: true,
      message: `Referral settings updated for ${user.name}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        updatedSettings: user.individualReferralSettings,
      },
    });
  } catch (error: any) {
    console.error("Update user referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all users with their referral settings
// @route   GET /api/referral/all-users-settings
// @access  Private/Admin
export const getAllUsersReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    console.log("📋 Getting all users with their referral settings...");

    // Parse pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get users with referral codes
    const users = await User.find({
      referralCode: { $exists: true, $ne: null },
    })
      .select(
        "name email referralCode referralEarnings referredUsers individualReferralSettings createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });

    // Get global settings
    const globalSettings = await ReferralSettings.getInstance();

    // Process each user's effective settings
    const usersWithSettings = users.map((user) => {
      const effectiveSettings = user.individualReferralSettings
        .useGlobalSettings
        ? {
            signupBonus: globalSettings.signupBonus,
            referralCommission: globalSettings.referralCommission,
            referralDepositBonus: globalSettings.referralDepositBonus,
            minWithdrawAmount: globalSettings.minWithdrawAmount,
            minTransferAmount: globalSettings.minTransferAmount,
            maxCommissionLimit: globalSettings.maxCommissionLimit,
            useGlobalSettings: true,
          }
        : user.individualReferralSettings;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        totalReferrals: user.referredUsers.length,
        individualSettings: user.individualReferralSettings,
        effectiveSettings: effectiveSettings,
        createdAt: user.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: `Found ${users.length} users with referral codes`,
      data: {
        users: usersWithSettings,
        globalSettings: {
          signupBonus: globalSettings.signupBonus,
          referralCommission: globalSettings.referralCommission,
          referralDepositBonus: globalSettings.referralDepositBonus,
          minWithdrawAmount: globalSettings.minWithdrawAmount,
          minTransferAmount: globalSettings.minTransferAmount,
          maxCommissionLimit: globalSettings.maxCommissionLimit,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Get all users referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Test login with referral settings logic
// @route   POST /api/referral/test-login
// @access  Public (for testing)
export const testLoginWithReferralSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required for testing",
      });
      return;
    }

    // Find the user
    const user = await User.findOne({ email }).select(
      "name email referredBy referralCode referralEarnings referredUsers"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Apply the same logic as in login
    let referralSettings = null;
    let referralSettingsSource = "none";

    if (user.referredBy) {
      // User was referred by someone, check if referrer has individual settings
      const referrer = await User.findOne({ referralCode: user.referredBy });

      if (referrer && !referrer.individualReferralSettings.useGlobalSettings) {
        // Referrer has individual settings, use those
        referralSettings = {
          signupBonus: referrer.individualReferralSettings.signupBonus,
          referralCommission:
            referrer.individualReferralSettings.referralCommission,
          referralDepositBonus:
            referrer.individualReferralSettings.referralDepositBonus,
          minWithdrawAmount:
            referrer.individualReferralSettings.minWithdrawAmount,
          minTransferAmount:
            referrer.individualReferralSettings.minTransferAmount,
          maxCommissionLimit:
            referrer.individualReferralSettings.maxCommissionLimit,
        };
        referralSettingsSource = `individual (from ${referrer.name})`;
      } else if (referrer) {
        // Referrer exists but uses global settings
        const globalSettings = await ReferralSettings.getInstance();
        referralSettings = {
          signupBonus: globalSettings.signupBonus,
          referralCommission: globalSettings.referralCommission,
          referralDepositBonus: globalSettings.referralDepositBonus,
          minWithdrawAmount: globalSettings.minWithdrawAmount,
          minTransferAmount: globalSettings.minTransferAmount,
          maxCommissionLimit: globalSettings.maxCommissionLimit,
        };
        referralSettingsSource = `global (referrer ${referrer.name} uses global)`;
      } else {
        referralSettingsSource = "referrer not found";
      }
    }

    res.status(200).json({
      success: true,
      message: "Test completed",
      data: {
        user: {
          name: user.name,
          email: user.email,
          referredBy: user.referredBy,
          referralCode: user.referralCode,
        },
        referralSettings,
        referralSettingsSource,
        explanation: {
          wasReferred: !!user.referredBy,
          hasReferralSettings: !!referralSettings,
          logic: user.referredBy
            ? "User was referred, checking referrer's settings"
            : "User was not referred, no referral settings provided",
        },
      },
    });
  } catch (error: any) {
    console.error("Test login with referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Get comprehensive referral system overview for admin
// @route   GET /api/referral/admin/system-overview
// @access  Private/Admin
export const getReferralSystemOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    // Get global settings
    const globalSettings = await ReferralSettings.getInstance();

    // Get users with individual settings
    const usersWithIndividualSettings = await User.find({
      "individualReferralSettings.useGlobalSettings": false,
    }).select(
      "name email referralCode individualReferralSettings referredUsers referralEarnings"
    );

    // Get total statistics
    const totalUsers = await User.countDocuments();
    const totalReferredUsers = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
    });
    const totalUsersWithReferralCodes = await User.countDocuments({
      referralCode: { $exists: true, $ne: null },
    });

    res.status(200).json({
      success: true,
      data: {
        globalSettings: {
          ...globalSettings.toObject(),
          description: {
            signupBonus: "Amount referrer gets when someone uses their code",
            referralCommission: "Commission rate new users earn on activities",
            referralDepositBonus: "Bonus new users get on first deposit",
            minWithdrawAmount: "Minimum withdrawal amount for users",
            minTransferAmount: "Minimum transfer amount for users",
            maxCommissionLimit: "Maximum commission users can earn",
          },
        },
        usersWithIndividualSettings: usersWithIndividualSettings.map(
          (user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            referralCode: user.referralCode,
            totalReferred: user.referredUsers.length,
            totalEarnings: user.referralEarnings,
            settings: user.individualReferralSettings,
          })
        ),
        statistics: {
          totalUsers,
          totalReferredUsers,
          totalUsersWithReferralCodes,
          usersWithIndividualSettings: usersWithIndividualSettings.length,
          percentageReferred: ((totalReferredUsers / totalUsers) * 100).toFixed(
            2
          ),
        },
        systemExplanation: {
          howItWorks: [
            "1. When User A sets individual referral settings, those settings control what happens when someone uses User A's referral code",
            "2. signupBonus: User A gets this amount when someone signs up with their code",
            "3. referralCommission: The new user gets this commission rate on their activities",
            "4. referralDepositBonus: The new user gets this bonus on their first deposit",
            "5. minWithdrawAmount/minTransferAmount/maxCommissionLimit: Apply to the new user's account",
            "6. If User A uses global settings, then global values are used instead",
          ],
          adminControls: [
            "Set global default settings for all users",
            "Override individual user settings",
            "View all referral relationships and earnings",
            "Monitor referral system performance",
          ],
        },
      },
    });
  } catch (error: any) {
    console.error("Get referral system overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Set individual referral settings for a user (comprehensive)
// @route   PUT /api/referral/admin/user-settings/:userId
// @access  Private/Admin
export const setComprehensiveUserReferralSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { userId } = req.params;
    const {
      signupBonus,
      referralCommission,
      referralDepositBonus,
      minWithdrawAmount,
      minTransferAmount,
      maxCommissionLimit,
      useGlobalSettings,
    } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Validate input values
    const validationErrors = [];

    if (signupBonus !== undefined && (signupBonus < 0 || signupBonus > 10000)) {
      validationErrors.push("Signup bonus must be between 0 and 10000");
    }

    if (
      referralCommission !== undefined &&
      (referralCommission < 0 || referralCommission > 100)
    ) {
      validationErrors.push("Referral commission must be between 0 and 100");
    }

    if (
      referralDepositBonus !== undefined &&
      (referralDepositBonus < 0 || referralDepositBonus > 10000)
    ) {
      validationErrors.push(
        "Referral deposit bonus must be between 0 and 10000"
      );
    }

    if (
      minWithdrawAmount !== undefined &&
      (minWithdrawAmount < 1 || minWithdrawAmount > 100000)
    ) {
      validationErrors.push(
        "Minimum withdraw amount must be between 1 and 100000"
      );
    }

    if (
      minTransferAmount !== undefined &&
      (minTransferAmount < 1 || minTransferAmount > 10000)
    ) {
      validationErrors.push(
        "Minimum transfer amount must be between 1 and 10000"
      );
    }

    if (
      maxCommissionLimit !== undefined &&
      (maxCommissionLimit < 1 || maxCommissionLimit > 1000000)
    ) {
      validationErrors.push(
        "Maximum commission limit must be between 1 and 1000000"
      );
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    // Update user's individual settings
    if (signupBonus !== undefined)
      user.individualReferralSettings.signupBonus = signupBonus;
    if (referralCommission !== undefined)
      user.individualReferralSettings.referralCommission = referralCommission;
    if (referralDepositBonus !== undefined)
      user.individualReferralSettings.referralDepositBonus =
        referralDepositBonus;
    if (minWithdrawAmount !== undefined)
      user.individualReferralSettings.minWithdrawAmount = minWithdrawAmount;
    if (minTransferAmount !== undefined)
      user.individualReferralSettings.minTransferAmount = minTransferAmount;
    if (maxCommissionLimit !== undefined)
      user.individualReferralSettings.maxCommissionLimit = maxCommissionLimit;
    if (useGlobalSettings !== undefined)
      user.individualReferralSettings.useGlobalSettings = useGlobalSettings;

    await user.save();

    // Get affected users (users who were referred by this user)
    const affectedUsers = await User.find({
      referredBy: user.referralCode,
    }).select("name email");

    res.status(200).json({
      success: true,
      message: `Referral settings updated for ${user.name}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
        },
        updatedSettings: user.individualReferralSettings,
        affectedUsers: affectedUsers.map((u) => ({
          name: u.name,
          email: u.email,
        })),
        explanation: {
          signupBonus: `${user.name} will get ${user.individualReferralSettings.signupBonus} when someone uses their referral code`,
          referralCommission: `New users referred by ${user.name} will earn ${user.individualReferralSettings.referralCommission}% commission`,
          referralDepositBonus: `New users referred by ${user.name} will get ${user.individualReferralSettings.referralDepositBonus} bonus on first deposit`,
          affectedUsersCount: affectedUsers.length,
          note: useGlobalSettings
            ? "User is using global settings, individual settings are ignored"
            : "User is using individual settings",
        },
      },
    });
  } catch (error: any) {
    console.error("Set comprehensive user referral settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get referral impact analysis for a user
// @route   GET /api/referral/admin/impact-analysis/:userId
// @access  Private/Admin
export const getReferralImpactAnalysis = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
      return;
    }

    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "referredUsers",
      "name email referralEarnings createdAt"
    );
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get referral transactions
    const transactions = await ReferralTransaction.find({
      referrer: userId,
    }).populate("referee", "name email");

    // Calculate impact
    const totalEarningsFromReferrals = user.referralEarnings;
    const totalUsersReferred = user.referredUsers.length;
    const totalTransactionValue = transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
        },
        currentSettings: user.individualReferralSettings,
        impact: {
          totalUsersReferred,
          totalEarningsFromReferrals,
          totalTransactionValue,
          averageEarningPerReferral:
            totalUsersReferred > 0
              ? (totalEarningsFromReferrals / totalUsersReferred).toFixed(2)
              : 0,
        },
        referredUsers: user.referredUsers.map((refUser: any) => ({
          name: refUser.name,
          email: refUser.email,
          joinedAt: refUser.createdAt,
          earnings: refUser.referralEarnings,
        })),
        recentTransactions: transactions.slice(0, 10),
        settingsExplanation: {
          currentImpact: `When someone uses ${user.referralCode}, ${user.name} gets ${user.individualReferralSettings.signupBonus} signup bonus`,
          newUserBenefits: `New users get ${user.individualReferralSettings.referralCommission}% commission rate and ${user.individualReferralSettings.referralDepositBonus} deposit bonus`,
          limits: `New users have ${user.individualReferralSettings.minWithdrawAmount} min withdraw, ${user.individualReferralSettings.minTransferAmount} min transfer, ${user.individualReferralSettings.maxCommissionLimit} max commission`,
        },
      },
    });
  } catch (error: any) {
    console.error("Get referral impact analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
