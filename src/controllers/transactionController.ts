import { Request, Response } from "express";
import Transaction from "../models/Transaction";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private (Admin only)
export const getTransactions = async (req: Request, res: Response) => {
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

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private (Admin only)
export const getTransaction = async (
  req: Request,
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
    const User = require("../models/User").default;
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
          user.balance += amount;
          user.deposit += amount;
          console.log(
            `💰 Auto-Deposit: Added ${amount} to ${user.email}. New balance: ${user.balance}`
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
