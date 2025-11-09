import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import ReferralTransaction from "../models/ReferralTransaction";
import ReferralSettings from "../models/ReferralSettings";
import config from "../config/config";
import { Types } from "mongoose";
import { uploadProfileImage } from "../config/cloudinary";

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

interface SignupRequest extends Request {
  body: {
    username: string; // Change from name to username
    email: string;
    country?: string;
    currency?: string;
    phoneNumber?: string;
    password: string;
    player_id?: string; // Make player_id optional
    promoCode?: string;
    bonusSelection?: string;
    birthday?: string;
    referredBy?: string; // Add referral code field
    referralCode?: string; // Also accept referralCode field
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface UpdateUserRequest extends AuthenticatedRequest {
  body: {
    name?: string;
    email?: string;
    country?: string;
    currency?: string;
    phoneNumber?: string;
    phoneNumberOTP?: number;
    phoneNumberVerified?: boolean;
    player_id?: string;
    promoCode?: string;
    isVerified?: boolean;
    emailVerifyOTP?: number;
    emailVerified?: boolean;
    status?: "active" | "banned" | "deactivated";
    balance?: number;
    deposit?: number;
    withdraw?: number;
    bonusSelection?: string;
    birthday?: string;
    role?: "user" | "admin";
    profileImage?: string;
    username?: string; // Add username field
  };
  params: {
    id: string;
  };
}

// Add interface for profile update with image upload
interface UpdateProfileWithImageRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
  body: {
    name?: string;
    email?: string;
    country?: string;
    currency?: string;
    phoneNumber?: string;
    birthday?: string;
    username?: string;
  };
  params: {
    id: string;
  };
}

// Add interface for password change
interface ChangePasswordRequest extends AuthenticatedRequest {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

// Generate a unique player ID
const generatePlayerId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `P${timestamp}${random}`.toUpperCase();
};

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
export const signup = async (
  req: SignupRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const {
      username, // Change from name to username
      email,
      password,
      country,
      currency,
      phoneNumber,
      player_id,
      promoCode,
      bonusSelection,
      birthday,
      referredBy, // Get referral code from request
      referralCode, // Also accept referralCode field
    } = req.body;

    // Handle both referralCode and referredBy field names
    const referralCodeToUse = referralCode || referredBy;

    console.log("🚀 SIGNUP REQUEST:");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("ReferredBy field:", referredBy);
    console.log("ReferralCode field:", referralCode);
    console.log("Final referral code to use:", referralCodeToUse);

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Generate player_id if not provided
    const finalPlayerId = player_id || generatePlayerId();

    // Create new user
    const user: IUser = new User({
      name: username, // Map username to name field
      email,
      password,
      country: country || "Bangladesh",
      currency: currency || "BDT",
      phoneNumber: phoneNumber || null,
      player_id: finalPlayerId,
      promoCode: promoCode || null,
      bonusSelection: bonusSelection || "",
      birthday: birthday || "",
      referredBy: referralCodeToUse || null, // Set referral code
      username: username, // Set username field
    });

    await user.save();

    // Handle referral logic if referral code is provided
    if (referralCodeToUse) {
      console.log(`🎯 Processing referral with code: ${referralCodeToUse}`);
      try {
        const referrer = await User.findOne({
          referralCode: referralCodeToUse,
        });
        console.log(
          "🔍 Referrer found:",
          referrer ? `${referrer.name} (${referrer.email})` : "None"
        );

        if (referrer) {
          // Use referrer's individual settings if they have them, otherwise use global
          let commission, signupBonus;

          // Get the settings that will apply to this referral
          let referrerSignupBonus, newUserDepositBonus;

          if (!referrer.individualReferralSettings.useGlobalSettings) {
            // Use referrer's individual settings
            referrerSignupBonus =
              referrer.individualReferralSettings.signupBonus || 0; // What referrer gets
            newUserDepositBonus =
              referrer.individualReferralSettings.referralDepositBonus || 0; // What new user gets on deposit
            console.log(`💰 Using individual settings from ${referrer.name}:`);
            console.log(
              `  - Referrer gets signup bonus: ${referrerSignupBonus}`
            );
            console.log(
              `  - New user will get deposit bonus: ${newUserDepositBonus}`
            );
          } else {
            // Use global settings
            const settings = await ReferralSettings.getInstance();
            referrerSignupBonus = settings?.signupBonus || 0;
            newUserDepositBonus = settings?.referralDepositBonus || 0;
            console.log(`💰 Using global settings:`);
            console.log(
              `  - Referrer gets signup bonus: ${referrerSignupBonus}`
            );
            console.log(
              `  - New user will get deposit bonus: ${newUserDepositBonus}`
            );
          }

          // Update the new user's referredBy field BEFORE saving
          user.referredBy = referralCodeToUse;

          // 1️⃣ Create a referral transaction for the referrer's signup bonus
          if (referrerSignupBonus > 0) {
            const referralTransaction = new ReferralTransaction({
              referrer: referrer._id,
              referee: user._id,
              amount: referrerSignupBonus,
              status: "approved", // Signup bonus is immediately approved
            });
            await referralTransaction.save();
          }

          // 2️⃣ Update referrer's data - give them the signup bonus
          if (referrerSignupBonus > 0) {
            referrer.referralEarnings += referrerSignupBonus;
          }
          referrer.referredUsers.push(user._id as mongoose.Types.ObjectId);
          await referrer.save();

          // 3️⃣ The new user doesn't get anything immediately
          // Their benefits (commission rates, limits, etc.) will be applied when they login
          // The deposit bonus will be applied when they make their first deposit

          // Save the user with all referral updates
          await user.save();

          console.log(
            `✅ Referral processed: ${referrer.name} referred ${user.name}`
          );
          console.log(
            `📊 Referrer now has ${referrer.referredUsers.length} referred users`
          );
          console.log(`💵 Referrer earnings: ${referrer.referralEarnings}`);
        } else {
          console.log(
            `❌ Invalid referral code provided: ${referralCodeToUse}`
          );
        }
      } catch (referralError) {
        console.error("Referral processing error:", referralError);
        // Don't fail the signup if referral processing fails
      }
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name, // This will now be the username
          email: user.email,
          country: user.country,
          currency: user.currency,
          player_id: user.player_id,
          balance: user.balance,
          isVerified: user.isVerified,
          status: user.status,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already registered`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (
  req: LoginRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Auto-generate referral code if user doesn't have one
    let referralCode: string | null = user.referralCode;
    if (!referralCode) {
      try {
        // Generate unique referral code using username or name
        const baseName = user.username || user.name || "USER";
        referralCode = generateReferralCode(baseName);

        // Ensure uniqueness (max 10 attempts)
        let userWithCode = await User.findOne({ referralCode });
        let attempts = 0;
        while (userWithCode && attempts < 10) {
          referralCode = generateReferralCode(baseName);
          userWithCode = await User.findOne({ referralCode });
          attempts++;
        }

        // If still not unique after 10 attempts, use completely random code
        if (userWithCode) {
          referralCode = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();
        }

        // Update user with the new referral code
        user.referralCode = referralCode;
        await user.save();

        console.log(
          `✅ Auto-generated referral code for user ${user.email}: ${referralCode}`
        );
      } catch (referralError) {
        console.error(
          "❌ Error generating referral code during login:",
          referralError
        );
        // Continue with login even if referral code generation fails
        referralCode = null;
      }
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    // Create share URL if referral code exists
    const shareUrl = referralCode
      ? `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/signup?ref=${referralCode}`
      : null;

    // Get referral settings based on who referred this user
    let referralSettings = null;

    if (user.referredBy) {
      // User was referred by someone, check if referrer has individual settings
      const referrer = await User.findOne({ referralCode: user.referredBy });

      if (referrer && !referrer.individualReferralSettings.useGlobalSettings) {
        // Referrer has individual settings, use those for the referred user's benefits
        referralSettings = {
          // These are the benefits THIS user gets because they were referred
          referralCommission:
            referrer.individualReferralSettings.referralCommission, // Commission rate THIS user earns
          referralDepositBonus:
            referrer.individualReferralSettings.referralDepositBonus, // Bonus THIS user gets on deposit
          minWithdrawAmount:
            referrer.individualReferralSettings.minWithdrawAmount, // Min withdraw for THIS user
          minTransferAmount:
            referrer.individualReferralSettings.minTransferAmount, // Min transfer for THIS user
          maxCommissionLimit:
            referrer.individualReferralSettings.maxCommissionLimit, // Max commission for THIS user

          // Also include what THIS user can offer to others when they refer someone
          signupBonusForReferrals: user.individualReferralSettings.signupBonus, // What THIS user gives to referrer when someone uses their code

          // Referrer information
          referrerName: referrer.name,
          referrerCode: referrer.referralCode,
        };
        console.log(
          `✅ Using individual referral settings from referrer: ${referrer.name}`
        );
      } else if (referrer) {
        // Referrer exists but uses global settings
        const globalSettings = await ReferralSettings.getInstance();
        referralSettings = {
          referralCommission: globalSettings.referralCommission,
          referralDepositBonus: globalSettings.referralDepositBonus,
          minWithdrawAmount: globalSettings.minWithdrawAmount,
          minTransferAmount: globalSettings.minTransferAmount,
          maxCommissionLimit: globalSettings.maxCommissionLimit,
          signupBonusForReferrals: user.individualReferralSettings.signupBonus,
          referrerName: referrer.name,
          referrerCode: referrer.referralCode,
        };
        console.log(`✅ Using global referral settings for referred user`);
      }
    }
    // If user was not referred by anyone, referralSettings remains null

    const responseData: any = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        currency: user.currency,
        player_id: user.player_id,
        balance: user.balance,
        isVerified: user.isVerified,
        status: user.status,
        referralCode: referralCode || null,
        referralEarnings: user.referralEarnings || 0,
        totalReferrals: user.referredUsers?.length || 0,
        shareUrl: shareUrl,
      },
      token,
    };

    // Only include referral settings if user was referred by someone
    if (referralSettings) {
      responseData.referralSettings = referralSettings;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: responseData,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user profile with all requested fields
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
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

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          country: user.country,
          currency: user.currency,
          phoneNumber: user.phoneNumber,
          player_id: user.player_id,
          balance: user.balance,
          deposit: user.deposit,
          withdraw: user.withdraw,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          status: user.status,
          role: user.role,
          profileImage: user.profileImage,
          birthday: user.birthday,
          referralCode: user.referralCode,
        },
      },
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only recommended)
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("📋 Get all users request received:", {
      query: req.query,
      user: req.user?.id,
    });

    // Parse and validate pagination parameters
    let page = parseInt(req.query.page as string);
    let limit = parseInt(req.query.limit as string);

    // Set defaults if parsing failed or values are invalid
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === "true";
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { player_id: { $regex: req.query.search, $options: "i" } },
        { country: { $regex: req.query.search, $options: "i" } },
      ];
    }

    console.log("🔍 Applied filter:", JSON.stringify(filter, null, 2));

    // Check if referral information should be included
    const includeReferrals = req.query.includeReferrals === "true";

    let users;
    if (includeReferrals) {
      console.log("🎯 Including referral information in response");

      // Get users with referral fields
      users = await User.find(filter)
        .select("-password -emailVerifyOTP -phoneNumberOTP")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // For each user, get their referrer information if they have referredBy
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.referredBy) {
          // Find the referrer by referral code
          const referrer = await User.findOne({
            referralCode: user.referredBy,
          }).select("name email username referralCode");

          if (referrer) {
            // Add referrer information to user object
            (user as any).referrerInfo = {
              name: referrer.name,
              email: referrer.email,
              username: referrer.username,
              referralCode: referrer.referralCode,
            };
          } else {
            // Referrer not found (maybe deleted or invalid code)
            (user as any).referrerInfo = null;
          }
        } else {
          // User was not referred by anyone
          (user as any).referrerInfo = null;
        }

        // Also populate their referred users for complete info
        await user.populate("referredUsers", "name email username createdAt");
      }
    } else {
      // Standard query without referral information
      users = await User.find(filter)
        .select("-password -emailVerifyOTP -phoneNumberOTP")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    console.log("📊 Query results:", {
      usersFound: users.length,
      totalUsers,
      totalPages,
      currentPage: page,
      includeReferrals,
    });

    // Prepare response data
    let responseData: any = {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        isEmpty: users.length === 0,
      },
      filters: {
        applied: filter,
        search: req.query.search || null,
        status: req.query.status || null,
        isVerified: req.query.isVerified || null,
        role: req.query.role || null,
      },
    };

    // Add referral statistics if includeReferrals is true
    if (includeReferrals) {
      const referralStats = {
        totalUsersWithReferralCodes: await User.countDocuments({
          referralCode: { $exists: true, $ne: null },
        }),
        totalReferredUsers: await User.countDocuments({
          referredBy: { $exists: true, $ne: null },
        }),
        usersWithReferrers: users.filter((user: any) => user.referrerInfo)
          .length,
        usersWithoutReferrers: users.filter(
          (user: any) => !user.referrerInfo && !user.referredBy
        ).length,
      };

      responseData.referralStats = referralStats;
    }

    // Always return a response, even if no users found
    const response = {
      success: true,
      message:
        users.length === 0
          ? totalUsers === 0
            ? "No users found in the database"
            : "No users found matching the specified criteria"
          : `Found ${users.length} user(s)`,
      data: responseData,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              queryTime: new Date().toISOString(),
              filterUsed: filter,
              skipValue: skip,
              limitValue: limit,
              includeReferrals,
            }
          : undefined,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching users",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : "Internal server error",
      debug:
        process.env.NODE_ENV === "development"
          ? {
              timestamp: new Date().toISOString(),
              endpoint: "/api/users",
              method: "GET",
            }
          : undefined,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id).select(
      "-password -emailVerifyOTP -phoneNumberOTP"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (
  req: UpdateUserRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete (updates as any).password;
    delete (updates as any).emailVerifyOTP;
    delete (updates as any).phoneNumberOTP;

    // Check if email is being updated and ensure uniqueness
    if (updates.email) {
      const existingUser = await User.findOne({
        $and: [{ _id: { $ne: id } }, { email: updates.email }],
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email is already in use by another user",
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -emailVerifyOTP -phoneNumberOTP");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only recommended)
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    // Prevent self-deletion (optional security measure)
    const currentUserId = req.user?.id;
    if (currentUserId === id) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user profile with image upload
// @route   PUT /api/users/profile
// @access  Private
export const updateProfileWithImage = async (
  req: UpdateProfileWithImageRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
      return;
    }

    const updates: any = { ...req.body };

    // If file is uploaded, add it to updates
    if (req.file) {
      updates.profileImage = req.file.path; // Cloudinary provides the URL in the path property
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.emailVerifyOTP;
    delete updates.phoneNumberOTP;
    delete updates.role; // Users shouldn't be able to change their role
    delete updates.balance; // Users shouldn't be able to change their balance directly
    delete updates.deposit;
    delete updates.withdraw;
    delete updates.status; // Users shouldn't be able to change their status

    // Check if email is being updated and ensure uniqueness
    if (updates.email) {
      const existingUser = await User.findOne({
        $and: [{ _id: { $ne: req.user.id } }, { email: updates.email }],
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email is already in use by another user",
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -emailVerifyOTP -phoneNumberOTP");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (
  req: ChangePasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Find user with password
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user balance
// @route   GET /api/users/balance
// @access  Private
export const getUserBalance = async (
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
      "balance deposit withdraw"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        deposit: user.deposit,
        withdraw: user.withdraw,
        totalDeposit: user.deposit,
        totalWithdraw: user.withdraw,
        availableBalance: user.balance,
      },
    });
  } catch (error: any) {
    console.error("Get user balance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user balance (Admin only - for deposit/withdraw)
// @route   PUT /api/users/balance/:id
// @access  Private (Admin only)
export const updateUserBalance = async (
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

    const { amount, type, description } = req.body;

    // Validate input
    if (!amount || typeof amount !== "number") {
      res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
      return;
    }

    if (!type || !["deposit", "withdraw"].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Type must be either "deposit" or "withdraw"',
      });
      return;
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update balance based on type
    if (type === "deposit") {
      user.balance += amount;
      user.deposit += amount;
      console.log(
        `💰 Deposit: Added ${amount} to ${user.email}. New balance: ${user.balance}`
      );
    } else if (type === "withdraw") {
      // Check if user has sufficient balance
      if (user.balance < amount) {
        res.status(400).json({
          success: false,
          message: "Insufficient balance",
          data: {
            currentBalance: user.balance,
            requestedAmount: amount,
          },
        });
        return;
      }
      user.balance -= amount;
      user.withdraw += amount;
      console.log(
        `💸 Withdraw: Deducted ${amount} from ${user.email}. New balance: ${user.balance}`
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${type === "deposit" ? "Deposit" : "Withdrawal"} successful`,
      data: {
        userId: user._id,
        email: user.email,
        type,
        amount,
        description: description || "",
        balance: user.balance,
        totalDeposit: user.deposit,
        totalWithdraw: user.withdraw,
      },
    });
  } catch (error: any) {
    console.error("Update user balance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
