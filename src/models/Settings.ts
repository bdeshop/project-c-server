import mongoose, { Document, Schema } from "mongoose";

export interface ISubmenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export interface INavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
  submenu?: ISubmenuItem[];
}

export interface ISettings extends Document {
  organizationName: string;
  organizationImage: string;
  themeColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail: string;
  supportPhone?: string;
  address?: string;
  websiteUrl?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  twoFactorEnabled: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  // UI Customization fields
  headerColor: string;
  headerLoginSignupButtonBgColor: string;
  headerLoginSignupButtonTextColor: string;
  webMenuBgColor: string;
  webMenuTextColor: string;
  webMenuFontSize: string;
  webMenuHoverColor: string;
  mobileMenuLoginSignupButtonBgColor: string;
  mobileMenuLoginSignupButtonTextColor: string;
  mobileMenuFontSize: string;
  footerText: string;
  footerSocialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  // Landing page navigation items
  navigationItems: INavigationItem[];
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
      default: "Betting Platform",
    },
    organizationImage: {
      type: String,
      required: [true, "Organization image is required"],
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          // Allow URL or base64 data URL
          // Updated regex to accept placeholder URLs with query parameters
          return /^(https?:\/\/.*(?:\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/.test(
            v
          );
        },
        message: "Please provide a valid image URL or base64 data URL",
      },
      default: "https://via.placeholder.com/200x100?text=Logo",
    },
    themeColor: {
      type: String,
      required: [true, "Theme color is required"],
      validate: {
        validator: function (v: string): boolean {
          // Validate hex color code
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code (e.g., #FF5733)",
      },
      default: "#3B82F6",
    },
    primaryColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#1E40AF",
    },
    secondaryColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#64748B",
    },
    accentColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#F59E0B",
    },
    logoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          // Updated regex to accept placeholder URLs with query parameters
          return /^(https?:\/\/.*(?:\.(?:png|jpg|jpeg|gif|svg|webp)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/.test(
            v
          );
        },
        message: "Please provide a valid logo URL or base64 data URL",
      },
    },
    faviconUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          // Updated regex to accept placeholder URLs with query parameters
          return /^(https?:\/\/.*(?:\.(?:ico|png|jpg|jpeg|gif|svg)(?:\?.*)?|\/.*)|data:image\/[a-z]+;base64,)/.test(
            v
          );
        },
        message: "Please provide a valid favicon URL or base64 data URL",
      },
    },
    supportEmail: {
      type: String,
      required: [true, "Support email is required"],
      lowercase: true,
      validate: {
        validator: function (v: string): boolean {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid support email",
      },
      default: "support@bettingsite.com",
    },
    supportPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/\s/g, ""));
        },
        message: "Please enter a valid phone number",
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    websiteUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid website URL",
      },
    },
    socialLinks: {
      facebook: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v);
          },
          message: "Please provide a valid Facebook URL",
        },
      },
      twitter: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(v);
          },
          message: "Please provide a valid Twitter/X URL",
        },
      },
      instagram: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v);
          },
          message: "Please provide a valid Instagram URL",
        },
      },
      linkedin: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
          },
          message: "Please provide a valid LinkedIn URL",
        },
      },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    emailVerificationRequired: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    maxLoginAttempts: {
      type: Number,
      min: [3, "Max login attempts must be at least 3"],
      max: [10, "Max login attempts cannot exceed 10"],
      default: 5,
    },
    sessionTimeout: {
      type: Number,
      min: [15, "Session timeout must be at least 15 minutes"],
      max: [1440, "Session timeout cannot exceed 24 hours (1440 minutes)"],
      default: 60, // 1 hour in minutes
    },
    // UI Customization fields
    headerColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#FFFFFF",
    },
    headerLoginSignupButtonBgColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#3B82F6",
    },
    headerLoginSignupButtonTextColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#FFFFFF",
    },
    webMenuBgColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#F8FAFC",
    },
    webMenuTextColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#0F172A",
    },
    webMenuFontSize: {
      type: String,
      default: "16px",
    },
    webMenuHoverColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#3B82F6",
    },
    mobileMenuLoginSignupButtonBgColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#3B82F6",
    },
    mobileMenuLoginSignupButtonTextColor: {
      type: String,
      validate: {
        validator: function (v: string): boolean {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Please provide a valid hex color code",
      },
      default: "#FFFFFF",
    },
    mobileMenuFontSize: {
      type: String,
      default: "16px",
    },
    footerText: {
      type: String,
      default: "© 2025 Betting Platform. All rights reserved.",
    },
    footerSocialLinks: {
      facebook: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v);
          },
          message: "Please provide a valid Facebook URL",
        },
      },
      twitter: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(v);
          },
          message: "Please provide a valid Twitter/X URL",
        },
      },
      instagram: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v);
          },
          message: "Please provide a valid Instagram URL",
        },
      },
      linkedin: {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string): boolean {
            if (!v) return true;
            return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
          },
          message: "Please provide a valid LinkedIn URL",
        },
      },
    },
    // Landing page navigation items
    navigationItems: {
      type: [
        {
          id: {
            type: String,
            required: true,
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
          url: {
            type: String,
            required: true,
            trim: true,
          },
          order: {
            type: Number,
            required: true,
          },
          submenu: {
            type: [
              {
                id: {
                  type: String,
                  required: true,
                },
                name: {
                  type: String,
                  required: true,
                  trim: true,
                },
                path: {
                  type: String,
                  required: true,
                  trim: true,
                },
                icon: {
                  type: String,
                  required: false,
                },
              },
            ],
            required: false,
          },
        },
      ],
      default: [
        { id: "1", label: "Home", url: "/", order: 1 },
        { id: "2", label: "Sports", url: "/sports", order: 2 },
        { id: "3", label: "Casino", url: "/casino", order: 3 },
        { id: "4", label: "Promotions", url: "/promotions", order: 4 },
        { id: "5", label: "Support", url: "/support", order: 5 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Static method to get or create settings
settingsSchema.statics.getInstance = async function (): Promise<ISettings> {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model<ISettings>("Settings", settingsSchema);
