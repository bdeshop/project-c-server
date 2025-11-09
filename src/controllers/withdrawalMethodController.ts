import { Request, Response } from "express";
import WithdrawalMethod from "../models/WithdrawalMethod";
import { deleteCloudinaryImage, extractPublicId } from "../config/cloudinary";

// @desc    Get all withdrawal methods
// @route   GET /api/withdrawal-methods
// @access  Public
export const getWithdrawalMethods = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const withdrawalMethods = await WithdrawalMethod.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: withdrawalMethods.length,
      data: withdrawalMethods,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single withdrawal method
// @route   GET /api/withdrawal-methods/:id
// @access  Public
export const getWithdrawalMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const withdrawalMethod = await WithdrawalMethod.findById(req.params.id);

    if (!withdrawalMethod) {
      res.status(404).json({
        success: false,
        message: "Withdrawal method not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: withdrawalMethod,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new withdrawal method
// @route   POST /api/withdrawal-methods
// @access  Private (Admin only)
export const createWithdrawalMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      method_name_en,
      method_name_bd,
      min_withdrawal,
      max_withdrawal,
      processing_time,
      withdrawal_fee,
      fee_type,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs,
    } = req.body;

    console.log("📝 Creating withdrawal method with data:", {
      method_name_en,
      files: req.files ? Object.keys(req.files) : "No files",
    });

    // Handle uploaded files from Cloudinary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let methodImageUrl = null;
    let withdrawalPageImageUrl = null;

    // Get Cloudinary URLs from uploaded files
    if (files?.method_image?.[0]) {
      methodImageUrl = (files.method_image[0] as any).path;
      console.log("✅ Method image uploaded to Cloudinary:", methodImageUrl);
    }

    if (files?.withdrawal_page_image?.[0]) {
      withdrawalPageImageUrl = (files.withdrawal_page_image[0] as any).path;
      console.log(
        "✅ Withdrawal page image uploaded to Cloudinary:",
        withdrawalPageImageUrl
      );
    }

    // Parse user_inputs if it's a string (from form data)
    let parsedUserInputs = user_inputs;
    if (typeof user_inputs === "string") {
      try {
        parsedUserInputs = JSON.parse(user_inputs);
      } catch (error) {
        console.log("⚠️ Error parsing user_inputs, using empty array");
        parsedUserInputs = [];
      }
    }

    const withdrawalMethod = await WithdrawalMethod.create({
      method_name_en,
      method_name_bd,
      method_image: methodImageUrl,
      withdrawal_page_image: withdrawalPageImageUrl,
      min_withdrawal: min_withdrawal || 100,
      max_withdrawal: max_withdrawal || 100000,
      processing_time: processing_time || "24 hours",
      withdrawal_fee: withdrawal_fee || 0,
      fee_type: fee_type || "fixed",
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs: parsedUserInputs,
    });

    console.log(
      "✅ Withdrawal method created successfully:",
      withdrawalMethod._id
    );

    res.status(201).json({
      success: true,
      message: "Withdrawal method created successfully",
      data: withdrawalMethod,
    });
  } catch (error: any) {
    console.error("❌ Error creating withdrawal method:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create withdrawal method",
      error: error.message,
    });
  }
};

// @desc    Update withdrawal method
// @route   PUT /api/withdrawal-methods/:id
// @access  Private (Admin only)
export const updateWithdrawalMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      method_name_en,
      method_name_bd,
      min_withdrawal,
      max_withdrawal,
      processing_time,
      withdrawal_fee,
      fee_type,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs,
    } = req.body;

    console.log("📝 Updating withdrawal method:", req.params.id);

    // Get existing withdrawal method to handle old images
    const existingWithdrawalMethod = await WithdrawalMethod.findById(
      req.params.id
    );
    if (!existingWithdrawalMethod) {
      res.status(404).json({
        success: false,
        message: "Withdrawal method not found",
      });
      return;
    }

    // Handle uploaded files from Cloudinary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {
      method_name_en,
      method_name_bd,
      min_withdrawal,
      max_withdrawal,
      processing_time,
      withdrawal_fee,
      fee_type,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
    };

    // Handle method_image
    if (files?.method_image?.[0]) {
      // Delete old image from Cloudinary if exists
      if (existingWithdrawalMethod.method_image) {
        const oldPublicId = extractPublicId(
          existingWithdrawalMethod.method_image
        );
        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      }
      updateData.method_image = (files.method_image[0] as any).path;
      console.log(
        "✅ Method image updated in Cloudinary:",
        updateData.method_image
      );
    }

    // Handle withdrawal_page_image
    if (files?.withdrawal_page_image?.[0]) {
      // Delete old image from Cloudinary if exists
      if (existingWithdrawalMethod.withdrawal_page_image) {
        const oldPublicId = extractPublicId(
          existingWithdrawalMethod.withdrawal_page_image
        );
        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      }
      updateData.withdrawal_page_image = (
        files.withdrawal_page_image[0] as any
      ).path;
      console.log(
        "✅ Withdrawal page image updated in Cloudinary:",
        updateData.withdrawal_page_image
      );
    }

    // Parse user_inputs if it's a string (from form data)
    if (user_inputs) {
      if (typeof user_inputs === "string") {
        try {
          updateData.user_inputs = JSON.parse(user_inputs);
        } catch (error) {
          console.log("⚠️ Error parsing user_inputs, keeping existing");
          updateData.user_inputs = existingWithdrawalMethod.user_inputs;
        }
      } else {
        updateData.user_inputs = user_inputs;
      }
    }

    const withdrawalMethod = await WithdrawalMethod.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log(
      "✅ Withdrawal method updated successfully:",
      withdrawalMethod?._id
    );

    res.status(200).json({
      success: true,
      message: "Withdrawal method updated successfully",
      data: withdrawalMethod,
    });
  } catch (error: any) {
    console.error("❌ Error updating withdrawal method:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update withdrawal method",
      error: error.message,
    });
  }
};

// @desc    Delete withdrawal method
// @route   DELETE /api/withdrawal-methods/:id
// @access  Private (Admin only)
export const deleteWithdrawalMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const withdrawalMethod = await WithdrawalMethod.findById(req.params.id);

    if (!withdrawalMethod) {
      res.status(404).json({
        success: false,
        message: "Withdrawal method not found",
      });
      return;
    }

    // Delete images from Cloudinary before deleting the record
    if (withdrawalMethod.method_image) {
      const methodImagePublicId = extractPublicId(
        withdrawalMethod.method_image
      );
      if (methodImagePublicId) {
        await deleteCloudinaryImage(methodImagePublicId);
      }
    }

    if (withdrawalMethod.withdrawal_page_image) {
      const withdrawalPageImagePublicId = extractPublicId(
        withdrawalMethod.withdrawal_page_image
      );
      if (withdrawalPageImagePublicId) {
        await deleteCloudinaryImage(withdrawalPageImagePublicId);
      }
    }

    // Delete the withdrawal method record
    await WithdrawalMethod.findByIdAndDelete(req.params.id);

    console.log(
      "✅ Withdrawal method and associated images deleted:",
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Withdrawal method deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting withdrawal method:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Toggle withdrawal method status
// @route   PATCH /api/withdrawal-methods/:id/status
// @access  Private (Admin only)
export const toggleWithdrawalMethodStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const withdrawalMethod = await WithdrawalMethod.findById(req.params.id);

    if (!withdrawalMethod) {
      res.status(404).json({
        success: false,
        message: "Withdrawal method not found",
      });
      return;
    }

    withdrawalMethod.status =
      withdrawalMethod.status === "Active" ? "Inactive" : "Active";
    await withdrawalMethod.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal method ${withdrawalMethod.status.toLowerCase()} successfully`,
      data: withdrawalMethod,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
