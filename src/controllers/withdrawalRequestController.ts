import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import User from "../models/User";
import WithdrawalMethod from "../models/WithdrawalMethod";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// @desc    Create withdrawal request
// @route   POST /api/withdrawal-requests
// @access  Private (User)
export const createWithdrawalRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const { withdrawal_method_id, amount, phone_number, additional_info } =
      req.body;

    // Validate required fields
    if (!withdrawal_method_id || !amount || !phone_number) {
      res.status(400).json({
        success: false,
        message: "withdrawal_method_id, amount, and phone_number are required",
      });
      return;
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
      return;
    }

    // Get user's current balance
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      res.status(400).json({
        success: false,
        message: "Insufficient balance",
        data: {
          currentBalance: user.balance,
          requestedAmount: amount,
          shortfall: amount - user.balance,
        },
      });
      return;
    }

    // Get withdrawal method details
    const withdrawalMethod = await WithdrawalMethod.findById(
      withdrawal_method_id
    );
    if (!withdrawalMethod) {
      res.status(404).json({
        success: false,
        message: "Withdrawal method not found",
      });
      return;
    }

    // Check if withdrawal method is active
    if (withdrawalMethod.status !== "Active") {
      res.status(400).json({
        success: false,
        message: "This withdrawal method is currently inactive",
      });
      return;
    }

    // Validate min/max withdrawal limits
    if (amount < withdrawalMethod.min_withdrawal) {
      res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ${withdrawalMethod.min_withdrawal}`,
        data: {
          minAmount: withdrawalMethod.min_withdrawal,
          requestedAmount: amount,
        },
      });
      return;
    }

    if (amount > withdrawalMethod.max_withdrawal) {
      res.status(400).json({
        success: false,
        message: `Maximum withdrawal amount is ${withdrawalMethod.max_withdrawal}`,
        data: {
          maxAmount: withdrawalMethod.max_withdrawal,
          requestedAmount: amount,
        },
      });
      return;
    }

    // Calculate fee
    let fee = 0;
    if (withdrawalMethod.fee_type === "fixed") {
      fee = withdrawalMethod.withdrawal_fee;
    } else if (withdrawalMethod.fee_type === "percentage") {
      fee = (amount * withdrawalMethod.withdrawal_fee) / 100;
    }

    const totalDeduction = amount + fee;

    // Check if user has enough balance including fee
    if (user.balance < totalDeduction) {
      res.status(400).json({
        success: false,
        message: "Insufficient balance to cover withdrawal amount and fee",
        data: {
          currentBalance: user.balance,
          withdrawalAmount: amount,
          fee: fee,
          totalRequired: totalDeduction,
          shortfall: totalDeduction - user.balance,
        },
      });
      return;
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      amount: amount,
      wallet_provider: withdrawalMethod.method_name_en,
      transaction_id: `WD${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`,
      wallet_number: phone_number,
      status: "Pending",
      user_id: req.user.id,
      transaction_type: "Withdrawal",
      description: `Withdrawal via ${withdrawalMethod.method_name_en}${
        additional_info ? ` - ${additional_info}` : ""
      }`,
      reference_number: `WR${Date.now()}`,
    });

    // Populate user data
    await transaction.populate("user_id", "username email name balance");

    console.log(
      `💸 Withdrawal request created: ${transaction.transaction_id} for ${user.email} - Amount: ${amount}, Fee: ${fee}`
    );

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        transaction: transaction,
        withdrawalDetails: {
          method: withdrawalMethod.method_name_en,
          amount: amount,
          fee: fee,
          totalDeduction: totalDeduction,
          phoneNumber: phone_number,
          processingTime: withdrawalMethod.processing_time,
          currentBalance: user.balance,
          balanceAfterWithdrawal: user.balance - totalDeduction,
        },
      },
    });
  } catch (error: any) {
    console.error("Create withdrawal request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create withdrawal request",
      error: error.message,
    });
  }
};

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawal-requests
// @access  Private (User)
export const getUserWithdrawalRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const withdrawalRequests = await Transaction.find({
      user_id: req.user.id,
      transaction_type: "Withdrawal",
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "username email name");

    res.status(200).json({
      success: true,
      count: withdrawalRequests.length,
      data: withdrawalRequests,
    });
  } catch (error: any) {
    console.error("Get withdrawal requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all withdrawal requests (admin sees all, user sees own)
// @route   GET /api/withdrawal-requests/all
// @access  Private
export const getAllWithdrawalRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = { transaction_type: "Withdrawal" };

    // If user is not admin, only show their withdrawal requests
    if (req.user?.role !== "admin") {
      filter.user_id = req.user?.id;
    }

    if (status) {
      filter.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const withdrawalRequests = await Transaction.find(filter)
      .populate("user_id", "username email name balance")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: withdrawalRequests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: withdrawalRequests,
    });
  } catch (error: any) {
    console.error("Get all withdrawal requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Cancel withdrawal request
// @route   PATCH /api/withdrawal-requests/:id/cancel
// @access  Private (User - own requests only)
export const cancelWithdrawalRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Withdrawal request not found",
      });
      return;
    }

    // Check if user owns this transaction
    if (transaction.user_id.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: "You can only cancel your own withdrawal requests",
      });
      return;
    }

    // Can only cancel pending requests
    if (transaction.status !== "Pending") {
      res.status(400).json({
        success: false,
        message: `Cannot cancel ${transaction.status.toLowerCase()} withdrawal request`,
      });
      return;
    }

    transaction.status = "Cancelled";
    await transaction.save();

    console.log(
      `❌ Withdrawal request cancelled: ${transaction.transaction_id}`
    );

    res.status(200).json({
      success: true,
      message: "Withdrawal request cancelled successfully",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Cancel withdrawal request error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
