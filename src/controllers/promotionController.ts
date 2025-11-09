import { Request, Response } from "express";
import Promotion, { IPromotion } from "../models/Promotion";
import { deleteCloudinaryImage, extractPublicId } from "../config/cloudinary";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Helper function to get image URL (Cloudinary URLs are already full URLs)
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // Cloudinary URLs are already full URLs, return as is
  if (imagePath.startsWith("http")) return imagePath;

  // For backward compatibility with local files (shouldn't happen with Cloudinary)
  return imagePath;
};

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
export const getPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await Promotion.find()
      .populate("payment_methods", "method_name_en method_name_bd status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Public
export const getPromotion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id).populate(
      "payment_methods"
    );

    if (!promotion) {
      res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
      return;
    }

    // Get image URL (Cloudinary URLs are already full URLs)
    const promotionObj = promotion.toObject();
    promotionObj.promotion_image = getImageUrl(
      promotionObj.promotion_image ?? null
    );

    res.status(200).json({
      success: true,
      data: promotionObj,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private (Admin only)
export const createPromotion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title_en,
      title_bd,
      description_en,
      description_bd,
      game_type,
      payment_methods,
      bonus_settings,
      status,
    } = req.body;

    // Parse payment_methods if it's a string (from form data)
    let parsedPaymentMethods = payment_methods;
    if (typeof payment_methods === "string") {
      try {
        parsedPaymentMethods = JSON.parse(payment_methods);
      } catch (parseError) {
        res.status(400).json({
          success: false,
          message: "Invalid payment_methods format",
          error: "payment_methods must be a valid JSON array",
        });
        return;
      }
    }

    // Parse bonus_settings if it's a string (from form data)
    let parsedBonusSettings = bonus_settings;
    if (typeof bonus_settings === "string") {
      try {
        parsedBonusSettings = JSON.parse(bonus_settings);
      } catch (parseError) {
        // If parsing fails, use default bonus settings
        parsedBonusSettings = {
          bonus_type: "fixed",
          bonus_value: 0,
          max_bonus_limit: 0,
        };
      }
    }

    // Handle Cloudinary file upload - get the secure URL from multer-storage-cloudinary
    const promotion_image = req.file ? (req.file as any).path : null;

    const promotion = await Promotion.create({
      promotion_image,
      title_en,
      title_bd,
      description_en,
      description_bd,
      game_type,
      payment_methods: parsedPaymentMethods,
      bonus_settings: parsedBonusSettings,
      status,
    });

    // Populate payment methods in response
    await promotion.populate(
      "payment_methods",
      "method_name_en method_name_bd status"
    );

    // Get image URL for response (Cloudinary URLs are already full URLs)
    const promotionObj = promotion.toObject();
    promotionObj.promotion_image = getImageUrl(
      promotionObj.promotion_image ?? null
    );

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: promotionObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create promotion",
      error: error.message,
    });
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private (Admin only)
export const updatePromotion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Get the existing promotion to handle image deletion if needed
    const existingPromotion = await Promotion.findById(req.params.id);

    // Handle Cloudinary file upload - get the secure URL from multer-storage-cloudinary
    const updateData = { ...req.body };

    // Parse payment_methods if it's a string (from form data)
    if (
      updateData.payment_methods &&
      typeof updateData.payment_methods === "string"
    ) {
      try {
        updateData.payment_methods = JSON.parse(updateData.payment_methods);
      } catch (parseError) {
        res.status(400).json({
          success: false,
          message: "Invalid payment_methods format",
          error: "payment_methods must be a valid JSON array",
        });
        return;
      }
    }

    // Parse bonus_settings if it's a string (from form data)
    if (
      updateData.bonus_settings &&
      typeof updateData.bonus_settings === "string"
    ) {
      try {
        updateData.bonus_settings = JSON.parse(updateData.bonus_settings);
      } catch (parseError) {
        // If parsing fails, keep the existing bonus settings
        delete updateData.bonus_settings;
      }
    }

    if (req.file) {
      updateData.promotion_image = (req.file as any).path;

      // Delete old image from Cloudinary if it exists
      if (existingPromotion?.promotion_image) {
        const publicId = extractPublicId(existingPromotion.promotion_image);
        if (publicId) {
          await deleteCloudinaryImage(publicId);
        }
      }
    }

    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("payment_methods", "method_name_en method_name_bd status");

    if (!promotion) {
      res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
      return;
    }

    // Get image URL for response (Cloudinary URLs are already full URLs)
    const promotionObj = promotion.toObject();
    promotionObj.promotion_image = getImageUrl(
      promotionObj.promotion_image ?? null
    );

    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      data: promotionObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update promotion",
      error: error.message,
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private (Admin only)
export const deletePromotion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (promotion.promotion_image) {
      const publicId = extractPublicId(promotion.promotion_image);
      if (publicId) {
        await deleteCloudinaryImage(publicId);
      }
    }

    // Delete the promotion from database
    await Promotion.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Toggle promotion status
// @route   PATCH /api/promotions/:id/status
// @access  Private (Admin only)
export const togglePromotionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
      return;
    }

    promotion.status = promotion.status === "Active" ? "Inactive" : "Active";
    await promotion.save();

    await promotion.populate(
      "payment_methods",
      "method_name_en method_name_bd status"
    );

    // Get image URL for response (Cloudinary URLs are already full URLs)
    const promotionObj = promotion.toObject();
    promotionObj.promotion_image = getImageUrl(
      promotionObj.promotion_image ?? null
    );

    res.status(200).json({
      success: true,
      message: `Promotion ${promotion.status.toLowerCase()} successfully`,
      data: promotionObj,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get promotions by game type
// @route   GET /api/promotions/game/:gameType
// @access  Public
export const getPromotionsByGameType = async (req: Request, res: Response) => {
  try {
    const { gameType } = req.params;

    const promotions = await Promotion.find({
      game_type: gameType,
      status: "Active",
    }).populate("payment_methods", "method_name_en method_name_bd status");

    // Get image URLs (Cloudinary URLs are already full URLs)
    const promotionsWithImageUrls = promotions.map((promotion) => {
      const promotionObj = promotion.toObject();
      promotionObj.promotion_image = getImageUrl(
        promotionObj.promotion_image ?? null
      );
      return promotionObj;
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotionsWithImageUrls,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Test image access for React applications
// @route   GET /api/promotions/test-images
// @access  Public
export const testImageAccess = async (req: Request, res: Response) => {
  try {
    // Get a sample promotion with image
    const samplePromotion = await Promotion.findOne({
      promotion_image: { $ne: null },
    });

    const testData = {
      message: "Image access test for React applications",
      frontendUrls: [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      backendUrl:
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`,
      sampleImageUrl: samplePromotion
        ? getImageUrl(samplePromotion.promotion_image ?? null)
        : null,
      corsEnabled: true,
      instructions: {
        react: "Use the full image URLs directly in your <img> tags",
        fetch:
          "Images should be accessible via fetch() or axios from your React apps",
        example: samplePromotion
          ? `<img src="${getImageUrl(
              samplePromotion.promotion_image ?? null
            )}" alt="Promotion" />`
          : "No sample image available - create a promotion with image first",
      },
    };

    res.status(200).json({
      success: true,
      data: testData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Test Cloudinary connection for promotions
// @route   GET /api/promotions/test-cloudinary
// @access  Private (Admin only)
export const testCloudinaryConnection = async (req: Request, res: Response) => {
  try {
    const cloudinary = require("cloudinary").v2;

    // Test Cloudinary connection
    const result = await cloudinary.api.ping();

    res.status(200).json({
      success: true,
      message: "Cloudinary connection successful for promotions",
      data: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        status: result.status || "ok",
        config_valid: true,
        folder: "promotions",
        upload_settings: {
          max_file_size: "10MB",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
          transformations: {
            width: 800,
            height: 600,
            crop: "limit",
            quality: "auto",
            format: "auto",
          },
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message,
    });
  }
};
