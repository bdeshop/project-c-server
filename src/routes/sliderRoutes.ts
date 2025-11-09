import express from "express";
import {
  createSlider,
  getSliders,
  getSlider,
  updateSlider,
  deleteSlider,
} from "../controllers/sliderController";
import { protect } from "../middleware/auth";
import multer from "multer";
import path from "path";

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "slider-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// @route   POST /api/sliders
// @desc    Create a new slider with image upload
// @access  Private (Admin recommended)
router.post("/", protect, upload.single("image"), createSlider);

// @route   GET /api/sliders
// @desc    Get all sliders
// @access  Public
router.get("/", getSliders);

// @route   GET /api/sliders/:id
// @desc    Get single slider
// @access  Public
router.get("/:id", getSlider);

// @route   PUT /api/sliders/:id
// @desc    Update slider with optional image upload
// @access  Private (Admin recommended)
router.put("/:id", protect, upload.single("image"), updateSlider);

// @route   DELETE /api/sliders/:id
// @desc    Delete slider
// @access  Private (Admin recommended)
router.delete("/:id", protect, deleteSlider);

export default router;
