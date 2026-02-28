import User from "../models/User.js";
import { Auction } from "../models/Auction.js";
import mongoose from "mongoose";
import { sendWinnerEmail } from "../utils/auctionWinner.js";
import { getIO } from "../utils/socket.js";
import {
  createNotification,
  notifyBidders,
} from "../utils/NotificationHelper.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user ID" });

    if (!["Active", "Suspended", "Banned"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "Admin cannot modify their own status" });

    user.status = status;
    await user.save();

    res.status(200).json({
      message: "User status updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        roles: user.roles,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ auctions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });

    const auction = await Auction.findById(id)
      .populate("createdBy", "name email profileImage")
      .populate("bids.userId", "name email profileImage");
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const bidders = [...auction.bids].sort((a, b) => b.amount - a.amount);
    res.status(200).json({ auction, bidders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAuctionApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["Approved", "Rejected"].includes(approvalStatus))
      return res.status(400).json({ message: "Invalid approval status" });

    const auction = await Auction.findById(id).populate(
      "createdBy",
      "_id name email",
    );
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    auction.approvalStatus = approvalStatus;
    await auction.save();

    getIO().emit("auctionApprovalChanged", {
      auctionId: auction._id.toString(),
      approvalStatus,
    });

    const isApproved = approvalStatus === "Approved";
    await createNotification({
      recipientId: auction.createdBy._id,
      recipientRole: "SELLER",
      type: isApproved ? "AUCTION_APPROVED" : "AUCTION_REJECTED",
      title: isApproved ? "Auction Approved 🎉" : "Auction Rejected",
      message: isApproved
        ? `Your auction "${auction.title}" has been approved and will go live at its scheduled time.`
        : `Your auction "${auction.title}" was rejected. You can edit and resubmit it.`,
      auctionId: auction._id,
      auctionTitle: auction.title,
    });

    if (isApproved && auction.bids?.length > 0) {
      await notifyBidders({
        auction,
        type: "AUCTION_LIVE",
        title: "Auction Approved & Going Live",
        message: `"${auction.title}" you bid on has been approved and will start soon.`,
      });
    }

    res
      .status(200)
      .json({
        message: `Auction ${approvalStatus.toLowerCase()} successfully`,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forceCloseAuction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });

    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status === "Ended")
      return res.status(400).json({ message: "Auction already ended" });

    auction.status = "Ended";
    auction.isProcessed = true;

    if (auction.bids && auction.bids.length > 0) {
      const winner = [...auction.bids].sort((a, b) => b.amount - a.amount)[0];
      auction.winner = {
        userId: winner.userId,
        userName: winner.userName,
        amount: winner.amount,
      };
      await sendWinnerEmail(winner.userId, auction);
    }

    await auction.save();
    getIO().emit("auctionStatusUpdated", {
      auctionId: auction._id,
      status: auction.status,
    });
    res
      .status(200)
      .json({ message: "Auction force closed successfully", auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
