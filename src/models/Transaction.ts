import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    wallet_provider: {
      type: String,
      required: true,
      trim: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    wallet_number: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Cancelled"],
      default: "Pending",
    },
    // Optional fields for future expansion
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    transaction_type: {
      type: String,
      enum: ["Deposit", "Withdrawal", "Transfer"],
      default: "Deposit",
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    reference_number: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { transaction_id: 1 },
      { wallet_provider: 1 },
      { status: 1 },
      { createdAt: -1 },
    ],
  }
);

export default mongoose.model("Transaction", transactionSchema);
