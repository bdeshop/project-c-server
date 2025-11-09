import { Request, Response } from 'express';
import UpcomingMatch, { IUpcomingMatch } from '../models/UpcomingMatch';

// Create a new upcoming match
export const createUpcomingMatch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const upcomingMatch: IUpcomingMatch = new UpcomingMatch(req.body);
    const savedUpcomingMatch = await upcomingMatch.save();
    return res.status(201).json({
      success: true,
      data: savedUpcomingMatch
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all upcoming matches
export const getAllUpcomingMatches = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit = '10', category, isLive } = req.query;
    let filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isLive !== undefined) {
      filter.isLive = isLive === 'true';
    }
    
    const upcomingMatches = await UpcomingMatch.find(filter)
      .sort({ matchDate: 1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: upcomingMatches.length,
      data: upcomingMatches
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get upcoming matches by category
export const getUpcomingMatchesByCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { category } = req.params;
    const { limit = '10' } = req.query;
    
    const upcomingMatches = await UpcomingMatch.find({ 
      category: category
    })
      .sort({ matchDate: 1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: upcomingMatches.length,
      data: upcomingMatches
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get live matches
export const getLiveMatches = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit = '10', category } = req.query;
    let filter: any = { isLive: true };
    
    if (category) {
      filter.category = category;
    }
    
    const upcomingMatches = await UpcomingMatch.find(filter)
      .sort({ matchDate: 1 })
      .limit(parseInt(limit as string));
      
    return res.status(200).json({
      success: true,
      count: upcomingMatches.length,
      data: upcomingMatches
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update an upcoming match
export const updateUpcomingMatch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const upcomingMatch = await UpcomingMatch.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!upcomingMatch) {
      return res.status(404).json({
        success: false,
        error: "Upcoming match not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: upcomingMatch
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete an upcoming match
export const deleteUpcomingMatch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const upcomingMatch = await UpcomingMatch.findByIdAndDelete(req.params.id);
    
    if (!upcomingMatch) {
      return res.status(404).json({
        success: false,
        error: "Upcoming match not found"
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