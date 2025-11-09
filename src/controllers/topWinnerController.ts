import { Request, Response } from 'express';
import TopWinner, { ITopWinner } from '../models/TopWinner';

// Create a new top winner entry
export const createTopWinner = async (req: Request, res: Response): Promise<Response> => {
  try {
    const topWinner: ITopWinner = new TopWinner(req.body);
    const savedTopWinner = await topWinner.save();
    return res.status(201).json({
      success: true,
      data: savedTopWinner
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all top winners
export const getAllTopWinners = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit = '10', category, isLive } = req.query;
    let filter: any = {};
    
    if (category) {
      filter.gameCategory = category;
    }
    
    if (isLive !== undefined) {
      filter.isLive = isLive === 'true';
    }
    
    const topWinners = await TopWinner.find(filter)
      .sort({ winAmount: -1, winTime: -1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: topWinners.length,
      data: topWinners
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get live top winners
export const getLiveTopWinners = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit = '10', category } = req.query;
    let filter: any = { isLive: true };
    
    if (category) {
      filter.gameCategory = category;
    }
    
    const topWinners = await TopWinner.find(filter)
      .sort({ winTime: -1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: topWinners.length,
      data: topWinners
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get top winners by category
export const getTopWinnersByCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { category } = req.params;
    const { limit = '10' } = req.query;
    
    const topWinners = await TopWinner.find({ 
      gameCategory: category,
      isLive: true 
    })
      .sort({ winAmount: -1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: topWinners.length,
      data: topWinners
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a top winner entry
export const updateTopWinner = async (req: Request, res: Response): Promise<Response> => {
  try {
    const topWinner = await TopWinner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!topWinner) {
      return res.status(404).json({
        success: false,
        error: "Top winner not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: topWinner
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a top winner entry
export const deleteTopWinner = async (req: Request, res: Response): Promise<Response> => {
  try {
    const topWinner = await TopWinner.findByIdAndDelete(req.params.id);
    
    if (!topWinner) {
      return res.status(404).json({
        success: false,
        error: "Top winner not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};