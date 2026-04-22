import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();

/**
 * @swagger
 * /api/playgame:
 *   post:
 *     summary: Launch a game
 *     tags: [PlayGame]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Player username
 *               money:
 *                 type: number
 *                 description: Player balance
 *               provider_code:
 *                 type: string
 *               game_code:
 *                 type: any
 *               game_type:
 *                 type: any
 *     responses:
 *       200:
 *         description: Game URL generated successfully
 */
router.post("/", async (req: Request, res: Response) => {
  console.log("\n🎮 [PLAYGAME] NEW REQUEST RECEIVED");
  console.log("------------------------------------");
  try {
    const { username, money, provider_code, game_code, game_type } = req.body;
    console.log("📥 Raw Request Body:", JSON.stringify(req.body, null, 2));

    let balance = 50;
    if (money !== undefined && money !== null) {
      const parsedMoney = parseFloat(money);
      if (!isNaN(parsedMoney)) {
        balance = parsedMoney;
      }
    }
    console.log(`💰 Processed Balance: ${balance}`);

    if (balance <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please deposit amount first to play games.",
      });
    }

    const payload = {
      token: process.env.GAME_TOKEN,
      username: username,
      money: balance,
      provider_code: provider_code,
      game_code: isNaN(Number(game_code)) ? game_code : Number(game_code),
      game_type: game_type || 0,
    };

    console.log("PlayGame Request Data:", {
      username: username || "MISSING",
      money: balance,
      provider_code: provider_code || "MISSING",
      game_code: game_code,
      token: process.env.GAME_TOKEN ? "PRESENT" : "MISSING",
    });

    if (!username || !provider_code || !process.env.GAME_TOKEN) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, provider_code, or GAME_TOKEN",
        details: {
          username: !!username,
          provider_code: !!provider_code,
          token: !!process.env.GAME_TOKEN,
        }
      });
    }

    const gameLaunchUrl =
      process.env.GAME_LAUNCH_URL || "https://crazybet99.com/getgameurl/v2";

    const response = await axios.post(gameLaunchUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-dstgame-key": process.env.DST_GAME_KEY || "cb3f85908855357aeec0257ce474d59e",
      },
    });

    console.log("Game Launch API Response Status:", response.status);

    let gameUrl = "";
    if (typeof response.data === "string") {
      gameUrl = response.data;
    } else if (typeof response.data === "object" && response.data !== null) {
      gameUrl =
        response.data?.url ||
        response.data?.gameUrl ||
        response.data?.game_url ||
        response.data?.data ||
        response.data?.link;

      if (!gameUrl) {
        for (const key in response.data) {
          if (typeof response.data[key] === "string" && response.data[key].startsWith("http")) {
            gameUrl = response.data[key] as string;
            break;
          }
        }
      }
    }

    if (!gameUrl && String(response.data).startsWith("http")) {
      gameUrl = String(response.data);
    }

    if (!gameUrl) {
      return res.status(400).json({
        success: false,
        message: "No game URL returned from game provider",
        error: response.data,
      });
    }

    console.log("✅ [PLAYGAME] SUCCESS: Game URL generated");
    res.json({
      success: true,
      gameUrl: gameUrl,
    });
  } catch (error: any) {
    console.error("❌ [PLAYGAME] ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
