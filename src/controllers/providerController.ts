import { Request, Response } from "express";
import Provider from "../models/Provider";
import Game from "../models/Game";
import axios from "axios";

const ORACLE_API_URL = "https://api.oraclegames.live/api";
const ORACLE_DST_KEY =
  process.env.ORACLE_DST_KEY || "b4fb7adb955b1078d8d38b54f5ad7be8ded17cfba85c37e4faa729ddd679d379";
const ORACLE_API_KEY =
  process.env.ORACLE_API_KEY || "a8b5ca55-56a5-418d-829d-6d00afd5945f";

const oracleHeaders = {
  "x-dstgame-key": ORACLE_DST_KEY,
  "x-api-key": ORACLE_API_KEY,
  "Content-Type": "application/json",
};

// Get all providers from external Oracle API (Public)
export const getProviders = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ORACLE_API_URL}/providers`, {
      headers: oracleHeaders,
    });

    res.status(200).json({
      success: true,
      count: response.data.count,
      providers: response.data.data,
    });
  } catch (error: any) {
    console.error("Error fetching providers from Oracle API:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all providers (Admin) - from local database
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 });

    // Map providers and ensure logos are valid Cloudinary URLs
    const mappedProviders = providers.map((provider) => {
      let logo = provider.logo;
      // If logo is a local path or invalid, use a default Cloudinary placeholder
      if (!logo || logo.includes("/uploads/") || !logo.includes("cloudinary")) {
        logo =
          "https://res.cloudinary.com/dm7xbqgdu/image/upload/v1772085583/khela88/games/default-provider-logo.png";
      }
      return {
        ...provider.toObject(),
        logo,
      };
    });

    res.status(200).json({
      success: true,
      count: mappedProviders.length,
      providers: mappedProviders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all providers with game counts (Admin only)
export const getProvidersWithCounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const providers = await Provider.find().sort({ name: 1 });

    const enrichedProviders = await Promise.all(
      providers.map(async (provider) => {
        const games = await Game.find({ provider: provider._id })
          .populate("category", "nameEnglish nameBangla icon")
          .sort({ createdAt: -1 });

        let logo = provider.logo;
        if (
          !logo ||
          logo.includes("/uploads/") ||
          !logo.includes("cloudinary")
        ) {
          logo =
            "https://res.cloudinary.com/dm7xbqgdu/image/upload/v1772085583/khela88/games/default-provider-logo.png";
        }

        return {
          ...provider.toObject(),
          logo,
          gameCount: games.length,
          games: games,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: enrichedProviders.length,
      providers: enrichedProviders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get single provider from external Oracle API (Public)
export const getProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch provider details from Oracle API
    const response = await axios.get(`${ORACLE_API_URL}/providers/${id}`, {
      headers: oracleHeaders,
    });

    res.status(200).json({
      success: true,
      provider: response.data.provider,
      games: response.data.games,
      gameCount: response.data.gameCount,
    });
  } catch (error: any) {
    console.error("Error fetching provider from Oracle API:", error.message);
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

    // Get Cloudinary URL from uploaded file
    const logo = (req.file as any).path;

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
      provider.logo = (req.file as any).path;
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
