import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

// Create apk directory if it doesn't exist
const apkDir = "apk";
if (!fs.existsSync(apkDir)) {
  fs.mkdirSync(apkDir, { recursive: true });
}

// Configure storage for APK files
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "apk/");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Keep original filename or use a custom name
    const filename = req.body.customName
      ? `${req.body.customName}.apk`
      : file.originalname;
    cb(null, filename);
  },
});

// File filter for APK files only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept APK files only
  if (
    file.mimetype === "application/vnd.android.package-archive" ||
    path.extname(file.originalname).toLowerCase() === ".apk"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only APK files are allowed!"));
  }
};

// Create multer instance for APK uploads
const apkUpload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for APK files
  },
  fileFilter: fileFilter,
});

export default apkUpload;
