import { Request, Response } from "express";
import PaymentMethod from "../models/PaymentMethod";
import { deleteCloudinaryImage, extractPublicId } from "../config/cloudinary";
import { v2 as cloudinary } from "cloudinary";

// @desc    Test Cloudinary connection
// @route   GET /api/payment-methods/test-cloudinary
// @access  Private (Admin only)
export const testCloudinaryConnection = async (req: Request, res: Response) => {
  try {
    console.log("🧪 Testing Cloudinary connection...");

    // Test Cloudinary configuration
    const config = cloudinary.config();
    console.log("☁️ Current Cloudinary Config:", {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? "✅ Set" : "❌ Missing",
      api_secret: config.api_secret ? "✅ Set" : "❌ Missing",
    });

    // Try to get account details
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);

    res.status(200).json({
      success: true,
      message: "Cloudinary connection successful",
      data: {
        cloud_name: config.cloud_name,
        status: result.status,
        config_valid: true,
      },
    });
  } catch (error: any) {
    console.error("❌ Cloudinary connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message,
      details: {
        cloud_name: cloudinary.config().cloud_name,
        api_key_set: !!cloudinary.config().api_key,
        api_secret_set: !!cloudinary.config().api_secret,
      },
    });
  }
};

// @desc    Get all payment methods
// @route   GET /api/payment-methods
// @access  Public
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const paymentMethods = await PaymentMethod.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single payment method
// @route   GET /api/payment-methods/:id
// @access  Public
export const getPaymentMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: paymentMethod,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new payment method
// @route   POST /api/payment-methods
// @access  Private (Admin only)
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const {
      method_name_en,
      method_name_bd,
      agent_wallet_number,
      agent_wallet_text,
      gateways,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs,
    } = req.body;

    console.log("📝 Creating payment method with data:", {
      method_name_en,
      files: req.files ? Object.keys(req.files) : "No files",
    });

    // Handle uploaded files from Cloudinary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let methodImageUrl = null;
    let paymentPageImageUrl = null;

    // Get Cloudinary URLs from uploaded files
    if (files?.method_image?.[0]) {
      methodImageUrl = (files.method_image[0] as any).path; // Cloudinary URL
      console.log("✅ Method image uploaded to Cloudinary:", methodImageUrl);
    }

    if (files?.payment_page_image?.[0]) {
      paymentPageImageUrl = (files.payment_page_image[0] as any).path; // Cloudinary URL
      console.log(
        "✅ Payment page image uploaded to Cloudinary:",
        paymentPageImageUrl
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

    // Parse gateways if it's a string (from form data)
    let parsedGateways = gateways;
    if (typeof gateways === "string") {
      try {
        parsedGateways = JSON.parse(gateways);
      } catch (error) {
        console.log("⚠️ Error parsing gateways, using empty array");
        parsedGateways = [];
      }
    }

    const paymentMethod = await PaymentMethod.create({
      method_name_en,
      method_name_bd,
      agent_wallet_number,
      agent_wallet_text,
      method_image: methodImageUrl,
      payment_page_image: paymentPageImageUrl,
      gateways: parsedGateways,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs: parsedUserInputs,
    });

    console.log("✅ Payment method created successfully:", paymentMethod._id);

    res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: paymentMethod,
    });
  } catch (error: any) {
    console.error("❌ Error creating payment method:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create payment method",
      error: error.message,
    });
  }
};

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private (Admin only)
export const updatePaymentMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      method_name_en,
      method_name_bd,
      agent_wallet_number,
      agent_wallet_text,
      gateways,
      text_color,
      background_color,
      button_color,
      instruction_en,
      instruction_bd,
      status,
      user_inputs,
    } = req.body;

    console.log("📝 Updating payment method:", req.params.id);

    // Get existing payment method to handle old images
    const existingPaymentMethod = await PaymentMethod.findById(req.params.id);
    if (!existingPaymentMethod) {
      res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
      return;
    }

    // Handle uploaded files from Cloudinary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {
      method_name_en,
      method_name_bd,
      agent_wallet_number,
      agent_wallet_text,
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
      if (existingPaymentMethod.method_image) {
        const oldPublicId = extractPublicId(existingPaymentMethod.method_image);
        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      }
      updateData.method_image = (files.method_image[0] as any).path; // Cloudinary URL
      console.log(
        "✅ Method image updated in Cloudinary:",
        updateData.method_image
      );
    }

    // Handle payment_page_image
    if (files?.payment_page_image?.[0]) {
      // Delete old image from Cloudinary if exists
      if (existingPaymentMethod.payment_page_image) {
        const oldPublicId = extractPublicId(
          existingPaymentMethod.payment_page_image
        );
        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      }
      updateData.payment_page_image = (files.payment_page_image[0] as any).path; // Cloudinary URL
      console.log(
        "✅ Payment page image updated in Cloudinary:",
        updateData.payment_page_image
      );
    }

    // Parse user_inputs if it's a string (from form data)
    if (user_inputs) {
      if (typeof user_inputs === "string") {
        try {
          updateData.user_inputs = JSON.parse(user_inputs);
        } catch (error) {
          console.log("⚠️ Error parsing user_inputs, keeping existing");
          updateData.user_inputs = existingPaymentMethod.user_inputs;
        }
      } else {
        updateData.user_inputs = user_inputs;
      }
    }

    // Parse gateways if it's a string (from form data)
    if (gateways) {
      if (typeof gateways === "string") {
        try {
          updateData.gateways = JSON.parse(gateways);
        } catch (error) {
          console.log("⚠️ Error parsing gateways, keeping existing");
          updateData.gateways = existingPaymentMethod.gateways;
        }
      } else {
        updateData.gateways = gateways;
      }
    }

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("✅ Payment method updated successfully:", paymentMethod?._id);

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: paymentMethod,
    });
  } catch (error: any) {
    console.error("❌ Error updating payment method:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update payment method",
      error: error.message,
    });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private (Admin only)
export const deletePaymentMethod = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
      return;
    }

    // Delete images from Cloudinary before deleting the record
    if (paymentMethod.method_image) {
      const methodImagePublicId = extractPublicId(paymentMethod.method_image);
      if (methodImagePublicId) {
        await deleteCloudinaryImage(methodImagePublicId);
      }
    }

    if (paymentMethod.payment_page_image) {
      const paymentPageImagePublicId = extractPublicId(
        paymentMethod.payment_page_image
      );
      if (paymentPageImagePublicId) {
        await deleteCloudinaryImage(paymentPageImagePublicId);
      }
    }

    // Delete the payment method record
    await PaymentMethod.findByIdAndDelete(req.params.id);

    console.log(
      "✅ Payment method and associated images deleted:",
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting payment method:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Toggle payment method status
// @route   PATCH /api/payment-methods/:id/status
// @access  Private (Admin only)
export const togglePaymentMethodStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
      return;
    }

    paymentMethod.status =
      paymentMethod.status === "Active" ? "Inactive" : "Active";
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: `Payment method ${paymentMethod.status.toLowerCase()} successfully`,
      data: paymentMethod,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
