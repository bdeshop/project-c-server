import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import AffiliateThemeConfig from "../models/AffiliateThemeConfig";

/**
 * @desc    Get affiliate theme configuration
 * @route   GET /api/affiliate-theme-config
 * @access  Public
 */
export const getAffiliateThemeConfig = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    let themeConfig = await AffiliateThemeConfig.findOne();

    // If no config exists, create default one
    if (!themeConfig) {
      themeConfig = new AffiliateThemeConfig({
        logo: null,
        favicon: null,
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        accentColor: "#007BFF",
        fontFamily: "Arial, sans-serif",
        borderRadius: "4px",
      });
      await themeConfig.save();
    }

    res.status(200).json({
      success: true,
      data: {
        logo: themeConfig.logo,
        favicon: themeConfig.favicon,
        primaryColor: themeConfig.primaryColor,
        secondaryColor: themeConfig.secondaryColor,
        accentColor: themeConfig.accentColor,
        fontFamily: themeConfig.fontFamily,
        borderRadius: themeConfig.borderRadius,
        lastUpdated: themeConfig.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("Error fetching affiliate theme config:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Update affiliate theme configuration (Admin)
 * @route   PUT /api/affiliate-theme-config
 * @access  Private (Admin)
 */
export const updateAffiliateThemeConfig = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      logo,
      favicon,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      borderRadius,
    } = req.body;

    console.log("=== Update Affiliate Theme Config ===");
    console.log("Admin ID:", req.user?.id);

    // Validate color format if provided
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (primaryColor && !colorRegex.test(primaryColor)) {
      res.status(400).json({
        success: false,
        message: "Invalid primaryColor format. Use hex color (e.g., #000000)",
      });
      return;
    }
    if (secondaryColor && !colorRegex.test(secondaryColor)) {
      res.status(400).json({
        success: false,
        message: "Invalid secondaryColor format. Use hex color (e.g., #FFFFFF)",
      });
      return;
    }
    if (accentColor && !colorRegex.test(accentColor)) {
      res.status(400).json({
        success: false,
        message: "Invalid accentColor format. Use hex color (e.g., #007BFF)",
      });
      return;
    }

    // Find existing config or create new one
    let themeConfig = await AffiliateThemeConfig.findOne();

    if (!themeConfig) {
      themeConfig = new AffiliateThemeConfig();
    }

    // Update fields
    if (logo !== undefined) themeConfig.logo = logo;
    if (favicon !== undefined) themeConfig.favicon = favicon;
    if (primaryColor !== undefined) themeConfig.primaryColor = primaryColor;
    if (secondaryColor !== undefined)
      themeConfig.secondaryColor = secondaryColor;
    if (accentColor !== undefined) themeConfig.accentColor = accentColor;
    if (fontFamily !== undefined) themeConfig.fontFamily = fontFamily;
    if (borderRadius !== undefined) themeConfig.borderRadius = borderRadius;

    themeConfig.lastUpdated = new Date();
    await themeConfig.save();

    console.log("✅ Affiliate theme config updated successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate theme configuration updated successfully",
      data: {
        logo: themeConfig.logo,
        favicon: themeConfig.favicon,
        primaryColor: themeConfig.primaryColor,
        secondaryColor: themeConfig.secondaryColor,
        accentColor: themeConfig.accentColor,
        fontFamily: themeConfig.fontFamily,
        borderRadius: themeConfig.borderRadius,
        lastUpdated: themeConfig.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("Error updating affiliate theme config:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Upload affiliate logo
 * @route   POST /api/affiliate-theme-config/upload-logo
 * @access  Private (Admin)
 */
export const uploadAffiliateLogo = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const logoPath = `/uploads/${req.file.filename}`;

    console.log("=== Upload Affiliate Logo ===");
    console.log("Admin ID:", req.user?.id);
    console.log("Logo path:", logoPath);

    // Find existing config or create new one
    let themeConfig = await AffiliateThemeConfig.findOne();

    if (!themeConfig) {
      themeConfig = new AffiliateThemeConfig();
    }

    themeConfig.logo = logoPath;
    themeConfig.lastUpdated = new Date();
    await themeConfig.save();

    console.log("✅ Affiliate logo uploaded successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate logo uploaded successfully",
      data: {
        logo: themeConfig.logo,
        lastUpdated: themeConfig.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("Error uploading affiliate logo:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Upload affiliate favicon
 * @route   POST /api/affiliate-theme-config/upload-favicon
 * @access  Private (Admin)
 */
export const uploadAffiliateFavicon = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const faviconPath = `/uploads/${req.file.filename}`;

    console.log("=== Upload Affiliate Favicon ===");
    console.log("Admin ID:", req.user?.id);
    console.log("Favicon path:", faviconPath);

    // Find existing config or create new one
    let themeConfig = await AffiliateThemeConfig.findOne();

    if (!themeConfig) {
      themeConfig = new AffiliateThemeConfig();
    }

    themeConfig.favicon = faviconPath;
    themeConfig.lastUpdated = new Date();
    await themeConfig.save();

    console.log("✅ Affiliate favicon uploaded successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate favicon uploaded successfully",
      data: {
        favicon: themeConfig.favicon,
        lastUpdated: themeConfig.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error("Error uploading affiliate favicon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
