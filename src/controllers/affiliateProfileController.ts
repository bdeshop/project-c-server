import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import bcrypt from "bcryptjs";

/**
 * @desc    Get logged-in affiliate's complete profile
 * @route   GET /api/affiliate/user/profile
 * @access  Private (Affiliate)
 */
export const getAffiliateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id).select(
      "-password",
    );

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get referral statistics
    const referralCount = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
    });

    const activeReferrals = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
      status: "active",
    });

    // Calculate minimum payout threshold
    const minPayoutThreshold = 1000;
    const remainingForPayout = 0;
    const isEligibleForPayout = false;

    res.status(200).json({
      success: true,
      data: {
        // Account Status
        accountStatus: {
          status: affiliate.status,
          role: affiliate.role,
          minPayoutThreshold,
          isEligibleForPayout,
          remainingForPayout,
        },

        // Earnings Summary
        earnings: {
          totalEarnings: affiliate.balance || 0,
          balance: affiliate.balance || 0,
        },

        // Referral Statistics
        referrals: {
          total: referralCount,
          active: activeReferrals,
        },

        // Commission Rates
        commissionRates: {
          betWinCommission: affiliate.betWinCommission || 0,
          betLossCommission: affiliate.betLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          registrationCommission: affiliate.registrationCommission || 0,
        },

        // Personal Information
        personalInfo: {
          userName: affiliate.userName,
          fullName: affiliate.fullName || "",
          email: affiliate.email || "",
          phone: affiliate.phone,
          callingCode: affiliate.callingCode,
          affiliateCode: affiliate.myReferralCode,
        },

        // Payment Details
        paymentDetails: {
          paymentMethod: affiliate.paymentMethod,
          withdrawMethodId: affiliate.paymentDetails?.withdrawMethodId,
          // Mobile Money fields
          phoneNumber: affiliate.paymentDetails?.phoneNumber || "",
          accountType: affiliate.paymentDetails?.accountType || "",
          // Binance fields
          binanceEmail: affiliate.paymentDetails?.binanceEmail || "",
          walletAddress: affiliate.paymentDetails?.walletAddress || "",
          binanceId: affiliate.paymentDetails?.binanceId || "",
          // Bank Transfer fields
          bankName: affiliate.paymentDetails?.bankName || "",
          accountName: affiliate.paymentDetails?.accountName || "",
          accountNumber: affiliate.paymentDetails?.accountNumber || "",
          branchName: affiliate.paymentDetails?.branchName || "",
          routingNumber: affiliate.paymentDetails?.routingNumber || "",
          swiftCode: affiliate.paymentDetails?.swiftCode || "",
        },

        // Account Metadata
        metadata: {
          createdAt: affiliate.createdAt,
          updatedAt: affiliate.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching affiliate profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Update affiliate profile (personal info)
 * @route   PUT /api/affiliate/user/profile
 * @access  Private (Affiliate)
 */
export const updateAffiliateProfile = async (
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

    const { fullName, email, phone, callingCode } = req.body;

    // Update allowed fields
    if (fullName !== undefined) affiliate.fullName = fullName;
    if (email !== undefined) affiliate.email = email;
    if (phone !== undefined) {
      // Check if phone is already taken by another affiliate
      const existingAffiliate = await Affiliate.findOne({
        phone,
        _id: { $ne: affiliate._id },
      });
      if (existingAffiliate) {
        res.status(400).json({
          success: false,
          message: "Phone number already in use",
        });
        return;
      }
      affiliate.phone = phone;
    }
    if (callingCode !== undefined) affiliate.callingCode = callingCode;

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        callingCode: affiliate.callingCode,
      },
    });
  } catch (error: any) {
    console.error("Error updating affiliate profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Update affiliate payment details
 * @route   PUT /api/affiliate/user/payment
 * @access  Private (Affiliate)
 */
export const updateAffiliatePayment = async (
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

    const { paymentMethod, withdrawMethodId, paymentDetails } = req.body;

    // Validate payment method
    const validMethods = [
      "bKash",
      "Nagad",
      "Rocket",
      "Binance",
      "Bank Transfer",
    ];
    if (paymentMethod && !validMethods.includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Must be one of: bKash, Nagad, Rocket, Binance, Bank Transfer",
      });
      return;
    }

    // Validate withdrawMethodId if provided
    if (withdrawMethodId) {
      const AffiliateWithdrawMethod = require("../models/AffiliateWithdrawMethod").default;
      const withdrawMethod =
        await AffiliateWithdrawMethod.findById(withdrawMethodId);
      if (!withdrawMethod) {
        res.status(404).json({
          success: false,
          message: "Withdraw method not found",
        });
        return;
      }
    }

    // Update payment method if provided
    if (paymentMethod) {
      affiliate.paymentMethod = paymentMethod;
    }

    // Initialize payment details if not exists
    if (!affiliate.paymentDetails) {
      affiliate.paymentDetails = {};
    }

    // Clear all payment details first
    affiliate.paymentDetails = {
      withdrawMethodId:
        withdrawMethodId || affiliate.paymentDetails?.withdrawMethodId,
      phoneNumber: undefined,
      accountType: undefined,
      binanceEmail: undefined,
      walletAddress: undefined,
      binanceId: undefined,
      bankName: undefined,
      accountName: undefined,
      accountNumber: undefined,
      branchName: undefined,
      routingNumber: undefined,
      swiftCode: undefined,
    };

    // Update payment details based on payment method
    if (paymentDetails) {
      const method = paymentMethod || affiliate.paymentMethod;

      // For Mobile Money (bKash, Nagad, Rocket)
      if (["bKash", "Nagad", "Rocket"].includes(method)) {
        if (!paymentDetails.phoneNumber) {
          res.status(400).json({
            success: false,
            message: "Phone number is required for mobile money payment",
          });
          return;
        }
        affiliate.paymentDetails.phoneNumber = paymentDetails.phoneNumber;
        affiliate.paymentDetails.accountType =
          paymentDetails.accountType || "Personal";
      }

      // For Binance
      else if (method === "Binance") {
        if (!paymentDetails.binanceEmail && !paymentDetails.walletAddress) {
          res.status(400).json({
            success: false,
            message: "Binance email or wallet address is required",
          });
          return;
        }
        affiliate.paymentDetails.binanceEmail = paymentDetails.binanceEmail;
        affiliate.paymentDetails.walletAddress = paymentDetails.walletAddress;
        affiliate.paymentDetails.binanceId = paymentDetails.binanceId;
      }

      // For Bank Transfer
      else if (method === "Bank Transfer") {
        if (
          !paymentDetails.bankName ||
          !paymentDetails.accountNumber ||
          !paymentDetails.accountName
        ) {
          res.status(400).json({
            success: false,
            message:
              "Bank name, account number, and account name are required for bank transfer",
          });
          return;
        }
        affiliate.paymentDetails.bankName = paymentDetails.bankName;
        affiliate.paymentDetails.accountName = paymentDetails.accountName;
        affiliate.paymentDetails.accountNumber = paymentDetails.accountNumber;
        affiliate.paymentDetails.branchName = paymentDetails.branchName;
        affiliate.paymentDetails.routingNumber = paymentDetails.routingNumber;
        affiliate.paymentDetails.swiftCode = paymentDetails.swiftCode;
      }
    }

    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
      data: {
        paymentMethod: affiliate.paymentMethod,
        withdrawMethodId: affiliate.paymentDetails?.withdrawMethodId,
        paymentDetails: affiliate.paymentDetails,
      },
    });
  } catch (error: any) {
    console.error("Error updating payment details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Change affiliate password
 * @route   PUT /api/affiliate/user/password
 * @access  Private (Affiliate)
 */
export const changeAffiliatePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    // Get affiliate with password field
    const affiliate = await Affiliate.findById(req.user?.id).select(
      "+password",
    );

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Verify current password
    const isPasswordCorrect = await affiliate.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Update password
    affiliate.password = newPassword;
    await affiliate.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
