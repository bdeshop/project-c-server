import { Request, Response } from "express";
import ApkFile from "../models/ApkFile";
import path from "path";
import fs from "fs";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// @desc    Upload APK file
// @route   POST /api/apk/upload
// @access  Private (Admin only)
export const uploadApk = async (
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No APK file uploaded",
      });
      return;
    }

    const { version, description } = req.body;

    // Create APK file record
    const apkFile = await ApkFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      version: version || "1.0.0",
      size: req.file.size,
      uploadedBy: req.user.id,
      description: description || "",
      isActive: true,
    });

    console.log("✅ APK file uploaded:", {
      filename: apkFile.filename,
      version: apkFile.version,
      size: `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    res.status(201).json({
      success: true,
      message: "APK file uploaded successfully",
      data: {
        id: apkFile._id,
        filename: apkFile.filename,
        originalName: apkFile.originalName,
        version: apkFile.version,
        size: apkFile.size,
        downloadUrl: `/api/apk/download/${apkFile._id}`,
        createdAt: apkFile.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Upload APK error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload APK file",
      error: error.message,
    });
  }
};

// @desc    Get all APK files
// @route   GET /api/apk
// @access  Public
export const getAllApks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apkFiles = await ApkFile.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: apkFiles.length,
      data: apkFiles.map((apk) => ({
        id: apk._id,
        filename: apk.filename,
        originalName: apk.originalName,
        version: apk.version,
        size: apk.size,
        sizeInMB: `${(apk.size / (1024 * 1024)).toFixed(2)} MB`,
        downloadCount: apk.downloadCount,
        isActive: apk.isActive,
        description: apk.description,
        downloadUrl: `/api/apk/download/${apk._id}`,
        uploadedBy: apk.uploadedBy,
        createdAt: apk.createdAt,
        updatedAt: apk.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get all APKs error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get active/latest APK file
// @route   GET /api/apk/latest
// @access  Public
export const getLatestApk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apkFile = await ApkFile.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");

    if (!apkFile) {
      res.status(404).json({
        success: false,
        message: "No active APK file found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: apkFile._id,
        filename: apkFile.filename,
        originalName: apkFile.originalName,
        version: apkFile.version,
        size: apkFile.size,
        sizeInMB: `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB`,
        downloadCount: apkFile.downloadCount,
        description: apkFile.description,
        downloadUrl: `/api/apk/download/${apkFile._id}`,
        uploadedBy: apkFile.uploadedBy,
        createdAt: apkFile.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get latest APK error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Download APK file
// @route   GET /api/apk/download/:id
// @access  Public
export const downloadApk = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apkFile = await ApkFile.findById(req.params.id);

    if (!apkFile) {
      res.status(404).json({
        success: false,
        message: "APK file not found",
      });
      return;
    }

    const filePath = path.join(process.cwd(), "apk", apkFile.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "APK file not found on server",
      });
      return;
    }

    // Increment download count
    apkFile.downloadCount += 1;
    await apkFile.save();

    console.log(
      `📥 APK downloaded: ${apkFile.filename} (${apkFile.downloadCount} downloads)`
    );

    // Set headers for download
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${apkFile.originalName}"`
    );
    res.setHeader("Content-Length", apkFile.size.toString());

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error("Download APK error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download APK file",
      error: error.message,
    });
  }
};

// @desc    Delete APK file
// @route   DELETE /api/apk/:id
// @access  Private (Admin only)
export const deleteApk = async (
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

    const apkFile = await ApkFile.findById(req.params.id);

    if (!apkFile) {
      res.status(404).json({
        success: false,
        message: "APK file not found",
      });
      return;
    }

    const filePath = path.join(process.cwd(), "apk", apkFile.filename);

    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted APK file: ${apkFile.filename}`);
    }

    // Delete database record
    await ApkFile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "APK file deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete APK error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete APK file",
      error: error.message,
    });
  }
};

// @desc    Toggle APK active status
// @route   PATCH /api/apk/:id/toggle
// @access  Private (Admin only)
export const toggleApkStatus = async (
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

    const apkFile = await ApkFile.findById(req.params.id);

    if (!apkFile) {
      res.status(404).json({
        success: false,
        message: "APK file not found",
      });
      return;
    }

    apkFile.isActive = !apkFile.isActive;
    await apkFile.save();

    res.status(200).json({
      success: true,
      message: `APK file ${
        apkFile.isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        id: apkFile._id,
        isActive: apkFile.isActive,
      },
    });
  } catch (error: any) {
    console.error("Toggle APK status error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update APK details
// @route   PUT /api/apk/:id
// @access  Private (Admin only)
export const updateApkDetails = async (
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

    const { version, description, isActive } = req.body;

    const apkFile = await ApkFile.findById(req.params.id);

    if (!apkFile) {
      res.status(404).json({
        success: false,
        message: "APK file not found",
      });
      return;
    }

    // Update fields
    if (version !== undefined) apkFile.version = version;
    if (description !== undefined) apkFile.description = description;
    if (isActive !== undefined) apkFile.isActive = isActive;

    await apkFile.save();

    res.status(200).json({
      success: true,
      message: "APK details updated successfully",
      data: apkFile,
    });
  } catch (error: any) {
    console.error("Update APK details error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update APK details",
      error: error.message,
    });
  }
};
