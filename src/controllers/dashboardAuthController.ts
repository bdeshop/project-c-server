import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config";

interface DashboardSignupRequest extends Request {
  body: {
    email: string;
    password: string;
    role: "admin" | "user";
  };
}

interface DashboardLoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
  );
};

// Dashboard Login
export const dashboardLogin = async (
  req: DashboardLoginRequest,
  res: Response,
): Promise<void> => {
  try {
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

    console.log("🔐 DASHBOARD LOGIN REQUEST:");
    console.log("Email:", email);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found:", email);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if user has dashboard access (admin or user role)
    if (!user.role || (user.role !== "admin" && user.role !== "user")) {
      console.log("❌ User does not have dashboard access:", email);
      res.status(403).json({
        success: false,
        message: "You do not have access to the dashboard",
      });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", email);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    console.log("✅ Dashboard login successful:", email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username || user.name,
          email: user.email,
          role: user.role || "user",
          balance: user.balance,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Dashboard login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Dashboard Signup
export const dashboardSignup = async (
  req: DashboardSignupRequest,
  res: Response,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password, role } = req.body;

    console.log("🔐 DASHBOARD SIGNUP REQUEST:");
    console.log("Email:", email);
    console.log("Role:", role);

    // Validate role
    if (!["admin", "user"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Role must be 'admin' or 'user'",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    // Create new dashboard user
    const newUser = new User({
      name: email.split("@")[0], // Use email prefix as name
      username: email.split("@")[0], // Use email prefix as username
      email,
      password, // Will be hashed by the pre-save hook
      role, // Set the role (admin or user)
      country: "Dashboard",
      currency: "USD",
      isVerified: true, // Dashboard users are verified by default
      status: "active",
      player_id: `DASH_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    });

    await newUser.save();

    // Generate token
    const token = generateToken((newUser._id as Types.ObjectId).toString());

    console.log("✅ Dashboard signup successful:", email, "Role:", role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: newUser._id,
          username: newUser.username || newUser.name,
          email: newUser.email,
          role: newUser.role || "user",
          balance: newUser.balance,
          isVerified: newUser.isVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Dashboard signup error:", error);

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
