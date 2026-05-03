import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import User from "../models/User";
import AffiliateLink from "../models/AffiliateLink";
import AffiliateClick from "../models/AffiliateClick";
import GameSession from "../models/GameSession";
import mongoose from "mongoose";

/**
 * @desc    Get affiliate referral dashboard with analytics
 * @route   GET /api/affiliate/referral/dashboard
 * @access  Private (Affiliate)
 */
export const getAffiliateReferralDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get referral users with detailed info
    const referrals = await User.find({
      referredBy: affiliate.myReferralCode,
    })
      .select("username email name status createdAt balance")
      .sort({ createdAt: -1 })
      .limit(20);

    const referralCount = referrals.length;

    // Get game sessions for these users to calculate stats
    const referredUsernames = referrals.map(r => r.username);
    const gameSessions = await GameSession.find({
      username: { $in: referredUsernames }
    });

    // Create a map for quick access to session data per user
    const sessionDataMap = new Map();
    gameSessions.forEach(session => {
        const current = sessionDataMap.get(session.username) || { totalWin: 0, totalBet: 0 };
        current.totalWin += session.totalWin || 0;
        current.totalBet += session.totalBet || 0;
        sessionDataMap.set(session.username, current);
    });

    // Calculate referral stats
    const referralStats = referrals.map((user) => {
      const stats = sessionDataMap.get(user.username) || { totalWin: 0, totalBet: 0 };
      const totalEarned = stats.totalWin;
      const totalDeposits = user.balance || 0; // Simplified

      return {
        id: user._id,
        userName: user.username,
        email: user.email || "",
        phone: "", // Khela88 doesn't seem to have phone in this context or it's different
        status: user.status,
        joinedAt: user.createdAt,
        lastActivity: user.createdAt,
        totalEarned,
        totalDeposits,
        isVerified: user.status === "active",
      };
    });

    // Get affiliate links
    let affiliateLinks = await AffiliateLink.find({
      affiliateId: affiliate._id,
    }).sort({ createdAt: -1 });

    // Create default links if none exist
    if (affiliateLinks.length === 0) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      const defaultLinks = [
        {
          affiliateId: affiliate._id,
          name: "Main Registration",
          type: "REGISTRATION" as const,
          description: "Main registration page for new users",
          url: `${frontendUrl}/register?aff=${affiliate.myReferralCode}`,
        },
      ];

      affiliateLinks = await AffiliateLink.insertMany(defaultLinks);
    }

    // Get click analytics for different time periods
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's stats
    const todayClicks = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: todayStart },
    });

    const todayConversions = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      converted: true,
      createdAt: { $gte: todayStart },
    });

    // This week's stats
    const weekClicks = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: weekStart },
    });

    const weekConversions = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      converted: true,
      createdAt: { $gte: weekStart },
    });

    // This month's stats
    const monthClicks = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: monthStart },
    });

    const monthConversions = await AffiliateClick.countDocuments({
      affiliateId: affiliate._id,
      converted: true,
      createdAt: { $gte: monthStart },
    });

    // Calculate earnings for time periods
    const todaySignups = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
      createdAt: { $gte: todayStart },
    });

    const weekSignups = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
      createdAt: { $gte: weekStart },
    });

    const monthSignups = await User.countDocuments({
      referredBy: affiliate.myReferralCode,
      createdAt: { $gte: monthStart },
    });

    // Calculate estimated earnings (registration commission * signups)
    const registrationCommission = affiliate.registrationCommission || 0;
    const todayEarned = todaySignups * registrationCommission;
    const weekEarned = weekSignups * registrationCommission;
    const monthEarned = monthSignups * registrationCommission;

    // Format affiliate links response
    const formattedLinks = affiliateLinks.map((link) => {
      let performance = "Poor";
      if (link.conversionRate >= 7) performance = "Excellent";
      else if (link.conversionRate >= 5) performance = "Good";
      else if (link.conversionRate >= 3) performance = "Average";

      return {
        id: link._id,
        name: link.name,
        type: link.type,
        status: link.status,
        description: link.description,
        url: link.url,
        clicks: link.clicks,
        conversions: link.conversions,
        conversionRate: parseFloat(link.conversionRate.toFixed(2)),
        performance,
        createdAt: link.createdAt,
      };
    });

    // Calculate link performance for analytics
    const linkPerformance = formattedLinks.map((link) => ({
      linkName: link.name,
      clicks: link.clicks,
      conversions: link.conversions,
      conversionRate: link.conversionRate,
      performance: link.performance,
    }));

    res.status(200).json({
      success: true,
      data: {
        userInfo: {
          userName: affiliate.userName,
          status: affiliate.status,
          role: affiliate.role,
          affiliateCode: affiliate.myReferralCode,
        },
        accountSummary: {
          referralCount,
          totalEarnings: affiliate.balance || 0,
        },
        balanceAndCommissions: {
          currentBalance: affiliate.balance || 0,
        },
        referrals: {
          count: referralCount,
          recentReferrals: referralStats.slice(0, 10), // Show top 10 recent
        },
        analytics: {
          today: {
            clicks: todayClicks,
            conversions: todayConversions,
          },
          thisWeek: {
            clicks: weekClicks,
            conversions: weekConversions,
          },
          thisMonth: {
            clicks: monthClicks,
            conversions: monthConversions,
          },
          linkPerformance,
        },
        timeBasedStats: {
          today: {
            signups: todaySignups,
            earned: todayEarned,
          },
          thisWeek: {
            signups: weekSignups,
            earned: weekEarned,
          },
          thisMonth: {
            signups: monthSignups,
            earned: monthEarned,
          },
        },
        affiliateLinks: formattedLinks,
      },
    });
  } catch (error: any) {
    console.error("Error fetching affiliate referral dashboard:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Generate new affiliate referral code (if needed)
 * @route   POST /api/affiliate/referral/generate-code
 * @access  Private (Affiliate)
 */
export const generateAffiliateCode = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Check if affiliate already has a code
    if (affiliate.myReferralCode) {
      res.status(200).json({
        success: true,
        message: "Affiliate code already exists",
        data: {
          affiliateCode: affiliate.myReferralCode,
        },
      });
      return;
    }

    // Generate unique code
    let newCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      newCode = generateUniqueCode();

      // Check if code exists in Affiliate collection
      const existingAffiliate = await Affiliate.findOne({
        myReferralCode: newCode,
      });

      // Check if code exists in User collection
      const existingUser = await User.findOne({
        referralCode: newCode,
      });

      if (!existingAffiliate && !existingUser) {
        isUnique = true;
        affiliate.myReferralCode = newCode!;
        await affiliate.save();
      }

      attempts++;
    }

    if (!isUnique) {
      res.status(500).json({
        success: false,
        message: "Unable to generate unique code. Please try again.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Affiliate code generated successfully",
      data: {
        affiliateCode: affiliate.myReferralCode,
      },
    });
  } catch (error: any) {
    console.error("Error generating affiliate code:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Create custom affiliate link
 * @route   POST /api/affiliate/referral/links
 * @access  Private (Affiliate)
 */
export const createAffiliateLink = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    const { name, type, description, baseUrl } = req.body;

    if (!name || !type) {
      res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
      return;
    }

    const validTypes = ["REGISTRATION", "PROMOTION", "DEPOSIT", "CUSTOM"];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid link type",
      });
      return;
    }

    // Use provided baseUrl or default frontend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const finalBaseUrl = baseUrl || `${frontendUrl}/register`;

    // Create the affiliate link
    const affiliateLink = new AffiliateLink({
      affiliateId: affiliate._id,
      name,
      type,
      description: description || "",
      url: `${finalBaseUrl}?aff=${affiliate.myReferralCode}`,
    });

    await affiliateLink.save();

    res.status(201).json({
      success: true,
      message: "Affiliate link created successfully",
      data: {
        id: affiliateLink._id,
        name: affiliateLink.name,
        type: affiliateLink.type,
        url: affiliateLink.url,
        description: affiliateLink.description,
        status: affiliateLink.status,
      },
    });
  } catch (error: any) {
    console.error("Error creating affiliate link:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Track affiliate link click
 * @route   POST /api/affiliate/referral/track-click
 * @access  Public
 */
export const trackAffiliateClick = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const { affiliateCode, linkId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";
    const referrer = req.get("Referer");

    if (!affiliateCode) {
      res.status(400).json({
        success: false,
        message: "Affiliate code is required",
      });
      return;
    }

    // Find affiliate by code
    const affiliate = await Affiliate.findOne({
      myReferralCode: affiliateCode,
    });

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Invalid affiliate code",
      });
      return;
    }

    // Find or create the link
    let link;
    if (linkId) {
      link = await AffiliateLink.findById(linkId);
    } else {
      // Find default registration link
      link = await AffiliateLink.findOne({
        affiliateId: affiliate._id,
        type: "REGISTRATION",
      });
    }

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    // Create click record
    const click = new AffiliateClick({
      affiliateId: affiliate._id,
      linkId: link._id,
      ipAddress,
      userAgent,
      referrer,
    });

    await click.save();

    // Update link click count
    link.clicks += 1;
    await link.save();

    res.status(200).json({
      success: true,
      message: "Click tracked successfully",
    });
  } catch (error: any) {
    console.error("Error tracking click:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Helper function to generate unique code
function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
