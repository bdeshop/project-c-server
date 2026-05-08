import { Request, Response } from "express";
import AffiliateContent from "../models/AffiliateContent";

/**
 * @desc    Get affiliate content
 * @route   GET /api/affiliate-content
 * @access  Public
 */
export const getAffiliateContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("📖 Fetching affiliate content");

    let content = await AffiliateContent.findOne();

    // If no content exists, create default content
    if (!content) {
      console.log("📝 Creating default affiliate content");
      content = await AffiliateContent.create({
        slides: [
          {
            titleEn: "IPL Exclusive",
            titleBn: "IPL এক্সক্লুসিভ",
            subtitleEn: "250% Daily Sports Bonus",
            subtitleBn: "২৫০% দৈনিক স্পোর্টস বোনাস",
            image: "/affiliate-bMUt7shc.png",
            order: 1,
          },
          {
            titleEn: "Cricket Bonus",
            titleBn: "ক্রিকেট বোনাস",
            subtitleEn: "New Offers Daily",
            subtitleBn: "প্রতিদিন নতুন অফার",
            image: "/affiliate-bMUt7shc.png",
            order: 2,
          },
        ],
        bannerText: {
          textEn:
            "Join our platform today and enjoy regular bonuses, gambling and special privileges!",
          textBn:
            "আজই আমাদের প্ল্যাটফর্মে যোগ দিন এবং নিয়মিত বোনাস, জুয়া এবং বিশেষ সুবিধা উপভোগ করুন!",
        },
        features: [
          {
            titleEn: "100% Safe Platform",
            titleBn: "১০০% নিরাপদ প্ল্যাটফর্ম",
            descriptionEn: "Our platform is completely safe and secure",
            descriptionBn: "আমাদের প্ল্যাটফর্ম সম্পূর্ণ নিরাপদ এবং সুরক্ষিত",
            order: 1,
          },
          {
            titleEn: "Fast Payment Process",
            titleBn: "দ্রুত পেমেন্ট প্রসেস",
            descriptionEn: "Get your earnings quickly and safely",
            descriptionBn: "আপনার আয় দ্রুত এবং নিরাপদে পান",
            order: 2,
          },
          {
            titleEn: "24/7 Customer Service",
            titleBn: "২৪/৭ গ্রাহক সেবা",
            descriptionEn: "We are always here for any problem",
            descriptionBn: "যেকোনো সমস্যার জন্য আমরা সবসময় আছি",
            order: 3,
          },
        ],
        commissionCard: {
          percentageEn: "50%",
          percentageBn: "৫০%",
          titleEn: "Commission Offer",
          titleBn: "কমিশন অফার করুন",
          buttonTextEn: "Join Now",
          buttonTextBn: "এখনই যোগ দিন",
        },
        commissionLevels: [
          {
            levelEn: "Level 1",
            levelBn: "লেভেল ১",
            depositEn: "5 - 10 Thousand",
            depositBn: "৫ - ১০ হাজার",
            commissionEn: "25%",
            commissionBn: "২৫%",
            bonusEn: "5%",
            bonusBn: "৫%",
            statusEn: "General Affiliate",
            statusBn: "সাধারণ এফিলিয়েট",
            dailyBonusEn: "25%",
            dailyBonusBn: "২৫%",
            order: 1,
          },
          {
            levelEn: "Level 2",
            levelBn: "লেভেল ২",
            depositEn: "10 - 50 Thousand",
            depositBn: "১০ - ৫০ হাজার",
            commissionEn: "35%",
            commissionBn: "৩৫%",
            bonusEn: "5%",
            bonusBn: "৫%",
            statusEn: "Dedicated Affiliate",
            statusBn: "নিবেদিত এফিলিয়েট",
            dailyBonusEn: "40%",
            dailyBonusBn: "৪০%",
            order: 2,
          },
          {
            levelEn: "Level 3",
            levelBn: "লেভেল ৩",
            depositEn: "50 - 100 Thousand",
            depositBn: "৫০ - ১০০ হাজার",
            commissionEn: "45%",
            commissionBn: "৪৫%",
            bonusEn: "10%",
            bonusBn: "১০%",
            statusEn: "Expert Affiliate",
            statusBn: "দক্ষ এফিলিয়েট",
            dailyBonusEn: "55%",
            dailyBonusBn: "৫৫%",
            order: 3,
          },
          {
            levelEn: "VIP",
            levelBn: "ভিআইপি",
            depositEn: "100+ Thousand",
            depositBn: "১০০+ হাজার",
            commissionEn: "55%",
            commissionBn: "৫৫%",
            bonusEn: "10%",
            bonusBn: "১০%",
            statusEn: "VIP Partnership",
            statusBn: "ভিপি পার্টনারশাপ",
            dailyBonusEn: "60%",
            dailyBonusBn: "৬০%",
            order: 4,
          },
        ],
        mainTitleEn: "Join Today!",
        mainTitleBn: "আজই এডমিট হন!",
        mainDescriptionEn:
          "Join our platform and increase your earning opportunities. Easy registration and instant bonus.",
        mainDescriptionBn:
          "আমাদের প্ল্যাটফর্মে যোগ দিয়ে আপনার আয়ের সুযোগ বাড়ান। সহজ রেজিস্ট্রেশন এবং তাৎক্ষণিক বোনাস পান।",
      });
    }

    console.log("✅ Affiliate content fetched successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate content retrieved successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error fetching affiliate content:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching affiliate content",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Update affiliate content
 * @route   PUT /api/affiliate-content
 * @access  Admin
 */
export const updateAffiliateContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("📝 Updating affiliate content");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    let content = await AffiliateContent.findOne();

    if (!content) {
      content = new AffiliateContent();
    }

    // Update fields if provided
    if (req.body.slides) content.slides = req.body.slides;
    if (req.body.bannerText) content.bannerText = req.body.bannerText;
    if (req.body.features) content.features = req.body.features;
    if (req.body.commissionCard)
      content.commissionCard = req.body.commissionCard;
    if (req.body.commissionLevels)
      content.commissionLevels = req.body.commissionLevels;
    if (req.body.mainTitleEn) content.mainTitleEn = req.body.mainTitleEn;
    if (req.body.mainTitleBn) content.mainTitleBn = req.body.mainTitleBn;
    if (req.body.mainDescriptionEn)
      content.mainDescriptionEn = req.body.mainDescriptionEn;
    if (req.body.mainDescriptionBn)
      content.mainDescriptionBn = req.body.mainDescriptionBn;

    await content.save();

    console.log("✅ Affiliate content updated successfully");

    res.status(200).json({
      success: true,
      message: "Affiliate content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error updating affiliate content:", error);
    res.status(500).json({
      success: false,
      message: "Error updating affiliate content",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Add a slide with image upload
 * @route   POST /api/affiliate-content/slides
 * @access  Admin
 */
export const addSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titleEn, titleBn, subtitleEn, subtitleBn } = req.body;
    const file = (req as any).file;

    if (!titleEn || !titleBn || !subtitleEn || !subtitleBn) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
      return;
    }

    let content = await AffiliateContent.findOne();
    if (!content) {
      content = new AffiliateContent();
    }

    // Generate image path
    const imagePath = `/uploads/${file.filename}`;

    const newSlide = {
      titleEn,
      titleBn,
      subtitleEn,
      subtitleBn,
      image: imagePath,
      order: content.slides.length + 1,
    };

    content.slides.push(newSlide);
    await content.save();

    console.log("✅ Slide added successfully");

    res.status(201).json({
      success: true,
      message: "Slide added successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error adding slide:", error);
    res.status(500).json({
      success: false,
      message: "Error adding slide",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Update a slide
 * @route   PUT /api/affiliate-content/slides/:index
 * @access  Admin
 */
export const updateSlide = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { index } = req.params;
    const slideIndex = parseInt(index);

    let content = await AffiliateContent.findOne();
    if (!content || !content.slides[slideIndex]) {
      res.status(404).json({
        success: false,
        message: "Slide not found",
      });
      return;
    }

    const { titleEn, titleBn, subtitleEn, subtitleBn } = req.body;
    const file = (req as any).file;

    if (titleEn) content.slides[slideIndex].titleEn = titleEn;
    if (titleBn) content.slides[slideIndex].titleBn = titleBn;
    if (subtitleEn) content.slides[slideIndex].subtitleEn = subtitleEn;
    if (subtitleBn) content.slides[slideIndex].subtitleBn = subtitleBn;
    if (file) {
      content.slides[slideIndex].image = `/uploads/${file.filename}`;
    }

    await content.save();

    console.log("✅ Slide updated successfully");

    res.status(200).json({
      success: true,
      message: "Slide updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error updating slide:", error);
    res.status(500).json({
      success: false,
      message: "Error updating slide",
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Delete a slide
 * @route   DELETE /api/affiliate-content/slides/:index
 * @access  Admin
 */
export const deleteSlide = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { index } = req.params;
    const slideIndex = parseInt(index);

    let content = await AffiliateContent.findOne();
    if (!content || !content.slides[slideIndex]) {
      res.status(404).json({
        success: false,
        message: "Slide not found",
      });
      return;
    }

    content.slides.splice(slideIndex, 1);
    await content.save();

    console.log("✅ Slide deleted successfully");

    res.status(200).json({
      success: true,
      message: "Slide deleted successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error deleting slide:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting slide",
      error: (error as Error).message,
    });
  }
};
