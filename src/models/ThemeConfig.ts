import mongoose, { Document, Schema } from "mongoose";

export interface IThemeConfig extends Document {
  siteInfo: {
    logo?: string;
    favicon?: string;
  };
  
  header: {
    bgColor: string;
    textColor: string;
    fontSize: string;
    logoWidth?: string;
    loginButtonBg: string;
    loginButtonTextColor: string;
    signupButtonBg: string;
    signupButtonTextColor: string;
  };
  
  webMenu: {
    bgColor: string;
    textColor: string;
    fontSize: string;
    hoverColor: string;
    activeColor: string;
  };
  
  mobileMenu: {
    bgColor: string;
    textColor: string;
    fontSize: string;
    loginButtonBg: string;
    loginButtonTextColor: string;
    signupButtonBg: string;
    signupButtonTextColor: string;
  };
  
  fontSettings: {
    globalFontFamily: string;
    globalTextColor: string;
    headingFontSize: string;
    paragraphFontSize: string;
  };
  
  footer: {
    bgColor: string;
    textColor: string;
    linkHoverColor: string;
  };
  
  customSections: {
    topWinners: {
      cardBgColor: string;
      cardTextColor: string;
    };
    upcomingMatches: {
      cardBgColor: string;
      borderColor: string;
    };
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<IThemeConfig>({
  siteInfo: {
    logo: { type: String },
    favicon: { type: String },
  },

  header: {
    bgColor: { type: String, default: "#001f1f" },
    textColor: { type: String, default: "#ffffff" },
    fontSize: { type: String, default: "16px" },
    logoWidth: { type: String, default: "140px" },
    loginButtonBg: { type: String, default: "#09bda2" },
    loginButtonTextColor: { type: String, default: "#ffffff" },
    signupButtonBg: { type: String, default: "#09bda2" },
    signupButtonTextColor: { type: String, default: "#ffffff" },
  },

  webMenu: {
    bgColor: { type: String, default: "#012b2b" },
    textColor: { type: String, default: "#ffffff" },
    fontSize: { type: String, default: "15px" },
    hoverColor: { type: String, default: "#09bda2" },
    activeColor: { type: String, default: "#01aea1" },
  },

  mobileMenu: {
    bgColor: { type: String, default: "#012b2b" },
    textColor: { type: String, default: "#ffffff" },
    fontSize: { type: String, default: "14px" },
    loginButtonBg: { type: String, default: "#09bda2" },
    loginButtonTextColor: { type: String, default: "#ffffff" },
    signupButtonBg: { type: String, default: "#09bda2" },
    signupButtonTextColor: { type: String, default: "#ffffff" },
  },

  fontSettings: {
    globalFontFamily: { type: String, default: "Poppins, sans-serif" },
    globalTextColor: { type: String, default: "#ffffff" },
    headingFontSize: { type: String, default: "24px" },
    paragraphFontSize: { type: String, default: "16px" },
  },

  footer: {
    bgColor: { type: String, default: "#001a1a" },
    textColor: { type: String, default: "#cccccc" },
    linkHoverColor: { type: String, default: "#09bda2" },
  },

  customSections: {
    topWinners: {
      cardBgColor: { type: String, default: "#012b2b" },
      cardTextColor: { type: String, default: "#ffffff" },
    },
    upcomingMatches: {
      cardBgColor: { type: String, default: "#012b2b" },
      borderColor: { type: String, default: "#09bda2" },
    },
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure only one theme config document exists
ThemeSchema.index({}, { unique: true });

// Static method to get or create theme config
ThemeSchema.statics.getInstance = async function (): Promise<IThemeConfig> {
  let themeConfig = await this.findOne();
  if (!themeConfig) {
    themeConfig = await this.create({});
  }
  return themeConfig;
};

export default mongoose.model<IThemeConfig>("ThemeConfig", ThemeSchema);