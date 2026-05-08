import { Request, Response } from "express";
import AffiliateContent from "../models/AffiliateContent";
import fs from "fs";
import path from "path";

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
            subtitleBn: "२५०% দৈনিক স্পোর্টস বোনাস",
            image: "/affiliate-default.png",
            order: 1,
          },
        ],
        bannerText: {
          textEn:
            "Join our platform today and enjoy regular bonuses and special privileges!",
          textBn:
            "আজই আমাদের প্ল্যাটফর্মে যোগ দিন এবং নিয়মিত বোনাস এবং বিশেষ সুবিধা উপভোগ করুন!",
        },
        features: [
          {
            titleEn: "Easy Commission",
            titleBn: "সহজ কমিশন",
            descriptionEn:
              "Earn commission easily on our platform and increase your income.",
            descriptionBn:
              "আমাদের প্ল্যাটফর্মে সহজেই কমিশন অর্জন করুন এবং আপনার আয় বৃদ্ধি করুন।",
            order: 1,
          },
          {
            titleEn: "Secure Privacy",
            titleBn: "নিরাপদ প্রাইভেসি",
            descriptionEn:
              "All your information is completely secure and encrypted with us.",
            descriptionBn:
              "আপনার সমস্ত তথ্য সম্পূর্ণ সুরক্ষিত এবং এনক্রিপ্টেড থাকে আমাদের সাথে।",
            order: 2,
          },
          {
            titleEn: "Mobile Friendly",
            titleBn: "মোবাইল ফ্রেন্ডলি",
            descriptionEn:
              "Use our platform easily from any device and earn money.",
            descriptionBn:
              "যেকোনো ডিভাইস থেকে সহজেই আমাদের প্ল্যাটফর্ম ব্যবহার করুন এবং আয় করুন।",
            order: 3,
          },
          {
            titleEn: "Fast Growth",
            titleBn: "দ্রুত বৃদ্ধি",
            descriptionEn:
              "Your income will grow rapidly through our advanced system and support.",
            descriptionBn:
              "আপনার আয় দ্রুত বৃদ্ধি পাবে আমাদের উন্নত সিস্টেম এবং সাপোর্টের মাধ্যমে।",
            order: 4,
          },
        ],
        commissionCard: {
          percentageEn: "50%",
          percentageBn: "५०%",
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
            depositBn: "५ - १० हजार",
            commissionEn: "25%",
            commissionBn: "२५%",
            bonusEn: "5%",
            bonusBn: "५%",
            statusEn: "Regular Affiliate",
            statusBn: "সাধারণ এফিলিয়েট",
            dailyBonusEn: "25%",
            dailyBonusBn: "२५%",
            order: 1,
          },
          {
            levelEn: "Level 2",
            levelBn: "লেভেল २",
            depositEn: "10 - 50 Thousand",
            depositBn: "१० - ५० हजार",
            commissionEn: "35%",
            commissionBn: "३५%",
            bonusEn: "5%",
            bonusBn: "५%",
            statusEn: "Dedicated Affiliate",
            statusBn: "নিবেদিত এফিলিয়েট",
            dailyBonusEn: "40%",
            dailyBonusBn: "४०%",
            order: 2,
          },
          {
            levelEn: "Level 3",
            levelBn: "লেভেল ३",
            depositEn: "50 - 100 Thousand",
            depositBn: "५० - १०० हजार",
            commissionEn: "45%",
            commissionBn: "४५%",
            bonusEn: "10%",
            bonusBn: "१०%",
            statusEn: "Expert Affiliate",
            statusBn: "দক্ষ এফিলিয়েট",
            dailyBonusEn: "55%",
            dailyBonusBn: "५५%",
            order: 3,
          },
          {
            levelEn: "VIP",
            levelBn: "ভিআইপি",
            depositEn: "100+ Thousand",
            depositBn: "१००+ हजार",
            commissionEn: "55%",
            commissionBn: "५५%",
            bonusEn: "10%",
            bonusBn: "१०%",
            statusEn: "VIP Partnership",
            statusBn: "ভিপি পার্টনারশাপ",
            dailyBonusEn: "60%",
            dailyBonusBn: "६०%",
            order: 4,
          },
        ],
        mainTitleEn: "Join Today!",
        mainTitleBn: "আজই যোগ দিন!",
        mainDescriptionEn:
          "Join our platform and increase your earning opportunities.",
        mainDescriptionBn:
          "আমাদের প্ল্যাটফর্মে যোগ দিয়ে আপনার আয়ের সুযোগ বাড়ান।",
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("❌ Error fetching affiliate content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch affiliate content",
    });
  }
};

/**
 * @desc    Update affiliate content
 * @route   PUT /api/affiliate-content
 * @access  Private/Admin
 */
export const updateAffiliateContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("✏️ Updating affiliate content");

    let content = await AffiliateContent.findOne();

    if (!content) {
      content = new AffiliateContent();
    }

    // Update fields
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

    res.status(200).json({
      success: true,
      message: "Affiliate content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error updating affiliate content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update affiliate content",
    });
  }
};

/**
 * @desc    Add a new slide
 * @route   POST /api/affiliate-content/slides
 * @access  Private/Admin
 */
export const addSlide = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("➕ Adding new slide");

    const { titleEn, titleBn, subtitleEn, subtitleBn } = req.body;

    let content = await AffiliateContent.findOne();
    if (!content) {
      content = new AffiliateContent();
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

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

    res.status(201).json({
      success: true,
      message: "Slide added successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error adding slide:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add slide",
    });
  }
};

/**
 * @desc    Update a slide
 * @route   PUT /api/affiliate-content/slides/:index
 * @access  Private/Admin
 */
export const updateSlide = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("✏️ Updating slide");

    const { index } = req.params;
    const { titleEn, titleBn, subtitleEn, subtitleBn } = req.body;

    let content = await AffiliateContent.findOne();
    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
      return;
    }

    const slideIndex = parseInt(index);
    if (slideIndex < 0 || slideIndex >= content.slides.length) {
      res.status(404).json({
        success: false,
        message: "Slide not found",
      });
      return;
    }

    // Update slide fields
    if (titleEn) content.slides[slideIndex].titleEn = titleEn;
    if (titleBn) content.slides[slideIndex].titleBn = titleBn;
    if (subtitleEn) content.slides[slideIndex].subtitleEn = subtitleEn;
    if (subtitleBn) content.slides[slideIndex].subtitleBn = subtitleBn;

    // Update image if provided
    if (req.file) {
      // Delete old image if exists
      if (content.slides[slideIndex].image) {
        const oldImagePath = path.join(
          process.cwd(),
          content.slides[slideIndex].image,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      content.slides[slideIndex].image = `/uploads/${req.file.filename}`;
    }

    await content.save();

    res.status(200).json({
      success: true,
      message: "Slide updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error updating slide:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update slide",
    });
  }
};

/**
 * @desc    Delete a slide
 * @route   DELETE /api/affiliate-content/slides/:index
 * @access  Private/Admin
 */
export const deleteSlide = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("🗑️ Deleting slide");

    const { index } = req.params;

    let content = await AffiliateContent.findOne();
    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
      return;
    }

    const slideIndex = parseInt(index);
    if (slideIndex < 0 || slideIndex >= content.slides.length) {
      res.status(404).json({
        success: false,
        message: "Slide not found",
      });
      return;
    }

    // Delete image file
    if (content.slides[slideIndex].image) {
      const imagePath = path.join(
        process.cwd(),
        content.slides[slideIndex].image,
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    content.slides.splice(slideIndex, 1);
    await content.save();

    res.status(200).json({
      success: true,
      message: "Slide deleted successfully",
      data: content,
    });
  } catch (error) {
    console.error("❌ Error deleting slide:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete slide",
    });
  }
};
