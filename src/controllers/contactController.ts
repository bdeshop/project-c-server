import { Request, Response } from "express";
import ContactSettings from "../models/ContactSettings";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// @desc    Get contact settings
// @route   GET /api/contact
// @access  Public
export const getContactSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await ContactSettings.getInstance();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get contact settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update contact settings
// @route   PUT /api/contact
// @access  Private (Admin only)
export const updateContactSettings = async (
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

    const { service247Url, whatsappUrl, telegramUrl, facebookUrl } = req.body;

    const settings = await ContactSettings.getInstance();

    // Update only provided fields
    if (service247Url !== undefined) settings.service247Url = service247Url;
    if (whatsappUrl !== undefined) settings.whatsappUrl = whatsappUrl;
    if (telegramUrl !== undefined) settings.telegramUrl = telegramUrl;
    if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;

    await settings.save();

    console.log("✅ Contact settings updated:", {
      service247Url: settings.service247Url,
      whatsappUrl: settings.whatsappUrl,
      telegramUrl: settings.telegramUrl,
      facebookUrl: settings.facebookUrl,
    });

    res.status(200).json({
      success: true,
      message: "Contact settings updated successfully",
      data: settings,
    });
  } catch (error: any) {
    console.error("Update contact settings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update contact settings",
      error: error.message,
    });
  }
};
