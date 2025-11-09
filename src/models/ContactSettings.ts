import mongoose, { Document, Model } from "mongoose";

export interface IContactSettings extends Document {
  service247Url: string;
  whatsappUrl: string;
  telegramUrl: string;
  facebookUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IContactSettingsModel extends Model<IContactSettings> {
  getInstance(): Promise<IContactSettings>;
}

const contactSettingsSchema = new mongoose.Schema(
  {
    service247Url: {
      type: String,
      default: "",
    },
    whatsappUrl: {
      type: String,
      default: "",
    },
    telegramUrl: {
      type: String,
      default: "",
    },
    facebookUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Singleton pattern - only one contact settings document
contactSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      service247Url: "",
      whatsappUrl: "",
      telegramUrl: "",
      facebookUrl: "",
    });
  }
  return settings;
};

export default mongoose.model<IContactSettings, IContactSettingsModel>(
  "ContactSettings",
  contactSettingsSchema
);
