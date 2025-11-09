import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  country: string;
  currency: string;
  phoneNumber?: string;
  phoneNumberOTP: number;
  phoneNumberVerified: boolean;
  password: string;
  player_id: string;
  promoCode?: string;
  isVerified: boolean;
  emailVerifyOTP: number;
  emailVerified: boolean;
  status: "active" | "banned" | "deactivated";
  balance: number;
  deposit: number;
  withdraw: number;
  bonusSelection: string;
  birthday: string;
  role: "user" | "admin";
  profileImage: string;
  // --- Referral System ---
  referralCode: string;
  referredBy: string | null;
  referralEarnings: number;
  referredUsers: mongoose.Types.ObjectId[];
  // Individual Referral Settings (per user)
  // These settings control what happens when someone uses THIS user's referral code
  individualReferralSettings: {
    // PARENT EARNINGS: What THIS user gets when someone signs up with their code
    signupBonus: number; // Amount THIS user earns when someone uses their referral code

    // REFERRED USER BENEFITS: What the NEW user gets when they sign up with THIS user's code
    referralCommission: number; // Commission rate the NEW user will earn on their activities
    referralDepositBonus: number; // Bonus the NEW user gets when they make their first deposit
    minWithdrawAmount: number; // Minimum amount the NEW user needs to withdraw
    minTransferAmount: number; // Minimum amount the NEW user can transfer
    maxCommissionLimit: number; // Maximum commission the NEW user can earn

    // CONTROL SETTING
    useGlobalSettings: boolean; // If true, ignore individual settings and use global ones
  };
  // Username field for MongoDB index compatibility
  username: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate: {
        validator: function (v: string): boolean {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    country: {
      type: String,
      required: true,
      default: "Bangladesh",
    },
    currency: {
      type: String,
      required: true,
      default: "BDT",
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    phoneNumberOTP: {
      type: Number,
      default: 0,
    },
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    player_id: {
      type: String,
      required: true,
    },
    promoCode: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyOTP: {
      type: Number,
      default: 0,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "banned", "deactivated"],
      default: "active",
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    deposit: {
      type: Number,
      default: 0,
    },
    withdraw: {
      type: Number,
      default: 0,
    },
    bonusSelection: {
      type: String,
      default: "",
    },
    birthday: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "",
    },
    // --- Referral System ---
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while still enforcing uniqueness
    },
    referredBy: {
      type: String,
      default: null,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Individual Referral Settings (per user)
    // These settings control what happens when someone uses THIS user's referral code
    individualReferralSettings: {
      // PARENT EARNINGS: What THIS user gets when someone signs up with their code
      signupBonus: {
        type: Number,
        default: 0, // Amount THIS user earns when someone uses their referral code
      },

      // REFERRED USER BENEFITS: What the NEW user gets when they sign up with THIS user's code
      referralCommission: {
        type: Number,
        default: 25, // Commission rate the NEW user will earn on their activities
      },
      referralDepositBonus: {
        type: Number,
        default: 0, // Bonus the NEW user gets when they make their first deposit
      },
      minWithdrawAmount: {
        type: Number,
        default: 100, // Minimum amount the NEW user needs to withdraw
      },
      minTransferAmount: {
        type: Number,
        default: 50, // Minimum amount the NEW user can transfer
      },
      maxCommissionLimit: {
        type: Number,
        default: 1000, // Maximum commission the NEW user can earn
      },

      // CONTROL SETTING
      useGlobalSettings: {
        type: Boolean,
        default: true, // If true, ignore individual settings and use global ones
      },
    },
    // Username field for MongoDB index compatibility
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive information when converting to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerifyOTP;
  delete userObject.phoneNumberOTP;
  return userObject;
};

export default mongoose.model<IUser>("User", userSchema);
