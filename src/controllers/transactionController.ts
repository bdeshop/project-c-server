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
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "user_id",
      "username email"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
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
) => {
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

    // Check if transaction_id already exists
    const existingTransaction = await Transaction.findOne({ transaction_id });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID already exists",
      });
    }

    const transaction = await Transaction.create({
      amount,
      wallet_provider,
      transaction_id,
      wallet_number,
      status,
      user_id,
      transaction_type,
      description,
      reference_number,
    });

    // Populate user data in response
    await transaction.populate("user_id", "username email");

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error: any) {
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
) => {
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
        return res.status(400).json({
          success: false,
          message: "Transaction ID already exists",
        });
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
    ).populate("user_id", "username email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
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
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
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
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Completed", "Failed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be: Pending, Completed, Failed, or Cancelled",
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user_id", "username email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Transaction status updated to ${status}`,
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
