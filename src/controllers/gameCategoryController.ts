import { Request, Response } from "express";
import GameCategory from "../models/GameCategory";
import Game from "../models/Game";

// Get all game categories (Public)
export const getGameCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await GameCategory.find()
      .populate("providers", "name logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get single game category (Public)
export const getGameCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await GameCategory.findById(req.params.id).populate(
      "providers",
      "name logo",
    );

    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create game category (Admin only)
export const createGameCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nameEnglish, nameBangla, displayType, icon, image } = req.body;

    if (!nameEnglish || !nameBangla) {
      res.status(400).json({
        message: "Category name in English and Bangla are required",
      });
      return;
    }

    if (!icon) {
      res.status(400).json({ message: "Category icon is required" });
      return;
    }

    const category = await GameCategory.create({
      nameEnglish,
      nameBangla,
      icon,
      image: image || null,
      displayType: displayType || "providers",
    });

    res.status(201).json({
      success: true,
      message: "Game category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Update game category (Admin only)
export const updateGameCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nameEnglish, nameBangla, displayType, icon, image } = req.body;

    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    if (nameEnglish) category.nameEnglish = nameEnglish;
    if (nameBangla) category.nameBangla = nameBangla;
    if (displayType) category.displayType = displayType;
    if (icon) category.icon = icon;
    if (image) category.image = image;

    await category.save();

    const updatedCategory = await category.populate("providers", "name logo");

    res.status(200).json({
      success: true,
      message: "Game category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Delete game category (Admin only)
export const deleteGameCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await GameCategory.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    // Check if category has games
    const gamesCount = await Game.countDocuments({ category: req.params.id });
    if (gamesCount > 0) {
      res.status(400).json({
        message: `Cannot delete category with ${gamesCount} games. Delete games first.`,
      });
      return;
    }

    await GameCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Game category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Add subcategory to game category (Admin only)
export const addSubCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
      res.status(400).json({ message: "Subcategory name is required" });
      return;
    }

    const category = await GameCategory.findById(id);

    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    category.subCategories.push({ name });
    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory added successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Remove subcategory from game category (Admin only)
export const removeSubCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, subCategoryId } = req.params;

    const category = await GameCategory.findById(id);

    if (!category) {
      res.status(404).json({ message: "Game category not found" });
      return;
    }

    category.subCategories = category.subCategories.filter(
      (sub) => sub._id.toString() !== subCategoryId,
    );

    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory removed successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
