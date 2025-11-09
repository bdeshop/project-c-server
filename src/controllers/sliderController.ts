import { Request, Response } from "express";
import Slider, { ISlider } from "../models/Slider";

// Utility function to generate full image URL
const generateFullImageUrl = (req: Request, imagePath: string): string => {
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Generate full URL for the image
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/")
    ? imagePath.substring(1)
    : imagePath;
  return `${baseUrl}/${cleanPath}`;
};

// @desc    Create a new slider
// @route   POST /api/sliders
// @access  Private
export const createSlider = async (req: Request, res: Response) => {
  try {
    const { title, status } = req.body;
    const image = req.file;

    // Validation
    if (!title || !status) {
      return res.status(400).json({
        success: false,
        error: "Title and status are required",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Image is required",
      });
    }

    const slider = new Slider({
      title,
      status,
      imageUrl: `upload/${image.filename}`, // Store relative path
    });

    const savedSlider = await slider.save();

    // Return slider with full image URL
    const sliderResponse = {
      ...savedSlider.toObject(),
      imageUrl: generateFullImageUrl(req, savedSlider.imageUrl),
    };

    res.status(201).json({
      success: true,
      data: sliderResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
};

// @desc    Get all sliders
// @route   GET /api/sliders
// @access  Public
export const getSliders = async (req: Request, res: Response) => {
  try {
    const sliders = await Slider.find();

    // Add full URL to image paths for frontend consumption
    const slidersWithFullUrls = sliders.map((slider) => {
      return {
        ...slider.toObject(),
        imageUrl: generateFullImageUrl(req, slider.imageUrl),
      };
    });

    res.status(200).json({
      success: true,
      count: slidersWithFullUrls.length,
      data: slidersWithFullUrls,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
};

// @desc    Get single slider
// @route   GET /api/sliders/:id
// @access  Public
export const getSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slider = await Slider.findById(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        error: "Slider not found",
      });
    }

    // Return slider with full image URL
    const sliderResponse = {
      ...slider.toObject(),
      imageUrl: generateFullImageUrl(req, slider.imageUrl),
    };

    res.status(200).json({
      success: true,
      data: sliderResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
};

// @desc    Update slider
// @route   PUT /api/sliders/:id
// @access  Private
export const updateSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const image = req.file;

    // Check if slider exists
    const existingSlider = await Slider.findById(id);
    if (!existingSlider) {
      return res.status(404).json({
        success: false,
        error: "Slider not found",
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (status) updateData.status = status;

    // Only update image if a new one was uploaded
    if (image) {
      updateData.imageUrl = `upload/${image.filename}`;
    }

    // Update the slider with new data
    const updatedSlider = await Slider.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Add full URL to image path for frontend consumption
    if (updatedSlider) {
      const sliderResponse = {
        ...updatedSlider.toObject(),
        imageUrl: generateFullImageUrl(req, updatedSlider.imageUrl),
      };

      res.status(200).json({
        success: true,
        data: sliderResponse,
      });
    } else {
      res.status(200).json({
        success: true,
        data: updatedSlider,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
};

// @desc    Delete slider
// @route   DELETE /api/sliders/:id
// @access  Private
export const deleteSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findByIdAndDelete(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        error: "Slider not found",
      });
    }

    // In a real app, you would also delete the image file from the filesystem
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
};
