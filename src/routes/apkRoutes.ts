import express from "express";
import {
  uploadApk,
  getAllApks,
  getLatestApk,
  downloadApk,
  deleteApk,
  toggleApkStatus,
  updateApkDetails,
} from "../controllers/apkController";
import { protect } from "../middleware/auth";
import apkUpload from "../middleware/apkUpload";

import express from "express";
import {
  uploadApk,
  getAllApks,
  getLatestApk,
  downloadApk,
  deleteApk,
  toggleApkStatus,
  updateApkDetails,
} from "../controllers/apkController";
import { protect } from "../middleware/auth";
import apkUpload from "../middleware/apkUpload";

const router = express.Router();

/**
 * @swagger
 * /api/apk:
 *   get:
 *     summary: Get all APKs
 *     tags: [APK]
 *     responses:
 *       200:
 *         description: List of APKs
 */
router.get("/", getAllApks);

/**
 * @swagger
 * /api/apk/latest:
 *   get:
 *     summary: Get latest APK
 *     tags: [APK]
 *     responses:
 *       200:
 *         description: Latest APK details
 */
router.get("/latest", getLatestApk);

/**
 * @swagger
 * /api/apk/download/{id}:
 *   get:
 *     summary: Download APK
 *     tags: [APK]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: APK file download
 */
router.get("/download/:id", downloadApk);

/**
 * @swagger
 * /api/apk/upload:
 *   post:
 *     summary: Upload APK (Admin only)
 *     tags: [APK]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               apk: { type: string, format: binary }
 *               version: { type: string }
 *     responses:
 *       201:
 *         description: APK uploaded
 */
router.post("/upload", protect, apkUpload.single("apk"), uploadApk);

/**
 * @swagger
 * /api/apk/{id}:
 *   delete:
 *     summary: Delete APK (Admin only)
 *     tags: [APK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: APK deleted
 */
router.delete("/:id", protect, deleteApk);

/**
 * @swagger
 * /api/apk/{id}/toggle:
 *   patch:
 *     summary: Toggle APK status (Admin only)
 *     tags: [APK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.patch("/:id/toggle", protect, toggleApkStatus);

/**
 * @swagger
 * /api/apk/{id}:
 *   put:
 *     summary: Update APK details (Admin only)
 *     tags: [APK]
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
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: APK updated
 */
router.put("/:id", protect, updateApkDetails);

export default router;
