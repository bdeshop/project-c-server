import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Affiliate from "../models/Affiliate";
import config from "../config/config";

const signToken = (id: string): string => {
  return jwt.sign(
    { id },
    config.jwt.secret as string,
    {
      expiresIn: config.jwt.expiresIn || "7d",
    } as any,
  );
};

const generateReferralCode = (userName: string): string => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AFF${userName.substring(0, 3).toUpperCase()}${randomStr}`;
};

/**
 * @desc    Register a new affiliate
 * @route   POST /api/frontend/auth/register/affiliate
 * @access  Public
 */
export const registerAffiliate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("=== 📝 AFFILIATE REGISTRATION ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const {
      firstName,
      lastName,
      password,
      email,
      phone,
      callingCode,
      referralCode,
    } = req.body;

    // Combine firstName and lastName
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    // Generate userName from email
    const trimmedUserName = email?.split("@")[0]?.trim();

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        message:
          "Please provide firstName, lastName, email, phone, and password",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    // Check if username already exists
    const userNameExists = await Affiliate.findOne({
      userName: trimmedUserName,
    });
    if (userNameExists) {
      res.status(400).json({
        success: false,
        message: "Username already exists",
      });
      return;
    }

    // Check if phone already exists
    const phoneExists = await Affiliate.findOne({ phone });
    if (phoneExists) {
      res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
      return;
    }

    // Generate unique referral code
    let myReferralCode = generateReferralCode(trimmedUserName);
    let codeExists = await Affiliate.findOne({ myReferralCode });
    while (codeExists) {
      myReferralCode = generateReferralCode(trimmedUserName);
      codeExists = await Affiliate.findOne({ myReferralCode });
    }

    // Create affiliate
    const affiliate = await Affiliate.create({
      userName: trimmedUserName,
      password,
      fullName: fullName,
      email: email,
      phone,
      callingCode: callingCode || "880",
      paymentMethod: "Bank Transfer",
      paymentDetails: {},
      myReferralCode,
      status: "pending", // Requires admin approval
    });

    console.log("✅ Affiliate registered successfully:", {
      id: affiliate._id,
      userName: affiliate.userName,
      status: affiliate.status,
      referralCode: referralCode || "none",
    });

    res.status(201).json({
      success: true,
      message:
        "Affiliate registration successful. Please wait for admin approval.",
      affiliate: {
        id: affiliate._id,
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        myReferralCode: affiliate.myReferralCode,
        paymentMethod: affiliate.paymentMethod,
        status: affiliate.status,
        role: affiliate.role,
      },
    });
  } catch (error) {
    console.error("❌ Affiliate registration error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Affiliate login
 * @route   POST /api/frontend/auth/login/affiliate
 * @access  Public
 */
export const loginAffiliate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("=== 🔐 AFFILIATE LOGIN REQUEST ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const { email, password } = req.body;

    // Trim email
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
      return;
    }

    console.log(`🔍 Looking for affiliate: "${trimmedEmail}"`);
    const affiliate = await Affiliate.findOne({
      email: trimmedEmail,
    }).select("+password");

    if (!affiliate) {
      console.log("❌ Affiliate not found");
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    console.log("✅ Affiliate found:", {
      id: affiliate._id,
      email: affiliate.email,
      status: affiliate.status,
      role: affiliate.role,
    });

    const isPasswordCorrect = await affiliate.comparePassword(password);
    console.log(
      "🔑 Password check:",
      isPasswordCorrect ? "✅ Correct" : "❌ Incorrect",
    );

    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if affiliate is active
    console.log(`📊 Affiliate status: ${affiliate.status}`);
    if (affiliate.status !== "active") {
      res.status(403).json({
        success: false,
        message:
          affiliate.status === "pending"
            ? "Your account is pending approval. Please wait for admin activation."
            : "Your account has been deactivated. Please contact support.",
      });
      return;
    }

    const token = signToken((affiliate._id as any).toString());

    console.log("✅ Affiliate login successful!");

    res.status(200).json({
      success: true,
      token,
      affiliate: {
        id: (affiliate._id as any).toString(),
        userName: affiliate.userName,
        fullName: affiliate.fullName,
        email: affiliate.email,
        phone: affiliate.phone,
        myReferralCode: affiliate.myReferralCode,
        balance: affiliate.balance,
        role: affiliate.role,
        status: affiliate.status,
        betWinCommission: affiliate.betWinCommission,
        depositCommission: affiliate.depositCommission,
        registrationCommission: affiliate.registrationCommission,
        betLossCommission: affiliate.betLossCommission,
        totalReferrals: affiliate.totalReferrals,
        totalEarnings: affiliate.balance,
      },
    });
  } catch (error) {
    console.error("❌ Affiliate login error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
