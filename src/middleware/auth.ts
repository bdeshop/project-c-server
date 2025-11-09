import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import config from "../config/config";
import { Types } from "mongoose";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Optional authentication middleware
export const optionalProtect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        config.jwt.secret as string
      ) as DecodedToken;

      // Find user by ID
      const user = await User.findById(decoded.id);
      if (user && user.status === "active") {
        // Add user to request object only if found and active
        req.user = {
          id: (user._id as Types.ObjectId).toString(),
          email: user.email,
          role: user.role,
        };
      }

      next();
    } catch (jwtError) {
      // If token is invalid, continue without user
      next();
    }
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Continue without authentication on error
    next();
  }
};

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        config.jwt.secret as string
      ) as DecodedToken;

      // Find user by ID
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Access denied. User not found.",
        });
        return;
      }

      if (user.status !== "active") {
        res.status(401).json({
          success: false,
          message: "Access denied. Account is not active.",
        });
        return;
      }

      // Add user to request object
      req.user = {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Access denied. Authentication required.",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
    return;
  }

  next();
};
