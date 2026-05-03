import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import AffiliateWithdrawMethod from "../models/AffiliateWithdrawMethod";
import path from "path";
import fs from "fs";

/**
 * @desc    Create affiliate withdraw method (Admin only)
 * @route   POST /api/affiliate/withdraw-methods
 * @access  Private (Admin)
 */
export const createAffiliateWithdrawMethod = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    console.log("=== CREATE AFFILIATE WITHDRAW METHOD ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const {
      methodNameEn,
      methodNameBn,
      minimumWithdrawal,
      maximumWithdrawal,
      processingTime,
      status,
      withdrawalFee,
      feeType,
      colors,
      instructionEn,
      instructionBn,
      userInputFields,
    } = req.body;

    // Validate required fields
    if (
      !methodNameEn ||
      !methodNameBn ||
      minimumWithdrawal === undefined ||
      maximumWithdrawal === undefined ||
      !processingTime ||
      withdrawalFee === undefined ||
      !feeType
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const methodImage = files?.methodImage?.[0]
      ? `/uploads/${files.methodImage[0].filename}`
      : "";
    const withdrawPageImage = files?.withdrawPageImage?.[0]
      ? `/uploads/${files.withdrawPageImage[0].filename}`
      : "";

    const createData = {
      methodNameEn,
      methodNameBn,
      minimumWithdrawal: Number(minimumWithdrawal),
      maximumWithdrawal: Number(maximumWithdrawal),
      processingTime,
      status: status || "Active",
      withdrawalFee: Number(withdrawalFee),
      feeType,
      methodImage,
      withdrawPageImage,
      colors: colors
        ? JSON.parse(colors)
        : {
            textColor: "#000000",
            backgroundColor: "#FFFFFF",
            buttonColor: "#FFFFFF",
          },
      instructionEn: instructionEn || "",
      instructionBn: instructionBn || "",
      userInputFields: userInputFields ? JSON.parse(userInputFields) : [],
    };

    console.log("Data to create:", JSON.stringify(createData, null, 2));

    const withdrawMethod = await AffiliateWithdrawMethod.create(createData);

    console.log(
      "✅ Created affiliate withdraw method:",
      JSON.stringify(withdrawMethod, null, 2),
    );

    res.status(201).json({
      success: true,
      message: "Affiliate withdraw method created successfully",
      data: withdrawMethod,
    });
  } catch (error) {
    console.error("❌ Error creating affiliate withdraw method:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get all affiliate withdraw methods (Admin)
 * @route   GET /api/affiliate/withdraw-methods
 * @access  Private (Admin)
 */
export const getAllAffiliateWithdrawMethods = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const withdrawMethods = await AffiliateWithdrawMethod.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: withdrawMethods.length,
      data: withdrawMethods,
    });
  } catch (error) {
    console.error("Error fetching affiliate withdraw methods:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get single affiliate withdraw method (Admin)
 * @route   GET /api/affiliate/withdraw-methods/:id
 * @access  Private (Admin)
 */
export const getAffiliateWithdrawMethod = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const withdrawMethod = await AffiliateWithdrawMethod.findById(id);

    if (!withdrawMethod) {
      res.status(404).json({
        success: false,
        message: "Affiliate withdraw method not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: withdrawMethod,
    });
  } catch (error) {
    console.error("Error fetching affiliate withdraw method:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Update affiliate withdraw method (Admin)
 * @route   PUT /api/affiliate/withdraw-methods/:id
 * @access  Private (Admin)
 */
export const updateAffiliateWithdrawMethod = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      methodNameEn,
      methodNameBn,
      minimumWithdrawal,
      maximumWithdrawal,
      processingTime,
      status,
      withdrawalFee,
      feeType,
      colors,
      instructionEn,
      instructionBn,
      userInputFields,
    } = req.body;

    const withdrawMethod = await AffiliateWithdrawMethod.findById(id);

    if (!withdrawMethod) {
      res.status(404).json({
        success: false,
        message: "Affiliate withdraw method not found",
      });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle method image update
    if (files?.methodImage?.[0]) {
      if (withdrawMethod.methodImage) {
        const oldImagePath = path.join(
          __dirname,
          "../../",
          withdrawMethod.methodImage.replace(/^\//, ""),
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      withdrawMethod.methodImage = `/uploads/${files.methodImage[0].filename}`;
    }

    // Handle withdraw page image update
    if (files?.withdrawPageImage?.[0]) {
      if (withdrawMethod.withdrawPageImage) {
        const oldImagePath = path.join(
          __dirname,
          "../../",
          withdrawMethod.withdrawPageImage.replace(/^\//, ""),
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      withdrawMethod.withdrawPageImage = `/uploads/${files.withdrawPageImage[0].filename}`;
    }

    if (methodNameEn) withdrawMethod.methodNameEn = methodNameEn;
    if (methodNameBn) withdrawMethod.methodNameBn = methodNameBn;
    if (minimumWithdrawal !== undefined)
      withdrawMethod.minimumWithdrawal = Number(minimumWithdrawal);
    if (maximumWithdrawal !== undefined)
      withdrawMethod.maximumWithdrawal = Number(maximumWithdrawal);
    if (processingTime) withdrawMethod.processingTime = processingTime;
    if (status !== undefined) withdrawMethod.status = status;
    if (withdrawalFee !== undefined)
      withdrawMethod.withdrawalFee = Number(withdrawalFee);
    if (feeType) withdrawMethod.feeType = feeType;
    if (colors) withdrawMethod.colors = JSON.parse(colors);
    if (instructionEn !== undefined)
      withdrawMethod.instructionEn = instructionEn;
    if (instructionBn !== undefined)
      withdrawMethod.instructionBn = instructionBn;
    if (userInputFields)
      withdrawMethod.userInputFields = JSON.parse(userInputFields);

    await withdrawMethod.save();

    console.log(`✅ Updated affiliate withdraw method: ${id}`);

    res.status(200).json({
      success: true,
      message: "Affiliate withdraw method updated successfully",
      data: withdrawMethod,
    });
  } catch (error) {
    console.error("Error updating affiliate withdraw method:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Delete affiliate withdraw method (Admin)
 * @route   DELETE /api/affiliate/withdraw-methods/:id
 * @access  Private (Admin)
 */
export const deleteAffiliateWithdrawMethod = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const withdrawMethod = await AffiliateWithdrawMethod.findByIdAndDelete(id);

    if (!withdrawMethod) {
      res.status(404).json({
        success: false,
        message: "Affiliate withdraw method not found",
      });
      return;
    }

    // Delete method image
    if (withdrawMethod.methodImage) {
      const methodImagePath = path.join(
        __dirname,
        "../../",
        withdrawMethod.methodImage.replace(/^\//, ""),
      );
      if (fs.existsSync(methodImagePath)) {
        fs.unlinkSync(methodImagePath);
      }
    }

    // Delete withdraw page image
    if (withdrawMethod.withdrawPageImage) {
      const withdrawImagePath = path.join(
        __dirname,
        "../../",
        withdrawMethod.withdrawPageImage.replace(/^\//, ""),
      );
      if (fs.existsSync(withdrawImagePath)) {
        fs.unlinkSync(withdrawImagePath);
      }
    }

    console.log(`✅ Deleted affiliate withdraw method: ${id}`);

    res.status(200).json({
      success: true,
      message: "Affiliate withdraw method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting affiliate withdraw method:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get active affiliate withdraw methods (Public)
 * @route   GET /api/affiliate/withdraw-methods/active
 * @access  Public
 */
export const getActiveAffiliateWithdrawMethods = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const withdrawMethods = await AffiliateWithdrawMethod.find({
      status: "Active",
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: withdrawMethods.length,
      data: withdrawMethods,
    });
  } catch (error) {
    console.error("Error fetching active affiliate withdraw methods:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

/**
 * @desc    Get single active affiliate withdraw method (Public)
 * @route   GET /api/affiliate/withdraw-methods/active/:id
 * @access  Public
 */
export const getActiveAffiliateWithdrawMethod = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const withdrawMethod = await AffiliateWithdrawMethod.findOne({
      _id: id,
      status: "Active",
    });

    if (!withdrawMethod) {
      res.status(404).json({
        success: false,
        message: "Affiliate withdraw method not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: withdrawMethod,
    });
  } catch (error) {
    console.error("Error fetching active affiliate withdraw method:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
