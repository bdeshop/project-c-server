import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("🔍 Cloudinary Environment Variables:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
});

// Validate required environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Missing required Cloudinary environment variables!");
  console.error(
    "Required variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  );
  process.exit(1);
}

// Configure Cloudinary with environment variables
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log("☁️ Using Cloudinary Config:", {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key ? "✅ Set" : "❌ Missing",
  api_secret: cloudinaryConfig.api_secret ? "✅ Set" : "❌ Missing",
});

cloudinary.config(cloudinaryConfig);

// Configure Cloudinary storage for payment method images
const paymentMethodStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "payment-methods", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "limit" }, // Resize images
      { quality: "auto" }, // Auto optimize quality
      { fetch_format: "auto" }, // Auto format selection
    ],
  } as any,
});

// Configure Cloudinary storage for promotion images
const promotionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "promotions", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Larger size for promotions
      { quality: "auto" }, // Auto optimize quality
      { fetch_format: "auto" }, // Auto format selection
    ],
  } as any,
});

// Configure Cloudinary storage for user profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-profiles", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "limit" }, // Resize images for profiles
      { quality: "auto" }, // Auto optimize quality
      { fetch_format: "auto" }, // Auto format selection
    ],
  } as any,
});

// Create multer upload middleware for payment methods
export const uploadPaymentMethodImages = multer({
  storage: paymentMethodStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Create multer upload middleware for promotion images
export const uploadPromotionImages = multer({
  storage: promotionStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for promotions
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Create multer upload middleware for user profile images
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Helper function to delete image from Cloudinary
export const deleteCloudinaryImage = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    // Extract public ID from Cloudinary URL
    // Examples:
    // https://res.cloudinary.com/dm7xbqgdu/image/upload/v1234567890/payment-methods/abc123.jpg
    // https://res.cloudinary.com/dm7xbqgdu/image/upload/v1234567890/promotions/xyz789.jpg
    // https://res.cloudinary.com/dm7xbqgdu/image/upload/v1234567890/user-profiles/def456.jpg
    const paymentMethodMatch = url.match(/\/payment-methods\/([^\.]+)/);
    const promotionMatch = url.match(/\/promotions\/([^\.]+)/);
    const profileMatch = url.match(/\/user-profiles\/([^\.]+)/);

    if (paymentMethodMatch) {
      return `payment-methods/${paymentMethodMatch[1]}`;
    } else if (promotionMatch) {
      return `promotions/${promotionMatch[1]}`;
    } else if (profileMatch) {
      return `user-profiles/${profileMatch[1]}`;
    }

    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export default cloudinary;