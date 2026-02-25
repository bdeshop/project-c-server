import { Request, Response } from "express";
import Game from "../models/Game";
import GameCategory from "../models/GameCategory";
import Provider from "../models/Provider";

// Get all games (Public)
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, provider, type } = req.query;
    const filter: any = {};

    console.log("=== GET GAMES START ===");
    console.log("Query params:", { category, provider, type });

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

    const games = await Game.find(filter)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo")
      .sort({ createdAt: -1 });

    console.log(`Found ${games.length} games`);
    console.log("=== GET GAMES END ===\n");

    res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("GET GAMES ERROR:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get single game (Public)
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const game = await Game.findById(req.params.id)
      .populate("category", "nameEnglish nameBangla icon")
      .populate("provider", "name logo");

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
      nameEnglish,
      nameBangla,
      category,
      isHot,
      isNew,
      isLobby,
    } = req.body;

    if (!gameUuid) {
      res.status(400).json({ message: "Game UUID is required" });
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

    // Check if gameUuid already exists
    const existingGame = await Game.findOne({ gameUuid });
    if (existingGame) {
      res.status(400).json({ message: "Game UUID already exists" });
      return;
    }

    // Verify category exists
    const categoryExists = await GameCategory.findById(category);
    if (!categoryExists) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    const image = `/uploads/${req.file.filename}`;

    const game = await Game.create({
      gameUuid,
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

    // Check if gameUuid is being changed and if it already exists
    if (gameUuid && gameUuid !== game.gameUuid) {
      const existingGame = await Game.findOne({ gameUuid });
      if (existingGame) {
        res.status(400).json({ message: "Game UUID already exists" });
        return;
      }
      game.gameUuid = gameUuid;
    }

    // Update game names if provided
    if (nameEnglish) game.nameEnglish = nameEnglish;
    if (nameBangla) game.nameBangla = nameBangla;

    // Update image if new file is uploaded
    if (req.file) {
      game.image = `/uploads/${req.file.filename}`;
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

    // Update fields if provided
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
    const { categoryId, providers } = req.body;

    console.log("=== BULK CREATE GAMES START ===");
    console.log("Category ID:", categoryId);
    console.log("Providers data:", JSON.stringify(providers, null, 2));

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

    // Verify category exists
    const category = await GameCategory.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    console.log("Category found:", category.nameEnglish);

    const createdProviders: any[] = [];
    const errors: any[] = [];

    // Process each provider
    for (const providerData of providers) {
      try {
        const { name, logo, games } = providerData;

        console.log(`\n--- Processing provider: ${name} ---`);
        console.log(`Games count: ${games?.length || 0}`);

        if (!name || !games || !Array.isArray(games)) {
          errors.push({
            provider: name || "Unknown",
            error: "Provider name and games array are required",
          });
          continue;
        }

        // Create or find provider
        let provider = await Provider.findOne({ name });
        if (!provider) {
          provider = await Provider.create({
            name,
            logo: logo || "/uploads/default-logo.png",
            isActive: true,
          });
          console.log(`Created new provider: ${provider.name}`);
        } else {
          console.log(`Found existing provider: ${provider.name}`);
        }

        const createdGames: any[] = [];

        // Create games for this provider
        for (const gameData of games) {
          try {
            let {
              gameUuid,
              gameId,
              nameEnglish,
              nameBangla,
              image,
              isHot,
              isNew,
              isLobby,
            } = gameData;

            // If gameId is provided but not gameUuid, use gameId as gameUuid
            if (!gameUuid && gameId) {
              gameUuid = gameId;
              console.log(`  - Using gameId as gameUuid: ${gameUuid}`);
            }

            console.log(`  - Processing game: ${gameUuid}`);

            if (!gameUuid) {
              errors.push({
                provider: name,
                error: `Game UUID or gameId is required`,
              });
              console.log(`    ERROR: Game UUID/gameId missing`);
              continue;
            }

            // If names or image are missing, set defaults
            if (!nameEnglish) {
              nameEnglish = `Game ${gameUuid}`;
              console.log(`    Using default nameEnglish: ${nameEnglish}`);
            }

            if (!nameBangla) {
              nameBangla = `গেম ${gameUuid}`;
              console.log(`    Using default nameBangla: ${nameBangla}`);
            }

            if (!image) {
              image = "/uploads/default-game.png";
              console.log(`    Using default image: ${image}`);
            }

            // Check if game already exists
            const existingGame = await Game.findOne({ gameUuid });
            if (existingGame) {
              errors.push({
                provider: name,
                gameUuid,
                error: "Game UUID already exists",
              });
              console.log(`    ERROR: Game UUID already exists`);
              continue;
            }

            const game = await Game.create({
              gameUuid,
              nameEnglish,
              nameBangla,
              image,
              category: categoryId,
              provider: provider._id,
              isHot: isHot || false,
              isNewGame: isNew || false,
              isLobby: isLobby || false,
            });

            console.log(`    SUCCESS: Created game ${game.gameUuid}`);

            createdGames.push({
              _id: game._id,
              gameUuid: game.gameUuid,
              nameEnglish: game.nameEnglish,
              nameBangla: game.nameBangla,
              image: game.image,
              isHot: game.isHot,
              isNewGame: game.isNewGame,
              isLobby: game.isLobby,
            });
          } catch (gameError) {
            console.log(
              `    ERROR creating game: ${(gameError as Error).message}`,
            );
            errors.push({
              provider: name,
              gameUuid: gameData.gameUuid || gameData.gameId,
              error: (gameError as Error).message,
            });
          }
        }

        console.log(`Provider ${name} - Created ${createdGames.length} games`);

        // Only add provider if it has games
        if (createdGames.length > 0) {
          createdProviders.push({
            _id: provider._id,
            name: provider.name,
            logo: provider.logo,
            games: createdGames,
          });

          // Update category's providers array if not already included
          if (!category.providers.includes(provider._id)) {
            category.providers.push(provider._id);
            console.log(`Added provider ${name} to category`);
          }
        }
      } catch (providerError) {
        console.log(
          `ERROR processing provider: ${(providerError as Error).message}`,
        );
        errors.push({
          provider: providerData.name || "Unknown",
          error: (providerError as Error).message,
        });
      }
    }

    // Save category with updated providers
    await category.save();
    console.log("Category saved with providers");

    // Verify games were created
    const totalGamesInDB = await Game.countDocuments({ category: categoryId });
    console.log(`\nTotal games in DB for this category: ${totalGamesInDB}`);

    console.log("=== BULK CREATE GAMES END ===\n");

    res.status(201).json({
      success: true,
      message: "Bulk game creation completed",
      category: {
        _id: category._id,
        nameEnglish: category.nameEnglish,
        nameBangla: category.nameBangla,
      },
      providers: createdProviders,
      totalProviders: createdProviders.length,
      totalGames: createdProviders.reduce((sum, p) => sum + p.games.length, 0),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("BULK CREATE ERROR:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};
