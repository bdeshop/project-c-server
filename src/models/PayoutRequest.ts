import mongoose, { Document, Schema } from "mongoose";

export interface IPayoutRequest extends Document {
  affiliateId: mongoose.Types.ObjectId;
  withdrawMethodId: mongoose.Types.ObjectId;
  userName: string;
  email?: string;
  phone: number;
  amount: number;
  paymentMethod: string;
  paymentDetails: {
    phoneNumber?: string;
    accountType?: string;
    binanceEmail?: string;
    walletAddress?: string;
    binanceId?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchName?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payoutRequestSchema = new Schema<IPayoutRequest>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    withdrawMethodId: {
      type: Schema.Types.ObjectId,
      ref: "AffiliateWithdrawMethod",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentDetails: {
      phoneNumber: String,
      accountType: {
        type: String,
        enum: ["Personal", "Merchant"],
      },
      binanceEmail: String,
      walletAddress: String,
      binanceId: String,
      bankName: String,
      accountName: String,
      accountNumber: String,
      branchName: String,
      routingNumber: String,
      swiftCode: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model<IPayoutRequest>(
  "PayoutRequest",
  payoutRequestSchema,
);
