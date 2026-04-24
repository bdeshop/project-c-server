import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import DepositBonus from "../models/DepositBonus";
import BonusWagering from "../models/BonusWagering";
import Promotion from "../models/Promotion";
import User from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// @desc    Get all transactions (admin sees all, user sees own)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      wallet_provider,
      transaction_type,
      search,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // If user is not admin, only show their transactions
    if (req.user?.role !== "admin") {
      filter.user_id = req.user?.id;
    }

    if (status) filter.status = status;
    if (wallet_provider) filter.wallet_provider = wallet_provider;
    if (transaction_type) filter.transaction_type = transaction_type;

    // Search functionality
    if (search) {
      filter.$or = [
        { transaction_id: { $regex: search, $options: "i" } },
        { wallet_number: { $regex: search, $options: "i" } },
        { wallet_provider: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(filter)
      .populate("user_id", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single transaction (admin sees all, user sees own)
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "user_id",
      "username email name balance"
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // If user is not admin, check if they own this transaction
    if (
      req.user?.role !== "admin" &&
      transaction.user_id._id.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own transactions.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private (Admin only)
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      amount,
      wallet_provider,
      transaction_id,
      wallet_number,
      status,
      user_id,
      transaction_type,
      description,
      reference_number,
      bonusCode,
      promotionId,
    } = req.body;

    // Validate required fields
    if (!user_id) {
      res.status(400).json({
        success: false,
        message: "user_id is required to create a transaction",
      });
      return;
    }

    if (!amount || !wallet_provider || !transaction_id || !wallet_number) {
      res.status(400).json({
        success: false,
        message:
          "amount, wallet_provider, transaction_id, and wallet_number are required",
      });
      return;
    }

    // Verify user exists
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found with the provided user_id",
      });
      return;
    }

    // Check if transaction_id already exists
    const existingTransaction = await Transaction.findOne({ transaction_id });
    if (existingTransaction) {
      res.status(400).json({
        success: false,
        message: "Transaction ID already exists",
      });
      return;
    }

    // Check for bonus code if provided (DepositBonus system)
    let depositBonus = null;
    let calculatedBonusAmount = 0;

    if (bonusCode) {
      depositBonus = await DepositBonus.findOne({
        bonusCode,
        status: "Active",
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!depositBonus) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired bonus code",
        });
        return;
      }

      // Check minimum deposit requirement
      if (amount < depositBonus.minimumDepositBDT) {
        res.status(400).json({
          success: false,
          message: `Minimum deposit of ${depositBonus.minimumDepositBDT} BDT required for this bonus`,
        });
        return;
      }

      // Calculate bonus amount
      calculatedBonusAmount = (amount * depositBonus.percentageValue) / 100;

      // Check if bonus amount meets minimum
      if (calculatedBonusAmount < depositBonus.minimumBonusBDT) {
        calculatedBonusAmount = depositBonus.minimumBonusBDT;
      }
    } else if (promotionId) {
      // Handle existing Promotion system
      const Promotion = require("../models/Promotion").default;
      const promotion = await Promotion.findById(promotionId);

      if (promotion && promotion.bonus_settings) {
        const { bonus_type, bonus_value, max_bonus_limit } =
          promotion.bonus_settings;

        if (bonus_type === "fixed") {
          calculatedBonusAmount = bonus_value;
        } else if (bonus_type === "percentage") {
          calculatedBonusAmount = (amount * bonus_value) / 100;
          if (max_bonus_limit && calculatedBonusAmount > max_bonus_limit) {
            calculatedBonusAmount = max_bonus_limit;
          }
        }
      }
    }

    const transaction = await Transaction.create({
      amount,
      wallet_provider,
      transaction_id,
      wallet_number,
      status: status || "Pending",
      user_id,
      transaction_type: transaction_type || "Deposit",
      description,
      reference_number,
      bonusAmount: calculatedBonusAmount,
      depositBonusId: depositBonus?._id || null,
    });

    // Populate user data in response
    await transaction.populate("user_id", "username email name balance");

    console.log(
      `✅ Transaction created: ${transaction.transaction_id} for user ${user.email}`
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private (Admin only)
export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      amount,
      wallet_provider,
      transaction_id,
      wallet_number,
      status,
      user_id,
      transaction_type,
      description,
      reference_number,
    } = req.body;

    // Check if transaction_id already exists (excluding current transaction)
    if (transaction_id) {
      const existingTransaction = await Transaction.findOne({
        transaction_id,
        _id: { $ne: req.params.id },
      });
      if (existingTransaction) {
        res.status(400).json({
          success: false,
          message: "Transaction ID already exists",
        });
        return;
      }
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        wallet_provider,
        transaction_id,
        wallet_number,
        status,
        user_id,
        transaction_type,
        description,
        reference_number,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user_id", "username email name balance");

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private (Admin only)
export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update transaction status
// @route   PATCH /api/transactions/:id/status
// @access  Private (Admin only)
export const updateTransactionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["Pending", "Completed", "Failed", "Cancelled"].includes(status)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be: Pending, Completed, Failed, or Cancelled",
      });
      return;
    }

    // Get the transaction before updating to check previous status
    const existingTransaction = await Transaction.findById(req.params.id);

    if (!existingTransaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // Check if status is changing to "Completed" and wasn't already completed
    const isNewlyCompleted =
      status === "Completed" && existingTransaction.status !== "Completed";

    // Update transaction status
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user_id", "username email balance");

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // If transaction is completed and has a user, update their balance
    console.log("🔍 Debug Info:", {
      isNewlyCompleted,
      hasUserId: !!transaction.user_id,
      userId: transaction.user_id,
      transactionType: transaction.transaction_type,
      amount: transaction.amount,
    });

    if (isNewlyCompleted && transaction.user_id) {
      const User = require("../models/User").default;
      const user = await User.findById(transaction.user_id);

      if (user) {
        const amount = transaction.amount;

        console.log(
          `👤 Found user: ${user.email}, Current balance: ${user.balance}`
        );

        // Update balance based on transaction type
        if (transaction.transaction_type === "Deposit") {
          // Only add the base deposit amount. Bonus is released upon wagering completion.
          user.balance += amount;
          user.deposit += amount;

          // Create wagering requirement record if bonus was applied
          if (
            transaction.depositBonusId &&
            transaction.bonusAmount &&
            transaction.bonusAmount > 0
          ) {
            const depositBonus = await DepositBonus.findById(
              transaction.depositBonusId,
            );

            if (depositBonus && depositBonus.wageringRequirement > 0) {
              const requiredWageringAmount =
                transaction.bonusAmount * depositBonus.wageringRequirement;
              const expiresAt = new Date();
              expiresAt.setDate(
                expiresAt.getDate() + depositBonus.validityPeriodDays,
              );

              await BonusWagering.create({
                userId: transaction.user_id,
                depositTransactionId: transaction._id,
                depositBonusId: transaction.depositBonusId,
                bonusAmount: transaction.bonusAmount,
                requiredWageringAmount,
                currentWageringAmount: 0,
                wageringProgress: 0,
                status: "active",
                expiresAt,
              });

              console.log(
                `✅ Bonus wagering created for ${user.email}: ${requiredWageringAmount} BDT required`,
              );
            }
          }
          console.log(
            `💰 Auto-Deposit: Added ${amount} (with ${
              transaction.bonusAmount || 0
            } bonus pending wagering) to ${user.email}. New balance: ${
              user.balance
            }`,
          );
        } else if (transaction.transaction_type === "Withdrawal") {
          // Check if user has sufficient balance
          if (user.balance >= amount) {
            user.balance -= amount;
            user.withdraw += amount;
            console.log(
              `💸 Auto-Withdraw: Deducted ${amount} from ${user.email}. New balance: ${user.balance}`
            );
          } else {
            res.status(400).json({
              success: false,
              message: "User has insufficient balance for withdrawal",
              data: {
                currentBalance: user.balance,
                requestedAmount: amount,
              },
            });
            return;
          }
        }

        await user.save();

        console.log(
          `✅ Transaction ${transaction.transaction_id} completed and balance updated for ${user.email}`
        );
      } else {
        console.log(`❌ User not found for ID: ${transaction.user_id}`);
      }
    } else {
      console.log("⚠️ Balance not updated because:", {
        isNewlyCompleted,
        hasUserId: !!transaction.user_id,
        reason: !isNewlyCompleted
          ? "Transaction was already completed"
          : "No user_id in transaction",
      });
    }

    res.status(200).json({
      success: true,
      message: `Transaction status updated to ${status}${
        isNewlyCompleted && transaction.user_id
          ? " and user balance updated"
          : ""
      }`,
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private (Admin only)
export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalTransactions = await Transaction.countDocuments();
    const totalAmount = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const walletProviderStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$wallet_provider",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalTransactions,
        totalAmount: totalAmount[0]?.total || 0,
        walletProviderStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get transactions by wallet provider
// @route   GET /api/transactions/provider/:provider
// @access  Private (Admin only)
export const getTransactionsByProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const { provider } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { wallet_provider: provider };
    if (status) filter.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(filter)
      .populate("user_id", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      provider,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
