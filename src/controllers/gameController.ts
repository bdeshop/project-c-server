import { Request, Response } from "express";
import Game from "../models/Game";
import GameCategory from "../models/GameCategory";
import Provider from "../models/Provider";

// Get all games (Public)
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, provider, type, page = 1, limit = 10 } = req.query;
    const filter: any = {};
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit as string) || 10),
    );
    const skip = (pageNum - 1) * limitNum;

    console.log("=== GET GAMES START ===");
    console.log("Query params:", {
      category,
      provider,
      type,
      page: pageNum,
      limit: limitNum,
    });

    if (category) {
      filter.category = category;
    }

    if (provider) {
      filter.provider = provider;
    }

    if (type === "hot") {
      filter.isHot = true;
    } else if (type === "new") {
      filter.isNewGame = true;
    } else if (type === "lobby") {
      filter.isLobby = true;
    }

    console.log("Filter:", JSON.stringify(filter));

    const totalCount = await Game.countDocuments(filter);
    const games = await Game.find(filter)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo providerCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum);

    console.log(`Found ${games.length} games out of ${totalCount} total`);
    console.log("=== GET GAMES END ===\n");

    res.status(200).json({
      success: true,
      count: games.length,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
      games,
    });
  } catch (error) {
    console.error("GET GAMES ERROR:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Update game names from Oracle API (Admin only)
export const updateGameNamesFromOracle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const axios = (await import("axios")).default;

    // Find all games with generated names (nameEnglish starts with "Game ")
    const gamesToUpdate = await Game.find({
      nameEnglish: /^Game [0-9a-f]{1,48}$/,
    });

    console.log(`Found ${gamesToUpdate.length} games to update`);

    let updated = 0;
    let failed = 0;

    for (const game of gamesToUpdate) {
      try {
        if (!game.gameId) {
          console.log(`Skipping game ${game._id} - no gameId`);
          failed++;
          continue;
        }

        // Fetch game details from Oracle API
        const response = await axios.get(
          `https://api.oraclegames.live/api/games/${game.gameId}`,
          {
            headers: {
              "x-dstgame-key":
                "b4fb7adb955b1078d8d38b54f5ad7be8ded17cfba85c37e4faa729ddd679d379",
              "x-api-key": "a8b5ca55-56a5-418d-829d-6d00afd5945f",
            },
          },
        );

        const gameDetails = response.data?.data;
        if (gameDetails?.gameName) {
          game.nameEnglish = gameDetails.gameName;
          game.nameBangla = gameDetails.gameName;
          await game.save();
          updated++;
          console.log(
            `Updated game ${game._id} with name: ${gameDetails.gameName}`,
          );
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to update game ${game._id}:`, error);
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${updated} games, ${failed} failed`,
      updated,
      failed,
    });
  } catch (error) {
    console.error("Update games error:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get single game (Public)
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo providerCode");

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create game (Admin only)
export const createGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      gameUuid,
      gameId,
      nameEnglish,
      nameBangla,
      category,
      isHot,
      isNew,
      isLobby,
    } = req.body;

    if (!gameId && !gameUuid) {
      res.status(400).json({ message: "Game ID or UUID is required" });
      return;
    }

    if (!nameEnglish || !nameBangla) {
      res
        .status(400)
        .json({ message: "Game name in English and Bangla are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Game image is required" });
      return;
    }

    if (!category) {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    // Get image URL (Cloudinary or local)
    const image = (req.file as any).path || `/uploads/${(req.file as any).filename}`;

    const game = await Game.create({
      gameUuid: gameUuid || gameId,
      gameId: gameId || gameUuid,
      nameEnglish,
      nameBangla,
      image,
      category,
      isHot: isHot === "true" || isHot === true || false,
      isNewGame: isNew === "true" || isNew === true || false,
      isLobby: isLobby === "true" || isLobby === true || false,
    });

    const populatedGame = await Game.findById(game._id)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo");

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      game: populatedGame,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Update game (Admin only)
export const updateGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      gameUuid,
      gameId,
      nameEnglish,
      nameBangla,
      category,
      isHot,
      isNew,
      isLobby,
    } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    // Update fields if provided
    if (gameUuid) game.gameUuid = gameUuid;
    if (gameId) game.gameId = gameId;
    if (nameEnglish) game.nameEnglish = nameEnglish;
    if (nameBangla) game.nameBangla = nameBangla;

    // Update image if new file is uploaded
    if (req.file) {
      game.image = (req.file as any).path || `/uploads/${(req.file as any).filename}`;
    }

    // Verify category exists if provided
    if (category) {
      const categoryExists = await GameCategory.findById(category);
      if (!categoryExists) {
        res.status(404).json({ message: "Game category not found" });
        return;
      }
      game.category = category;
    }

    // Update flags
    if (isHot !== undefined) game.isHot = isHot === "true" || isHot === true;
    if (isNew !== undefined)
      game.isNewGame = isNew === "true" || isNew === true;
    if (isLobby !== undefined)
      game.isLobby = isLobby === "true" || isLobby === true;

    await game.save();

    const updatedGame = await Game.findById(game._id)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo");

    res.status(200).json({
      success: true,
      message: "Game updated successfully",
      game: updatedGame,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Delete game (Admin only)
export const deleteGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    await Game.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Bulk create games with providers (Admin only)
export const bulkCreateGames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let categoryId: string;
    let providers: any[];

    if (req.body.data) {
      const parsedData = JSON.parse(req.body.data);
      categoryId = parsedData.categoryId;
      providers = parsedData.providers;
    } else {
      categoryId = req.body.categoryId;
      providers = req.body.providers;
    }

    if (!categoryId) {
      res.status(400).json({ message: "Category ID is required" });
      return;
    }

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      res.status(400).json({
        message: "Providers array is required and must not be empty",
      });
      return;
    }

    const category = await GameCategory.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    const createdProviders = [];
    const errors = [];

    for (const providerData of providers) {
      try {
        const { name, providerCode, logo, games } = providerData;

        if (!name || !games || !Array.isArray(games)) {
          errors.push({
            provider: name || "Unknown",
            error: "Provider name and games array are required",
          });
          continue;
        }

        let provider = await Provider.findOne({ name });
        const logoPath = (req.file as any)?.path || logo;

        if (!provider) {
          provider = await Provider.create({
            name,
            providerCode: providerCode || "",
            logo: logoPath || "/uploads/default-logo.png",
            isActive: true,
          });
        } else {
          if (logoPath) {
            provider.logo = logoPath;
          }
          if (providerCode && !provider.providerCode) {
            provider.providerCode = providerCode;
          }
          await provider.save();
        }

        const createdGames = [];

        for (const gameData of games) {
          try {
            let {
              gameUuid,
              gameId,
              gameCode,
              gameName,
              name: gameName_alt,
              nameEnglish,
              nameBangla,
              image,
              gameType,
              jackpot,
              freeTry,
              rtp,
              isHot,
              isNew,
              isLobby,
            } = gameData;

            if (!gameName && gameName_alt) gameName = gameName_alt;

            const targetId = gameId || gameUuid;

            if (!targetId) {
              errors.push({
                provider: name,
                error: "Game ID/UUID is required",
              });
              continue;
            }

            if (!nameEnglish) nameEnglish = gameName || `Game ${targetId}`;
            if (!nameBangla) nameBangla = gameName || `গেম ${targetId}`;
            if (!image) image = "/uploads/default-game.png";

            const existingGame = await Game.findOne({
              provider: provider._id,
              gameId: targetId,
            });

            if (existingGame) {
              errors.push({
                provider: name,
                gameId: targetId,
                error: "Game already exists",
              });
              continue;
            }

            const game = await Game.create({
              gameUuid: gameUuid || targetId,
              gameId: targetId,
              gameCode,
              gameName,
              nameEnglish,
              nameBangla,
              image,
              gameType,
              jackpot,
              freeTry,
              rtp,
              category: categoryId,
              provider: provider._id,
              providerCode: provider.providerCode || "",
              providerName: provider.name,
              isHot: isHot || false,
              isNewGame: isNew || false,
              isLobby: isLobby || false,
            });

            createdGames.push(game);
          } catch (gameError) {
            errors.push({
              provider: name,
              error: (gameError as Error).message,
            });
          }
        }

        if (createdGames.length > 0) {
          createdProviders.push({
            ...provider.toObject(),
            games: createdGames,
          });

          if (!category.providers.includes(provider._id as any)) {
            category.providers.push(provider._id as any);
          }
        }
      } catch (providerError) {
        errors.push({
          provider: providerData.name,
          error: (providerError as Error).message,
        });
      }
    }

    await category.save();

    res.status(201).json({
      success: true,
      message: "Bulk game creation completed",
      category,
      providers: createdProviders,
      totalProviders: createdProviders.length,
      totalGames: createdProviders.reduce((sum, p) => sum + p.games.length, 0),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
