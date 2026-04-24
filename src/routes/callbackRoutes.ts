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

    // Use the exact username matching the DB (same as Jaya)
    const searchUsername = username;
    console.log("🔍 Looking for user with:", searchUsername);

    // First try: Find by user ID (if it's a valid MongoDB ObjectId)
    let player = null;

    if (searchUsername.length === 24) {
      try {
        player = await User.findById(searchUsername);
        if (player) {
          console.log("✅ Found user by ID:", player.username);
        }
      } catch (error) {
        console.log("Not a valid ObjectId, trying by username...");
      }
    }

    // Second try: Find by username if not found by ID
    if (!player) {
      player = await User.findOne({ 
        $or: [
          { username: searchUsername },
          { name: searchUsername }
        ]
      });
      if (player) {
        console.log("✅ Found user by username:", player.username);
      }
    }

    console.log("🔎 Database query result:", {
      searched: searchUsername,
      found: !!player,
      playerData: player
        ? {
            _id: player._id,
            username: player.username,
            balance: player.balance,
          }
        : null,
    });

    if (!player) {
      console.log("❌ User not found with:", searchUsername);
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    console.log("Matched player ID ->", player._id);

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Determine net change
    let isPlayerLoss = false;
    let playerNetChange = 0;

    if (bet_type === "BET") {
      playerNetChange = -amountFloat;
      isPlayerLoss = true;
    } else if (bet_type === "SETTLE") {
      playerNetChange = amountFloat;
      if (amountFloat <= 0) isPlayerLoss = true;
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

    const dbUpdateStart = Date.now();
    // Update player balance and game history
    const updatedPlayer = await User.findOneAndUpdate(
      { _id: player._id },
      {
        $set: { balance: newBalance },
        $push: { gameHistory: gameRecord } as any,
      },
      { new: true }
    );
    console.log(`⏱️ DB Update took: ${Date.now() - dbUpdateStart}ms`);

    if (!updatedPlayer) {
      return res.status(500).json({
        success: false,
        message: "Failed to update player data.",
      });
    }

    console.log(`✅ Balance updated for ${player.username}: ${player.balance} -> ${newBalance}`);

    const responseTime = Date.now() - startTime;
    console.log(`✅ Response sent in: ${responseTime}ms`);

    res.json({
      success: true,
      message: "Callback processed successfully.",
      data: {
        username,
        new_balance: updatedPlayer.balance,
        gameRecord,
      },
    });

  } catch (error: any) {
    console.error("Callback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
  const startTime = Date.now();
  try {
    let {
      account_id,
      username,
      amount,
      provider_code,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
    } = req.body;

    console.log("Refund received ->", { username, amount, transaction_id });

    if (!username || !provider_code || amount === undefined || amount === null || !game_code) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    // Use the exact username matching the DB (same as Jaya)
    const searchUsername = username;

    // First try: Find by user ID (if it's a valid MongoDB ObjectId)
    let player = null;

    if (searchUsername.length === 24) {
      try {
        player = await User.findById(searchUsername);
        if (player) {
          console.log("✅ Found user by ID:", player.username);
        }
      } catch (error) {
        console.log("Not a valid ObjectId, trying by username...");
      }
    }

    // Second try: Find by username if not found by ID
    if (!player) {
      player = await User.findOne({ 
        $or: [
          { username: searchUsername },
          { name: searchUsername }
        ]
      });
    }

    if (!player) {
      console.log("User not found with:", searchUsername);
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    console.log("Found user for refund:", player.username);
    console.log("Matched player ID for refund ->", player._id);

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Always add amount to balance (refund)
    const newBalance = (player.balance || 0) + Math.abs(amountFloat);

    const gameRecord = {
      username,
      provider_code,
      game_code,
      bet_type: bet_type || "REFUND",
      amount: Math.abs(amountFloat),
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status: "refunded",
      createdAt: new Date(),
    };

    const dbUpdateStart = Date.now();
    const updatedPlayer = await User.findOneAndUpdate(
      { _id: player._id },
      {
        $set: { balance: newBalance },
        $push: { gameHistory: gameRecord } as any,
      },
      { new: true }
    );
    console.log(`⏱️ DB Update took: ${Date.now() - dbUpdateStart}ms`);

    if (!updatedPlayer) {
      return res.status(500).json({
        success: false,
        message: "Failed to update player data.",
      });
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ Refund Response sent in: ${responseTime}ms`);
    console.log(`💰 Refund Processed: +৳${Math.abs(amountFloat)} → ${player.username}`);
    console.log(`💰 New Balance: ৳${updatedPlayer.balance}`);

    res.json({
      success: true,
      message: "Refund processed successfully.",
      data: {
        username,
        new_balance: updatedPlayer.balance,
        gameRecord,
      },
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
