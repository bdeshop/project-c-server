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

/**
 * @swagger
 * /api/sliders:
 *   post:
 *     summary: Create a new slider with image
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Slider created
 */
router.post("/", protect, upload.single("image"), createSlider);

/**
 * @swagger
 * /api/sliders:
 *   get:
 *     summary: Get all sliders
 *     tags: [Sliders]
 *     responses:
 *       200:
 *         description: List of sliders
 */
router.get("/", getSliders);

/**
 * @swagger
 * /api/sliders/{id}:
 *   get:
 *     summary: Get slider by ID
 *     tags: [Sliders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Slider details
 *       404:
 *         description: Slider not found
 */
router.get("/:id", getSlider);

/**
 * @swagger
 * /api/sliders/{id}:
 *   put:
 *     summary: Update slider
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Slider updated
 */
router.put("/:id", protect, upload.single("image"), updateSlider);

/**
 * @swagger
 * /api/sliders/{id}:
 *   delete:
 *     summary: Delete slider
 *     tags: [Sliders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Slider deleted
 */
router.delete("/:id", protect, deleteSlider);

export default router;
