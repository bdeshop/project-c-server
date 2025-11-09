import { Request, Response } from 'express';
import PromoSection, { IPromoSection } from '../models/PromoSection';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// @desc    Get promo section
// @route   GET /api/promo-section
// @access  Public
export const getPromoSection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const promoSection = await (PromoSection as any).getInstance();
    
    // Check if the promo section is active
    // If not active, only allow access if user is admin
    if (!promoSection.isActive) {
      // Check if user is authenticated and is admin
      if (!req.user || req.user.role !== "admin") {
        res.status(404).json({
          success: false,
          message: "Promo section is not active",
        });
        return;
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Promo section retrieved successfully",
      data: {
        promoSection: {
          banner: promoSection.banner,
          video: promoSection.video,
          extraBanner: promoSection.extraBanner,
          isActive: promoSection.isActive,
        }
      }
    });
  } catch (error: any) {
    console.error("Get promo section error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving promo section",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update promo section
// @route   PUT /api/promo-section
// @access  Private (Admin only)
export const updatePromoSection = async (
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

    const { banner, video, extraBanner, isActive } = req.body;

    // Get current promo section
    const currentPromoSection = await (PromoSection as any).getInstance();

    // Prepare update object
    const updates: any = {};
    if (banner) updates.banner = banner;
    if (video) updates.video = video;
    if (extraBanner) updates.extraBanner = extraBanner;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    // Update promo section
    const updatedPromoSection = await PromoSection.findByIdAndUpdate(
      currentPromoSection._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPromoSection) {
      res.status(404).json({
        success: false,
        message: "Promo section not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Promo section updated successfully",
      data: {
        promoSection: {
          banner: updatedPromoSection.banner,
          video: updatedPromoSection.video,
          extraBanner: updatedPromoSection.extraBanner,
          isActive: updatedPromoSection.isActive,
        }
      }
    });
  } catch (error: any) {
    console.error("Update promo section error:", error);

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
      message: "Server error during promo section update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Toggle promo section active status
// @route   PATCH /api/promo-section/toggle
// @access  Private (Admin only)
export const togglePromoSection = async (
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

    // Get current promo section
    const currentPromoSection = await (PromoSection as any).getInstance();

    // Toggle isActive status
    const newStatus = !currentPromoSection.isActive;
    
    const updatedPromoSection = await PromoSection.findByIdAndUpdate(
      currentPromoSection._id,
      { isActive: newStatus },
      { new: true, runValidators: true }
    );

    if (!updatedPromoSection) {
      res.status(404).json({
        success: false,
        message: "Promo section not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Promo section ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: {
        promoSection: {
          isActive: updatedPromoSection.isActive,
        }
      }
    });
  } catch (error: any) {
    console.error("Toggle promo section error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during promo section toggle",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};