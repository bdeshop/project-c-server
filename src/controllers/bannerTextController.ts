import { Request, Response } from 'express';
import BannerText, { IBannerText } from '../models/BannerText';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// @desc    Get banner text
// @route   GET /api/banner-text
// @access  Public
export const getBannerText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bannerText = await (BannerText as any).getInstance();
    
    res.status(200).json({
      success: true,
      message: "Banner text retrieved successfully",
      data: {
        bannerText: {
          englishText: bannerText.englishText,
          banglaText: bannerText.banglaText,
        }
      }
    });
  } catch (error: any) {
    console.error("Get banner text error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving banner text",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update banner text
// @route   PUT /api/banner-text
// @access  Private (Admin only)
export const updateBannerText = async (
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

    const { englishText, banglaText } = req.body;

    // Validate input
    if (!englishText || !banglaText) {
      res.status(400).json({
        success: false,
        message: "Both English and Bangla text are required",
      });
      return;
    }

    // Get current banner text
    const currentBannerText = await (BannerText as any).getInstance();

    // Update banner text
    const updatedBannerText = await BannerText.findByIdAndUpdate(
      currentBannerText._id,
      { englishText, banglaText },
      { new: true, runValidators: true }
    );

    if (!updatedBannerText) {
      res.status(404).json({
        success: false,
        message: "Banner text not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Banner text updated successfully",
      data: {
        bannerText: {
          englishText: updatedBannerText.englishText,
          banglaText: updatedBannerText.banglaText,
        }
      }
    });
  } catch (error: any) {
    console.error("Update banner text error:", error);

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
      message: "Server error during banner text update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};