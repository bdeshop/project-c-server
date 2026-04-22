import express, { Request, Response } from "express";
import User from "../models/User";
import GameSession from "../models/GameSession";
import axios from "axios";

const router = express.Router();

/**
 * @swagger
 * /api/jaya9-callback:
 *   post:
 *     summary: Jaya9 game callback endpoint
 *     tags: [Jaya9]
 */
router.post("/jaya9-callback", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    let {
      account_id,
      username,
      provider_code,
      amount,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
    } = req.body;

    console.log("Callback received ->", {
      username,
      provider_code,
      amount,
      game_code,
      bet_type,
      transaction_id,
    });

    if (!username || !provider_code || amount === undefined || amount === null || !bet_type) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing.",
      });
    }

    // Find the user by username (matching jaya logic)
    let player = await User.findOne({ 
      $or: [
        { username: username },
        { name: username }
      ]
    });

    if (!player) {
      console.log("❌ User not found with:", username);
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Determine net change
    let playerNetChange = 0;
    if (bet_type === "BET") {
      playerNetChange = -amountFloat;
    } else if (bet_type === "SETTLE") {
      playerNetChange = amountFloat;
    }

    const gameRecord = {
      username,
      provider_code,
      game_code,
      bet_type,
      amount: amountFloat,
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status: bet_type === "SETTLE" && amountFloat > 0 ? "won" : "lost",
      createdAt: new Date(),
    };

    const newBalance = (player.balance || 0) + playerNetChange;

    // Update player balance and game history
    await User.findOneAndUpdate(
      { _id: player._id },
      {
        $set: { balance: newBalance },
        $push: { gameHistory: gameRecord } as any,
      }
    );

    console.log(`✅ Balance updated for ${player.username}: ${player.balance} -> ${newBalance}`);

    res.json({
      success: true,
      message: "Callback processed successfully.",
      data: {
        username,
        new_balance: newBalance,
      },
    });

  } catch (error: any) {
    console.error("Callback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/jaya9-refund:
 *   post:
 *     summary: Jaya9 game refund endpoint
 *     tags: [Jaya9]
 */
router.post("/jaya9-refund", async (req: Request, res: Response) => {
  try {
    let {
      username,
      amount,
      provider_code,
      game_code,
      bet_type,
      transaction_id,
    } = req.body;

    console.log("Refund received ->", { username, amount, transaction_id });

    if (!username || amount === undefined) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    let player = await User.findOne({ 
      $or: [
        { username: username },
        { name: username }
      ]
    });

    if (!player) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const amountFloat = Math.abs(parseFloat(amount));
    const newBalance = (player.balance || 0) + amountFloat;

    await User.findOneAndUpdate(
      { _id: player._id },
      {
        $set: { balance: newBalance },
        $push: { gameHistory: {
          username,
          provider_code,
          game_code,
          bet_type: bet_type || "REFUND",
          amount: amountFloat,
          transaction_id,
          status: "refunded",
          createdAt: new Date(),
        } } as any,
      }
    );

    res.json({
      success: true,
      message: "Refund processed successfully.",
      data: { username, new_balance: newBalance },
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
