import mongoose, { Document, Schema } from 'mongoose';

export interface IBannerText extends Document {
  englishText: string;
  banglaText: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerTextSchema: Schema = new Schema({
  englishText: {
    type: String,
    required: [true, "English banner text is required"],
    trim: true,
  },
  banglaText: {
    type: String,
    required: [true, "Bangla banner text is required"],
    trim: true,
  }
}, { 
  timestamps: true 
});

// Ensure only one banner text document exists
BannerTextSchema.index({}, { unique: true });

// Static method to get or create banner text
BannerTextSchema.statics.getInstance = async function (): Promise<IBannerText> {
  let bannerText = await this.findOne();
  if (!bannerText) {
    bannerText = await this.create({
      englishText: "Welcome to our betting platform!",
      banglaText: "আমাদের বেটিং প্ল্যাটফর্মে স্বাগতম!"
    });
  }
  return bannerText;
};

export default mongoose.model<IBannerText>('BannerText', BannerTextSchema);