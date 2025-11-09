import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ThemeConfig, { IThemeConfig } from "../models/ThemeConfig";
import { themeConfigValidation } from "../middleware/themeConfigValidation";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface UpdateThemeConfigRequest extends AuthenticatedRequest {
  body: Partial<IThemeConfig>;
}

// @desc    Get theme configuration
// @route   GET /api/theme-config
// @access  Public
export const getThemeConfig = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const themeConfig = await (ThemeConfig as any).getInstance();

    // Filter out sensitive fields if user is not admin
    const isAdmin = req.user?.role === "admin";
    
    let responseData;
    if (isAdmin) {
      // Admin gets all settings
      responseData = themeConfig;
    } else {
      // Public gets only active theme config
      responseData = themeConfig.isActive ? {
        siteInfo: themeConfig.siteInfo,
        header: themeConfig.header,
        webMenu: themeConfig.webMenu,
        mobileMenu: themeConfig.mobileMenu,
        fontSettings: themeConfig.fontSettings,
        footer: themeConfig.footer,
        customSections: themeConfig.customSections,
        isActive: themeConfig.isActive,
        createdAt: themeConfig.createdAt,
        updatedAt: themeConfig.updatedAt,
      } : null;
    }

    res.status(200).json({
      success: true,
      message: "Theme configuration retrieved successfully",
      data: responseData,
    });
  } catch (error: any) {
    console.error("Get theme config error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving theme configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update theme configuration
// @route   PUT /api/theme-config
// @access  Private (Admin only)
export const updateThemeConfig = async (
  req: UpdateThemeConfigRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
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

    const updates = req.body;

    // Get current theme config
    const currentThemeConfig = await (ThemeConfig as any).getInstance();

    // Update theme config
    const updatedThemeConfig = await ThemeConfig.findByIdAndUpdate(
      currentThemeConfig._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedThemeConfig) {
      res.status(404).json({
        success: false,
        message: "Theme configuration not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Theme configuration updated successfully",
      data: {
        themeConfig: updatedThemeConfig,
      },
    });
  } catch (error: any) {
    console.error("Update theme config error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during theme configuration update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Partially update theme configuration
// @route   PATCH /api/theme-config
// @access  Private (Admin only)
export const patchThemeConfig = async (
  req: UpdateThemeConfigRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
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

    const updates = req.body;

    // Get current theme config
    const currentThemeConfig = await (ThemeConfig as any).getInstance();

    // Update only provided fields
    const updatedThemeConfig = await ThemeConfig.findByIdAndUpdate(
      currentThemeConfig._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedThemeConfig) {
      res.status(404).json({
        success: false,
        message: "Theme configuration not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Theme configuration updated successfully",
      data: {
        themeConfig: updatedThemeConfig,
      },
    });
  } catch (error: any) {
    console.error("Patch theme config error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during theme configuration update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Reset theme configuration to defaults
// @route   POST /api/theme-config/reset
// @access  Private (Admin only)
export const resetThemeConfig = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    // Get current theme config
    const currentThemeConfig = await (ThemeConfig as any).getInstance();

    // Reset to default values (empty object will use schema defaults)
    const resetThemeConfig = await ThemeConfig.findByIdAndUpdate(
      currentThemeConfig._id,
      { $set: {} },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Theme configuration reset to default values successfully",
      data: {
        themeConfig: resetThemeConfig,
      },
    });
  } catch (error: any) {
    console.error("Reset theme config error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during theme configuration reset",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Toggle theme configuration active status
// @route   PATCH /api/theme-config/toggle
// @access  Private (Admin only)
export const toggleThemeConfig = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    // Get current theme config
    const currentThemeConfig = await (ThemeConfig as any).getInstance();

    // Toggle isActive status
    const updatedThemeConfig = await ThemeConfig.findByIdAndUpdate(
      currentThemeConfig._id,
      { $set: { isActive: !currentThemeConfig.isActive } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Theme configuration ${updatedThemeConfig?.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        themeConfig: updatedThemeConfig,
      },
    });
  } catch (error: any) {
    console.error("Toggle theme config error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during theme configuration toggle",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};