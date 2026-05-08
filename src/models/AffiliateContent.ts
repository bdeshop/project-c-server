import mongoose, { Schema, Document } from "mongoose";

export interface ISlide {
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  image: string;
  order: number;
}

export interface IBannerText {
  textEn: string;
  textBn: string;
}

export interface IFeature {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  order: number;
}

export interface ICommissionCard {
  percentageEn: string;
  percentageBn: string;
  titleEn: string;
  titleBn: string;
  buttonTextEn: string;
  buttonTextBn: string;
}

export interface ICommissionLevel {
  levelEn: string;
  levelBn: string;
  depositEn: string;
  depositBn: string;
  commissionEn: string;
  commissionBn: string;
  bonusEn: string;
  bonusBn: string;
  statusEn: string;
  statusBn: string;
  dailyBonusEn: string;
  dailyBonusBn: string;
  order: number;
}

export interface IAffiliateContent extends Document {
  // Carousel Slides
  slides: ISlide[];

  // Scrolling Banner
  bannerText: IBannerText;

  // Features Section
  features: IFeature[];

  // Commission Card
  commissionCard: ICommissionCard;

  // Commission Levels
  commissionLevels: ICommissionLevel[];

  // Main Section Title
  mainTitleEn: string;
  mainTitleBn: string;
  mainDescriptionEn: string;
  mainDescriptionBn: string;

  createdAt: Date;
  updatedAt: Date;
}

const affiliateContentSchema = new Schema<IAffiliateContent>(
  {
    slides: [
      {
        titleEn: { type: String, required: true },
        titleBn: { type: String, required: true },
        subtitleEn: { type: String, required: true },
        subtitleBn: { type: String, required: true },
        image: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],

    bannerText: {
      textEn: { type: String, default: "" },
      textBn: { type: String, default: "" },
    },

    features: [
      {
        titleEn: { type: String, required: true },
        titleBn: { type: String, required: true },
        descriptionEn: { type: String, required: true },
        descriptionBn: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],

    commissionCard: {
      percentageEn: { type: String, default: "50%" },
      percentageBn: { type: String, default: "৫০%" },
      titleEn: { type: String, default: "Commission Offer" },
      titleBn: { type: String, default: "কমিশন অফার করুন" },
      buttonTextEn: { type: String, default: "Join Now" },
      buttonTextBn: { type: String, default: "এখনই যোগ দিন" },
    },

    commissionLevels: [
      {
        levelEn: { type: String, default: "" },
        levelBn: { type: String, default: "" },
        depositEn: { type: String, default: "" },
        depositBn: { type: String, default: "" },
        commissionEn: { type: String, default: "" },
        commissionBn: { type: String, default: "" },
        bonusEn: { type: String, default: "" },
        bonusBn: { type: String, default: "" },
        statusEn: { type: String, default: "" },
        statusBn: { type: String, default: "" },
        dailyBonusEn: { type: String, default: "" },
        dailyBonusBn: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],

    mainTitleEn: { type: String, default: "Join Today!" },
    mainTitleBn: { type: String, default: "আজই এডমিট হন!" },
    mainDescriptionEn: {
      type: String,
      default: "Join our platform and increase your earning opportunities.",
    },
    mainDescriptionBn: {
      type: String,
      default: "আমাদের প্ল্যাটফর্মে যোগ দিয়ে আপনার আয়ের সুযোগ বাড়ান।",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAffiliateContent>(
  "AffiliateContent",
  affiliateContentSchema,
);
