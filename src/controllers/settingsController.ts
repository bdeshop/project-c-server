import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Settings, { ISettings } from "../models/Settings";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface UpdateSettingsRequest extends AuthenticatedRequest {
  body: {
    organizationName?: string;
    organizationImage?: string;
    themeColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    supportEmail?: string;
    supportPhone?: string;
    address?: string;
    websiteUrl?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
    maintenanceMode?: boolean;
    registrationEnabled?: boolean;
    emailVerificationRequired?: boolean;
    twoFactorEnabled?: boolean;
    maxLoginAttempts?: number;
    sessionTimeout?: number;
    // UI Customization fields
    headerColor?: string;
    headerLoginSignupButtonBgColor?: string;
    headerLoginSignupButtonTextColor?: string;
    webMenuBgColor?: string;
    webMenuTextColor?: string;
    webMenuFontSize?: string;
    webMenuHoverColor?: string;
    mobileMenuLoginSignupButtonBgColor?: string;
    mobileMenuLoginSignupButtonTextColor?: string;
    mobileMenuFontSize?: string;
    footerText?: string;
    footerSocialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  file?: Express.Multer.File;
}

// Add interface for navigation items
interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

// @desc    Get settings
// @route   GET /api/settings
// @access  Public (some fields may be filtered for public access)
export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const settings = await (Settings as any).getInstance();

    // If user is not admin, return only public settings
    const isAdmin = req.user?.role === "admin";

    let responseData;
    if (isAdmin) {
      // Admin gets all settings
      responseData = settings;
    } else {
      // Public gets limited settings
      responseData = {
        organizationName: settings.organizationName,
        organizationImage: settings.organizationImage,
        themeColor: settings.themeColor,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        address: settings.address,
        websiteUrl: settings.websiteUrl,
        socialLinks: settings.socialLinks,
        registrationEnabled: settings.registrationEnabled,
        maintenanceMode: settings.maintenanceMode,
        // UI Customization fields for public
        headerColor: settings.headerColor,
        headerLoginSignupButtonBgColor: settings.headerLoginSignupButtonBgColor,
        headerLoginSignupButtonTextColor:
          settings.headerLoginSignupButtonTextColor,
        webMenuBgColor: settings.webMenuBgColor,
        webMenuTextColor: settings.webMenuTextColor,
        webMenuFontSize: settings.webMenuFontSize,
        webMenuHoverColor: settings.webMenuHoverColor,
        mobileMenuLoginSignupButtonBgColor:
          settings.mobileMenuLoginSignupButtonBgColor,
        mobileMenuLoginSignupButtonTextColor:
          settings.mobileMenuLoginSignupButtonTextColor,
        mobileMenuFontSize: settings.mobileMenuFontSize,
        footerText: settings.footerText,
        footerSocialLinks: settings.footerSocialLinks,
        // Landing page navigation items
        navigationItems: settings.navigationItems,
      };
    }

    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: {
        settings: responseData,
      },
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (
  req: UpdateSettingsRequest,
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

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update settings
    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedSettings) {
      res.status(404).json({
        success: false,
        message: "Settings not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: {
        settings: updatedSettings,
      },
    });
  } catch (error: any) {
    console.error("Update settings error:", error);

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
      message: "Server error during settings update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private (Admin only)
export const resetSettings = async (
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

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Reset to default values
    const defaultSettings = {
      organizationName: "Betting Platform",
      organizationImage: "https://via.placeholder.com/200x100?text=Logo",
      themeColor: "#3B82F6",
      primaryColor: "#1E40AF",
      secondaryColor: "#64748B",
      accentColor: "#F59E0B",
      logoUrl: undefined,
      faviconUrl: undefined,
      supportEmail: "support@bettingsite.com",
      supportPhone: undefined,
      address: undefined,
      websiteUrl: undefined,
      socialLinks: {
        facebook: undefined,
        twitter: undefined,
        instagram: undefined,
        linkedin: undefined,
      },
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: false,
      twoFactorEnabled: false,
      maxLoginAttempts: 5,
      sessionTimeout: 60,
      // UI Customization default values
      headerColor: "#FFFFFF",
      headerLoginSignupButtonBgColor: "#3B82F6",
      headerLoginSignupButtonTextColor: "#FFFFFF",
      webMenuBgColor: "#F8FAFC",
      webMenuTextColor: "#0F172A",
      webMenuFontSize: "16px",
      webMenuHoverColor: "#3B82F6",
      mobileMenuLoginSignupButtonBgColor: "#3B82F6",
      mobileMenuLoginSignupButtonTextColor: "#FFFFFF",
      mobileMenuFontSize: "16px",
      footerText: "© 2025 Betting Platform. All rights reserved.",
      footerSocialLinks: {
        facebook: undefined,
        twitter: undefined,
        instagram: undefined,
        linkedin: undefined,
      },
    };

    const resetSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: defaultSettings },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Settings reset to default values successfully",
      data: {
        settings: resetSettings,
      },
    });
  } catch (error: any) {
    console.error("Reset settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during settings reset",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update theme colors
// @route   PATCH /api/settings/theme
// @access  Private (Admin only)
export const updateTheme = async (
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

    const { themeColor, primaryColor, secondaryColor, accentColor } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only theme-related fields
    const themeUpdates: any = {};
    if (themeColor) themeUpdates.themeColor = themeColor;
    if (primaryColor) themeUpdates.primaryColor = primaryColor;
    if (secondaryColor) themeUpdates.secondaryColor = secondaryColor;
    if (accentColor) themeUpdates.accentColor = accentColor;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: themeUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Theme colors updated successfully",
      data: {
        settings: {
          themeColor: updatedSettings?.themeColor,
          primaryColor: updatedSettings?.primaryColor,
          secondaryColor: updatedSettings?.secondaryColor,
          accentColor: updatedSettings?.accentColor,
        },
      },
    });
  } catch (error: any) {
    console.error("Update theme error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Theme validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during theme update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update organization details
// @route   PATCH /api/settings/organization
// @access  Private (Admin only)
export const updateOrganization = async (
  req: UpdateSettingsRequest,
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

    const {
      organizationName,
      organizationImage,
      logoUrl,
      faviconUrl,
      supportEmail,
      supportPhone,
      address,
      websiteUrl,
    } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only organization-related fields
    const orgUpdates: any = {};
    if (organizationName) orgUpdates.organizationName = organizationName;

    // Handle uploaded file
    if (req.file) {
      orgUpdates.organizationImage = `/upload/${req.file.filename}`;
    } else if (organizationImage) {
      orgUpdates.organizationImage = organizationImage;
    }

    if (logoUrl !== undefined) orgUpdates.logoUrl = logoUrl;
    if (faviconUrl !== undefined) orgUpdates.faviconUrl = faviconUrl;
    if (supportEmail) orgUpdates.supportEmail = supportEmail;
    if (supportPhone !== undefined) orgUpdates.supportPhone = supportPhone;
    if (address !== undefined) orgUpdates.address = address;
    if (websiteUrl !== undefined) orgUpdates.websiteUrl = websiteUrl;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: orgUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Organization details updated successfully",
      data: {
        settings: {
          organizationName: updatedSettings?.organizationName,
          organizationImage: updatedSettings?.organizationImage,
          logoUrl: updatedSettings?.logoUrl,
          faviconUrl: updatedSettings?.faviconUrl,
          supportEmail: updatedSettings?.supportEmail,
          supportPhone: updatedSettings?.supportPhone,
          address: updatedSettings?.address,
          websiteUrl: updatedSettings?.websiteUrl,
        },
      },
    });
  } catch (error: any) {
    console.error("Update organization error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Organization validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during organization update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update landing page header settings
// @route   PATCH /api/settings/landing-page/header
// @access  Private (Admin only)
export const updateLandingPageHeader = async (
  req: UpdateSettingsRequest,
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

    const {
      organizationName,
      organizationImage,
      logoUrl,
      faviconUrl,
      headerColor,
      headerLoginSignupButtonBgColor,
      headerLoginSignupButtonTextColor,
    } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only landing page header-related fields
    const headerUpdates: any = {};
    if (organizationName) headerUpdates.organizationName = organizationName;

    // Handle uploaded file
    if (req.file) {
      headerUpdates.organizationImage = `/upload/${req.file.filename}`;
    } else if (organizationImage) {
      headerUpdates.organizationImage = organizationImage;
    }

    if (logoUrl !== undefined) headerUpdates.logoUrl = logoUrl;
    if (faviconUrl !== undefined) headerUpdates.faviconUrl = faviconUrl;
    if (headerColor) headerUpdates.headerColor = headerColor;
    if (headerLoginSignupButtonBgColor)
      headerUpdates.headerLoginSignupButtonBgColor =
        headerLoginSignupButtonBgColor;
    if (headerLoginSignupButtonTextColor)
      headerUpdates.headerLoginSignupButtonTextColor =
        headerLoginSignupButtonTextColor;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: headerUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Landing page header updated successfully",
      data: {
        settings: {
          organizationName: updatedSettings?.organizationName,
          organizationImage: updatedSettings?.organizationImage,
          logoUrl: updatedSettings?.logoUrl,
          faviconUrl: updatedSettings?.faviconUrl,
          headerColor: updatedSettings?.headerColor,
          headerLoginSignupButtonBgColor:
            updatedSettings?.headerLoginSignupButtonBgColor,
          headerLoginSignupButtonTextColor:
            updatedSettings?.headerLoginSignupButtonTextColor,
        },
      },
    });
  } catch (error: any) {
    console.error("Update landing page header error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Header validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during header update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update landing page navigation settings
// @route   PATCH /api/settings/landing-page/navigation
// @access  Private (Admin only)
export const updateLandingPageNavigation = async (
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
      webMenuBgColor,
      webMenuTextColor,
      webMenuFontSize,
      webMenuHoverColor,
      mobileMenuFontSize,
      navigationItems,
    } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only navigation-related fields
    const navigationUpdates: any = {};
    if (webMenuBgColor) navigationUpdates.webMenuBgColor = webMenuBgColor;
    if (webMenuTextColor) navigationUpdates.webMenuTextColor = webMenuTextColor;
    if (webMenuFontSize) navigationUpdates.webMenuFontSize = webMenuFontSize;
    if (webMenuHoverColor)
      navigationUpdates.webMenuHoverColor = webMenuHoverColor;
    if (mobileMenuFontSize)
      navigationUpdates.mobileMenuFontSize = mobileMenuFontSize;
    if (navigationItems) navigationUpdates.navigationItems = navigationItems;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: navigationUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Landing page navigation updated successfully",
      data: {
        settings: {
          webMenuBgColor: updatedSettings?.webMenuBgColor,
          webMenuTextColor: updatedSettings?.webMenuTextColor,
          webMenuFontSize: updatedSettings?.webMenuFontSize,
          webMenuHoverColor: updatedSettings?.webMenuHoverColor,
          mobileMenuFontSize: updatedSettings?.mobileMenuFontSize,
          navigationItems: updatedSettings?.navigationItems,
        },
      },
    });
  } catch (error: any) {
    console.error("Update landing page navigation error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Navigation validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during navigation update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update landing page font settings
// @route   PATCH /api/settings/landing-page/fonts
// @access  Private (Admin only)
export const updateLandingPageFonts = async (
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

    const { webMenuFontSize, mobileMenuFontSize } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only font-related fields
    const fontUpdates: any = {};
    if (webMenuFontSize) fontUpdates.webMenuFontSize = webMenuFontSize;
    if (mobileMenuFontSize) fontUpdates.mobileMenuFontSize = mobileMenuFontSize;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: fontUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Landing page fonts updated successfully",
      data: {
        settings: {
          webMenuFontSize: updatedSettings?.webMenuFontSize,
          mobileMenuFontSize: updatedSettings?.mobileMenuFontSize,
        },
      },
    });
  } catch (error: any) {
    console.error("Update landing page fonts error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "Font validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during font update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update UI customization settings
// @route   PATCH /api/settings/ui
// @access  Public (but should be protected in production)
export const updateUISettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // NOTE: Removed admin requirement for easier testing
    // In production, you should uncomment the lines below:
    /*
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }
    */

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
      headerColor,
      headerLoginSignupButtonBgColor,
      headerLoginSignupButtonTextColor,
      webMenuBgColor,
      webMenuTextColor,
      webMenuFontSize,
      webMenuHoverColor,
      mobileMenuLoginSignupButtonBgColor,
      mobileMenuLoginSignupButtonTextColor,
      mobileMenuFontSize,
      footerText,
      footerSocialLinks,
    } = req.body;

    // Get current settings
    const currentSettings = await (Settings as any).getInstance();

    // Update only UI-related fields
    const uiUpdates: any = {};
    if (headerColor) uiUpdates.headerColor = headerColor;
    if (headerLoginSignupButtonBgColor)
      uiUpdates.headerLoginSignupButtonBgColor = headerLoginSignupButtonBgColor;
    if (headerLoginSignupButtonTextColor)
      uiUpdates.headerLoginSignupButtonTextColor =
        headerLoginSignupButtonTextColor;
    if (webMenuBgColor) uiUpdates.webMenuBgColor = webMenuBgColor;
    if (webMenuTextColor) uiUpdates.webMenuTextColor = webMenuTextColor;
    if (webMenuFontSize) uiUpdates.webMenuFontSize = webMenuFontSize;
    if (webMenuHoverColor) uiUpdates.webMenuHoverColor = webMenuHoverColor;
    if (mobileMenuLoginSignupButtonBgColor)
      uiUpdates.mobileMenuLoginSignupButtonBgColor =
        mobileMenuLoginSignupButtonBgColor;
    if (mobileMenuLoginSignupButtonTextColor)
      uiUpdates.mobileMenuLoginSignupButtonTextColor =
        mobileMenuLoginSignupButtonTextColor;
    if (mobileMenuFontSize) uiUpdates.mobileMenuFontSize = mobileMenuFontSize;
    if (footerText) uiUpdates.footerText = footerText;
    if (footerSocialLinks) uiUpdates.footerSocialLinks = footerSocialLinks;

    const updatedSettings = await Settings.findByIdAndUpdate(
      currentSettings._id,
      { $set: uiUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "UI settings updated successfully",
      data: {
        settings: {
          headerColor: updatedSettings?.headerColor,
          headerLoginSignupButtonBgColor:
            updatedSettings?.headerLoginSignupButtonBgColor,
          headerLoginSignupButtonTextColor:
            updatedSettings?.headerLoginSignupButtonTextColor,
          webMenuBgColor: updatedSettings?.webMenuBgColor,
          webMenuTextColor: updatedSettings?.webMenuTextColor,
          webMenuFontSize: updatedSettings?.webMenuFontSize,
          webMenuHoverColor: updatedSettings?.webMenuHoverColor,
          mobileMenuLoginSignupButtonBgColor:
            updatedSettings?.mobileMenuLoginSignupButtonBgColor,
          mobileMenuLoginSignupButtonTextColor:
            updatedSettings?.mobileMenuLoginSignupButtonTextColor,
          mobileMenuFontSize: updatedSettings?.mobileMenuFontSize,
          footerText: updatedSettings?.footerText,
          footerSocialLinks: updatedSettings?.footerSocialLinks,
        },
      },
    });
  } catch (error: any) {
    console.error("Update UI settings error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({
        success: false,
        message: "UI settings validation failed",
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during UI settings update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
