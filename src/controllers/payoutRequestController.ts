import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import Affiliate from "../models/Affiliate";
import PayoutRequest from "../models/PayoutRequest";
import User from "../models/User";

/**
 * @desc    Create payout request (Affiliate)
 * @route   POST /api/affiliate/payout/request
 * @access  Private (Affiliate)
 */
export const createPayoutRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { amount, withdrawMethodId, paymentDetails } = req.body;

    console.log("=== Create Payout Request ===");
    console.log("Affiliate ID:", req.user?.id);
    console.log("Amount:", amount);
    console.log("Withdraw Method ID:", withdrawMethodId);

    // Validate input
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
      return;
    }

    if (!withdrawMethodId) {
      res.status(400).json({
        success: false,
        message: "Withdraw method ID is required",
      });
      return;
    }

    // Get affiliate
    const affiliate = await Affiliate.findById(req.user?.id);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Get withdraw method
    const AffiliateWithdrawMethod = require("../models/AffiliateWithdrawMethod").default;
    const withdrawMethod =
      await AffiliateWithdrawMethod.findById(withdrawMethodId);

    if (!withdrawMethod) {
      res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
      return;
    }

    // Validate amount against method limits
    if (amount < withdrawMethod.minimumWithdrawal) {
      res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ${withdrawMethod.minimumWithdrawal} BDT`,
      });
      return;
    }

    if (amount > withdrawMethod.maximumWithdrawal) {
      res.status(400).json({
        success: false,
        message: `Maximum withdrawal amount is ${withdrawMethod.maximumWithdrawal} BDT`,
      });
      return;
    }

    // Check if affiliate has sufficient payout balance
    const payoutBalance = affiliate.payoutBalance || 0;
    const roundedAmount = parseFloat(amount.toFixed(2));
    const roundedBalance = parseFloat(payoutBalance.toFixed(2));

    if (roundedBalance < roundedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient payout balance. Available: ${roundedBalance} BDT, Requested: ${roundedAmount} BDT`,
      });
      return;
    }

    // Validate payment details
    if (!paymentDetails) {
      res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
      return;
    }

    // Create payout request
    const payoutRequest = new PayoutRequest({
      affiliateId: affiliate._id,
      withdrawMethodId: withdrawMethodId,
      userName: affiliate.userName,
      email: affiliate.email,
      phone: affiliate.phone,
      amount: amount,
      paymentMethod: withdrawMethod.methodNameEn,
      paymentDetails: paymentDetails,
      status: "pending",
    });

    await payoutRequest.save();

    console.log(
      `✅ Payout request created: ${affiliate.userName} - ${amount} BDT via ${withdrawMethod.methodNameEn}`,
    );

    res.status(201).json({
      success: true,
      message: "Payout request submitted successfully",
      data: {
        requestId: payoutRequest._id,
        affiliateId: affiliate._id,
        userName: affiliate.userName,
        amount: amount,
        paymentMethod: withdrawMethod.methodNameEn,
        status: "pending",
        createdAt: payoutRequest.createdAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Error creating payout request:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get payout requests (Admin)
 * @route   GET /api/payout/requests
 * @access  Private (Admin)
 */
export const getPayoutRequests = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;

    console.log("=== Get Payout Requests ===");
    console.log("Filter Status:", status);

    let query: any = {};
    if (status) {
      query.status = status;
    }

    const requests = await PayoutRequest.find(query)
      .populate("affiliateId", "userName email phone myReferralCode")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests.map((req) => ({
        id: req._id,
        affiliateId: req.affiliateId,
        userName: req.userName,
        email: req.email,
        phone: req.phone,
        amount: req.amount,
        paymentMethod: req.paymentMethod,
        paymentDetails: req.paymentDetails,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt,
        approvedAt: req.approvedAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching payout requests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Approve payout request (Admin)
 * @route   PATCH /api/payout/requests/:id/approve
 * @access  Private (Admin)
 */
export const approvePayoutRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("=== Approve Payout Request ===");
    console.log("Request ID:", id);

    const payoutRequest = await PayoutRequest.findById(id);

    if (!payoutRequest) {
      res.status(404).json({
        success: false,
        message: "Payout request not found",
      });
      return;
    }

    if (payoutRequest.status !== "pending") {
      res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${payoutRequest.status}`,
      });
      return;
    }

    // Get affiliate
    const affiliate = await Affiliate.findById(payoutRequest.affiliateId);

    if (!affiliate) {
      res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
      return;
    }

    // Check if affiliate still has sufficient balance
    const payoutBalance = affiliate.payoutBalance || 0;
    const roundedAmount = parseFloat(payoutRequest.amount.toFixed(2));
    const roundedBalance = parseFloat(payoutBalance.toFixed(2));

    if (roundedBalance < roundedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient payout balance. Available: ${roundedBalance} BDT, Requested: ${roundedAmount} BDT`,
      });
      return;
    }

    // Deduct amount from affiliate's payout balance
    affiliate.payoutBalance = payoutBalance - payoutRequest.amount;
    await affiliate.save();

    // Update payout request
    payoutRequest.status = "approved";
    payoutRequest.approvedBy = req.user?.id;
    payoutRequest.approvedAt = new Date();
    await payoutRequest.save();

    console.log(
      `✅ Payout request approved: ${affiliate.userName} - ${payoutRequest.amount} BDT`,
    );
    console.log(`💰 New Payout Balance: ${affiliate.payoutBalance} BDT`);

    res.status(200).json({
      success: true,
      message: "Payout request approved successfully",
      data: {
        requestId: payoutRequest._id,
        affiliateId: affiliate._id,
        userName: affiliate.userName,
        amount: payoutRequest.amount,
        status: "approved",
        newPayoutBalance: parseFloat(affiliate.payoutBalance.toFixed(2)),
        approvedAt: payoutRequest.approvedAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Error approving payout request:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Reject payout request (Admin)
 * @route   PATCH /api/payout/requests/:id/reject
 * @access  Private (Admin)
 */
export const rejectPayoutRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    console.log("=== Reject Payout Request ===");
    console.log("Request ID:", id);
    console.log("Rejection Reason:", rejectionReason);

    const payoutRequest = await PayoutRequest.findById(id);

    if (!payoutRequest) {
      res.status(404).json({
        success: false,
        message: "Payout request not found",
      });
      return;
    }

    if (payoutRequest.status !== "pending") {
      res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${payoutRequest.status}`,
      });
      return;
    }

    // Update payout request
    payoutRequest.status = "rejected";
    payoutRequest.rejectionReason = rejectionReason || "No reason provided";
    payoutRequest.rejectedAt = new Date();
    await payoutRequest.save();

    console.log(
      `❌ Payout request rejected: ${payoutRequest.userName} - ${payoutRequest.amount} BDT`,
    );

    res.status(200).json({
      success: true,
      message: "Payout request rejected successfully",
      data: {
        requestId: payoutRequest._id,
        affiliateId: payoutRequest.affiliateId,
        userName: payoutRequest.userName,
        amount: payoutRequest.amount,
        status: "rejected",
        rejectionReason: payoutRequest.rejectionReason,
        rejectedAt: payoutRequest.rejectedAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Error rejecting payout request:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * @desc    Get affiliate's payout requests (Affiliate)
 * @route   GET /api/affiliate/payout/requests
 * @access  Private (Affiliate)
 */
export const getAffiliatePayoutRequests = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const requests = await PayoutRequest.find({
      affiliateId: req.user?.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests.map((req) => ({
        id: req._id,
        amount: req.amount,
        paymentMethod: req.paymentMethod,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt,
        approvedAt: req.approvedAt,
        rejectedAt: req.rejectedAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching affiliate payout requests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
