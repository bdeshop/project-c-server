import { Request, Response } from "express";
import PopularGame from "../models/PopularGame";

// Frontend - Get all active popular games
export const getPopularGames = async (req: Request, res: Response) => {
  try {
    const games = await PopularGame.find({ isActive: true }).sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Get all popular games
export const getAllPopularGames = async (req: Request, res: Response) => {
  try {
    const games = await PopularGame.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Get single popular game
export const getPopularGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const game = await PopularGame.findById(id);

    if (!game) {
      res.status(404).json({ message: "Popular game not found" });
      return;
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Create popular game
export const createPopularGame = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { title, redirectUrl, isActive, order } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const game = await PopularGame.create({
      image: imageUrl,
      title,
      redirectUrl,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      game,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Update popular game
export const updatePopularGame = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { title, redirectUrl, isActive, order } = req.body;

    const game = await PopularGame.findById(id);

    if (!game) {
      res.status(404).json({ message: "Popular game not found" });
      return;
    }

    if (req.file) {
      game.image = `/uploads/${req.file.filename}`;
    }
    if (title) game.title = title;
    if (redirectUrl) game.redirectUrl = redirectUrl;
    if (isActive !== undefined) game.isActive = isActive;
    if (order !== undefined) game.order = order;

    await game.save();

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin - Delete popular game
export const deletePopularGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const game = await PopularGame.findByIdAndDelete(id);

    if (!game) {
      res.status(404).json({ message: "Popular game not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Popular game deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
