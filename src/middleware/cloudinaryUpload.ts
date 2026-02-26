import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "khela88/games",
      resource_type: "auto",
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

// File filter for images only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept images only
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    // Reject file
    cb(new Error("Only image files are allowed!"));
  }
};

// Create multer instance with Cloudinary storage
const cloudinaryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Multer error handling middleware
export const handleCloudinaryError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size too large. Maximum file size is 5MB.",
      });
      return;
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        success: false,
        message: "Too many files uploaded.",
      });
      return;
    }
  } else if (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  next();
};

export default cloudinaryUpload;
