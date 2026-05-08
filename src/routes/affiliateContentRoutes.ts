import express from "express";
import {
  getAffiliateContent,
  updateAffiliateContent,
  addSlide,
  updateSlide,
  deleteSlide,
} from "../controllers/affiliateContentController";
import { protect, adminOnly } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "affiliate-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

/**
 * @swagger
 * /api/affiliate-content:
 *   get:
 *     summary: Get affiliate content
 *     tags: [Affiliate Content]
 *     responses:
 *       200:
 *         description: Affiliate content retrieved successfully
 */
router.get("/", getAffiliateContent);

/**
 * @swagger
 * /api/affiliate-content:
 *   put:
 *     summary: Update affiliate content (Admin only)
 *     tags: [Affiliate Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Affiliate content updated successfully
 */
router.put("/", protect, adminOnly, updateAffiliateContent);

/**
 * @swagger
 * /api/affiliate-content/slides:
 *   post:
 *     summary: Add a new slide with image (Admin only)
 *     tags: [Affiliate Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn: { type: string }
 *               titleBn: { type: string }
 *               subtitleEn: { type: string }
 *               subtitleBn: { type: string }
 *               image: { type: string, format: binary }
 */
router.post("/slides", protect, adminOnly, upload.single("image"), addSlide);

/**
 * @swagger
 * /api/affiliate-content/slides/{index}:
 *   put:
 *     summary: Update a slide with optional image (Admin only)
 *     tags: [Affiliate Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titleEn: { type: string }
 *               titleBn: { type: string }
 *               subtitleEn: { type: string }
 *               subtitleBn: { type: string }
 *               image: { type: string, format: binary }
 */
router.put(
  "/slides/:index",
  protect,
  adminOnly,
  upload.single("image"),
  updateSlide,
);

/**
 * @swagger
 * /api/affiliate-content/slides/{index}:
 *   delete:
 *     summary: Delete a slide (Admin only)
 *     tags: [Affiliate Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema: { type: integer }
 */
router.delete("/slides/:index", protect, adminOnly, deleteSlide);

export default router;
