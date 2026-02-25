import { Request, Response } from "express";
import Provider from "../models/Provider";
import Game from "../models/Game";

// Get all providers (Public)
export const getProviders = async (req: Request, res: Response) => {
  try {
    const providers = await Provider.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all providers (Admin)
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get single provider (Public)
export const getProvider = async (req: Request, res: Response) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    // Get games for this provider
    const games = await Game.find({ provider: req.params.id })
      .populate("category", "nameEnglish nameBangla icon")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      provider,
      games,
      gameCount: games.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create provider (Admin only)
export const createProvider = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { name, isActive } = req.body;

    if (!name) {
      res.status(400).json({ message: "Provider name is required" });
      return;
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ name });
    if (existingProvider) {
      res.status(400).json({ message: "Provider already exists" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Provider logo is required" });
      return;
    }

    const logo = `/uploads/${req.file.filename}`;

    const provider = await Provider.create({
      name,
      logo,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Provider created successfully",
      provider,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update provider (Admin only)
export const updateProvider = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const { name, isActive } = req.body;

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    // Check if new name already exists
    if (name && name !== provider.name) {
      const existingProvider = await Provider.findOne({ name });
      if (existingProvider) {
        res.status(400).json({ message: "Provider name already exists" });
        return;
      }
      provider.name = name;
    }

    if (req.file) {
      provider.logo = `/uploads/${req.file.filename}`;
    }

    if (isActive !== undefined) {
      provider.isActive = isActive;
    }

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      provider,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete provider (Admin only)
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    // Check if provider has games
    const gamesCount = await Game.countDocuments({ provider: req.params.id });
    if (gamesCount > 0) {
      res.status(400).json({
        message: `Cannot delete provider with ${gamesCount} games. Delete games first.`,
      });
      return;
    }

    await Provider.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
