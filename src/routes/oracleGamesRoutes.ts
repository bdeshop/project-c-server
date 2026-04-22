import express, { Router } from "express";
import axios from "axios";
import { protect, authorize } from "../middleware/auth";

const router: Router = express.Router();

const ORACLE_API_BASE = "https://api.oraclegames.live/api";
const ORACLE_DST_KEY =
  process.env.ORACLE_DST_KEY || "b4fb7adb955b1078d8d38b54f5ad7be8ded17cfba85c37e4faa729ddd679d379";
const ORACLE_API_KEY =
  process.env.ORACLE_API_KEY || "a8b5ca55-56a5-418d-829d-6d00afd5945f";

const oracleHeaders = {
  "x-dstgame-key": ORACLE_DST_KEY,
  "x-api-key": ORACLE_API_KEY,
  "Content-Type": "application/json",
};

/**
 * @swagger
 * /api/oracle-games/providers:
 *   get:
 *     summary: Get all providers from Oracle API (Admin only)
 *     tags: [Oracle Games]
 */
router.get("/providers", protect, authorize("admin"), async (req, res) => {
  try {
    const response = await axios.get(`${ORACLE_API_BASE}/providers`, {
      headers: oracleHeaders,
    });

    res.status(200).json({
      success: true,
      count: response.data.count,
      providers: response.data.data,
    });
  } catch (error) {
    console.error("Error fetching Oracle providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch providers from Oracle Games API",
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /api/oracle-games/providers/{providerCode}:
 *   get:
 *     summary: Get provider details and games from Oracle API (Admin only)
 *     tags: [Oracle Games]
 */
router.get("/providers/:providerCode", protect, authorize("admin"), async (req, res) => {
  try {
    const { providerCode } = req.params;

    if (!providerCode) {
      res.status(400).json({ message: "Provider code is required" });
      return;
    }

    const response = await axios.get(
      `${ORACLE_API_BASE}/providers/${providerCode}`,
      {
        headers: oracleHeaders,
      },
    );

    res.status(200).json({
      success: true,
      provider: response.data.provider,
      gameCount: response.data.gameCount,
      games: response.data.games,
    });
  } catch (error) {
    console.error("Error fetching Oracle provider games:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider games from Oracle Games API",
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /api/oracle-games/games/{gameId}:
 *   get:
 *     summary: Get game details from Oracle API (Admin only)
 *     tags: [Oracle Games]
 */
router.get("/games/:gameId", protect, authorize("admin"), async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!gameId) {
      res.status(400).json({ message: "Game ID is required" });
      return;
    }

    const response = await axios.get(`${ORACLE_API_BASE}/games/${gameId}`, {
      headers: oracleHeaders,
    });

    res.status(200).json({
      success: true,
      game: response.data.data,
    });
  } catch (error) {
    console.error("Error fetching Oracle game details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game details from Oracle Games API",
      error: (error as Error).message,
    });
  }
});

export default router;
