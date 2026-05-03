import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAffiliate extends Document {
  userName: string;
  password: string;
  fullName?: string;
  email?: string;
  phone: number;
  callingCode: string;
  paymentMethod: string; // bKash, Nagad, Rocket, Binance, Bank Transfer
  paymentDetails: {
    withdrawMethodId?: mongoose.Types.ObjectId;
    // For Mobile Money (bKash, Nagad, Rocket)
    phoneNumber?: string;
    accountType?: string; // Personal, Merchant

    // For Binance
    binanceEmail?: string;
    walletAddress?: string;
    binanceId?: string;

    // For Bank Transfer
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchName?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  status: "pending" | "active" | "inactive";
  role: "affiliate" | "master-affiliate" | "super-affiliate";
  myReferralCode: string;
  balance: number;
  payoutBalance: number;
  betWinCommission?: number;
  betLossCommission?: number;
  depositCommission?: number;
  registrationCommission?: number;
  totalReferrals: number;
  totalEarnings: number;
  // Tracking for last distribution
  lastDistributedWinCommission?: number;
  lastDistributedLossCommission?: number;
  lastDistributedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const affiliateSchema = new Schema<IAffiliate>(
  {
    userName: {
      type: String,
      required: [true, "Please provide a userName"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
    },
    phone: {
      type: Number,
      required: [true, "Please provide a phone number"],
      unique: true,
    },
    callingCode: {
      type: String,
      required: [true, "Please provide a calling code"],
      default: "880",
    },
    paymentMethod: {
      type: String,
      required: [true, "Please provide a payment method"],
      enum: ["bKash", "Nagad", "Rocket", "Binance", "Bank Transfer"],
    },
    paymentDetails: {
      // For Mobile Money (bKash, Nagad, Rocket)
      withdrawMethodId: {
        type: Schema.Types.ObjectId,
        ref: "AffiliateWithdrawMethod",
      },
      phoneNumber: String,
      accountType: {
        type: String,
        enum: ["Personal", "Merchant"],
      },

      // For Binance
      binanceEmail: String,
      walletAddress: String,
      binanceId: String,

      // For Bank Transfer
      bankName: String,
      accountName: String,
      accountNumber: String,
      branchName: String,
      routingNumber: String,
      swiftCode: String,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["affiliate", "master-affiliate", "super-affiliate"],
      default: "affiliate",
    },
    myReferralCode: {
      type: String,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    payoutBalance: {
      type: Number,
      default: 0,
    },
    betWinCommission: {
      type: Number,
      default: 0,
    },
    betLossCommission: {
      type: Number,
      default: 0,
    },
    depositCommission: {
      type: Number,
      default: 0,
    },
    registrationCommission: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    lastDistributedWinCommission: {
      type: Number,
      default: 0,
    },
    lastDistributedLossCommission: {
      type: Number,
      default: 0,
    },
    lastDistributedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
affiliateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
affiliateSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAffiliate>("Affiliate", affiliateSchema);
