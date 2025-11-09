import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoSection extends Document {
  banner: {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
  };
  video: {
    title?: string;
    youtubeUrl: string;
    thumbnail?: string;
  };
  extraBanner: {
    image?: string;
    link?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoSectionSchema: Schema = new Schema({
  banner: {
    title: { 
      type: String, 
      required: [true, "Banner title is required"],
      trim: true,
    },
    subtitle: { 
      type: String,
      trim: true,
    },
    ctaText: { 
      type: String,
      trim: true,
    },
    ctaLink: { 
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          // Accept absolute URLs, relative paths, and anchor links
          return /^https?:\/\/.+/.test(v) || /^\/.*/.test(v) || /^#.*/.test(v);
        },
        message: "Please provide a valid URL for CTA link",
      },
    },
    image: { 
      type: String,
      trim: true,
    },
  },
  video: {
    title: { 
      type: String,
      trim: true,
    },
    youtubeUrl: { 
      type: String, 
      required: [true, "YouTube URL is required"],
      validate: {
        validator: function (v: string): boolean {
          return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(v);
        },
        message: "Please provide a valid YouTube URL",
      },
    },
    thumbnail: { 
      type: String,
      trim: true,
    },
  },
  extraBanner: {
    image: { 
      type: String,
      trim: true,
    },
    link: { 
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          // Accept absolute URLs, relative paths, and anchor links
          return /^https?:\/\/.+/.test(v) || /^\/.*/.test(v) || /^#.*/.test(v);
        },
        message: "Please provide a valid URL for extra banner link",
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { 
  timestamps: true 
});

// Ensure only one promo section document exists
PromoSectionSchema.index({}, { unique: true });

// Static method to get or create promo section
PromoSectionSchema.statics.getInstance = async function (): Promise<IPromoSection> {
  let promoSection = await this.findOne();
  if (!promoSection) {
    promoSection = await this.create({
      banner: {
        title: "খেলা88 অফিসিয়াল বাংলাদেশ নং.১ প্ল্যাটফর্ম",
        subtitle: "বাংলাদেশের সবচেয়ে বিশ্বস্ত বেটিং প্ল্যাটফর্ম",
        ctaText: "এখন আমাদের সাথে যোগদিন",
        ctaLink: "/register",
        image: "/images/banner-girl.png"
      },
      video: {
        title: "Khela88 Sarah",
        youtubeUrl: "https://www.youtube.com/watch?v=example",
        thumbnail: "/images/video-thumbnail.png"
      },
      extraBanner: {
        image: "/images/extra-banner.png",
        link: "/promotions"
      },
      isActive: true
    });
  }
  return promoSection;
};

export default mongoose.model<IPromoSection>('PromoSection', PromoSectionSchema);