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
 *               - money
 *               - provider_code
 *               - game_code
 *               - game_type
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 gameUrl:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Parse money as float to preserve decimal values
    let money = 50; // default fallback
    if (req.body.money !== undefined && req.body.money !== null) {
      const parsedMoney = parseFloat(req.body.money);
      if (!isNaN(parsedMoney)) {
        money = parsedMoney;
      }
    }

    // Do not allow playing if amount is 0 or less
    if (money <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please deposit amount first to play games.",
      });
    }

    const payload = {
      token: process.env.GAME_TOKEN,
      username: req.body.username,
      money: money,
      provider_code: req.body.provider_code,
      game_code: isNaN(Number(req.body.game_code))
        ? req.body.game_code
        : Number(req.body.game_code),
      game_type: req.body.game_type || 0,
    };

    console.log("PlayGame Request Body:", req.body);
    console.log("Parsed Money:", money);
    console.log("Payload being sent:", payload);

    // Validate required fields
    if (!payload.username || !payload.provider_code || !payload.token) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: username, provider_code, or GAME_TOKEN in .env",
      });
    }

    const gameLaunchUrl =
      process.env.GAME_LAUNCH_URL || "https://crazybet99.com/getgameurl/v2";
    console.log("Calling Game Launch API:", gameLaunchUrl);

    // Launch game via configured Game Launch URL
    const response = await axios.post(gameLaunchUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-dstgame-key": process.env.DST_GAME_KEY || "",
      },
    });

    console.log("Game Launch API Success Response:", response.data);

    // Extract game URL from response
    // Handle both object responses and direct string responses
    let gameUrl = "";

    if (typeof response.data === "string") {
      gameUrl = response.data;
    } else if (typeof response.data === "object" && response.data !== null) {
      gameUrl =
        response.data?.url ||
        response.data?.gameUrl ||
        response.data?.game_url ||
        response.data?.data ||
        response.data?.link ||
        (typeof response.data?.error === "string" && response.data.error.startsWith("http") ? response.data.error : undefined);

      // Deep string check if the URL is hiding in another key
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

    res.json({
      success: true,
      gameUrl: gameUrl,
    });
  } catch (error: any) {
    // Axios throws for non-2xx HTTP responses — the API was called but returned an error status
    if (error.response) {
      // The external API responded with a non-2xx status code
      console.error("PlayGame API Error - Status:", error.response.status);
      console.error(
        "PlayGame API Error - Response Body:",
        JSON.stringify(error.response.data, null, 2),
      );
      console.error(
        "PlayGame API Error - Response Headers:",
        error.response.headers,
      );
    } else if (error.request) {
      // The request was made but no response was received (network error, timeout, etc.)
      console.error(
        "PlayGame API Error - No response received (network/timeout issue)",
      );
      console.error("PlayGame API Error - Request details:", error.request);
    } else {
      // Something went wrong setting up the request
      console.error("PlayGame API Error - Setup error:", error.message);
    }
    res.status(500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
