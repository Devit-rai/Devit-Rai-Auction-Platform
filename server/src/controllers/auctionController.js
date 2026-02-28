import mongoose from "mongoose";
import { Auction } from "../models/Auction.js";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { getIO } from "../utils/socket.js";
import { notifyAdmins } from "../utils/notificationHelper.js"; // ← THE MISSING IMPORT

dayjs.extend(utc);
dayjs.extend(timezone);

/* Add New Auction */
export const addNewAuctionItem = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res
        .status(400)
        .json({ message: "Auction item image is required" });
    }

    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
      return res.status(400).json({ message: "File format not supported" });
    }

    const {
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
    } = req.body;
    if (
      !title ||
      !description ||
      !category ||
      !condition ||
      !startingBid ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = dayjs.tz(startTime, "Asia/Kathmandu").utc().toDate();
    const end = dayjs.tz(endTime, "Asia/Kathmandu").utc().toDate();
    const now = new Date();

    if (start < now)
      return res
        .status(400)
        .json({ message: "Start time cannot be in the past" });
    if (start >= end)
      return res
        .status(400)
        .json({ message: "Start time must be less than end time" });

    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "AUCTION_ITEMS",
    });

    const auctionItem = await Auction.create({
      title,
      description,
      category,
      condition,
      startingBid,
      currentBid: 0,
      startTime: start,
      endTime: end,
      status: "Upcoming",
      approvalStatus: "Pending",
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      createdBy: req.user._id,
      isProcessed: false,
    });

    // Socket: toast popup on admin dashboard
    getIO().emit("newAuctionSubmitted", {
      ...auctionItem.toObject(),
      createdBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    // Persistent bell notification to all admins ← WAS MISSING
    await notifyAdmins({
      type: "NEW_AUCTION",
      title: "New Auction Submitted",
      message: `${req.user.name} submitted "${title}" for approval.`,
      auctionId: auctionItem._id,
      auctionTitle: title,
    });

    res
      .status(201)
      .json({ message: "Auction item created successfully", auctionItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get All Auctions */
export const getAllItems = async (_req, res) => {
  try {
    const items = await Auction.find().populate(
      "createdBy",
      "name email profileImage",
    );
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Auction Details */
export const getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });

    const auctionItem = await Auction.findById(id).populate(
      "createdBy",
      "name email profileImage",
    );
    if (!auctionItem)
      return res.status(404).json({ message: "Auction not found" });

    const bidders = [...auctionItem.bids].sort((a, b) => b.amount - a.amount);
    res.status(200).json({ auctionItem, bidders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Remove Auction */
export const removeFromAuction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });

    const auctionItem = await Auction.findById(id);
    if (!auctionItem)
      return res.status(404).json({ message: "Auction not found" });
    if (auctionItem.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await auctionItem.deleteOne();
    res.status(200).json({ message: "Auction item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Update Auction (Upcoming or Rejected only) */
export const updateAuctionItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });

    const auctionItem = await Auction.findById(id);
    if (!auctionItem)
      return res.status(404).json({ message: "Auction not found" });
    if (auctionItem.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const isUpcoming = auctionItem.status === "Upcoming";
    const isRejected = auctionItem.approvalStatus === "Rejected";
    if (!isUpcoming && !isRejected)
      return res
        .status(400)
        .json({ message: "Only upcoming or rejected auctions can be edited" });

    const {
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
    } = req.body;

    if (title) auctionItem.title = title;
    if (description) auctionItem.description = description;
    if (category) auctionItem.category = category;
    if (condition) auctionItem.condition = condition;
    if (startingBid) auctionItem.startingBid = startingBid;

    if (startTime && endTime) {
      const start = dayjs.tz(startTime, "Asia/Kathmandu").utc().toDate();
      const end = dayjs.tz(endTime, "Asia/Kathmandu").utc().toDate();
      const now = new Date();
      if (start < now)
        return res
          .status(400)
          .json({ message: "Start time cannot be in the past" });
      if (start >= end)
        return res
          .status(400)
          .json({ message: "Start time must be less than end time" });
      auctionItem.startTime = start;
      auctionItem.endTime = end;
    }

    if (req.files && req.files.image) {
      const { image } = req.files;
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedFormats.includes(image.mimetype))
        return res.status(400).json({ message: "File format not supported" });
      await cloudinary.uploader.destroy(auctionItem.image.public_id);
      const uploadResult = await cloudinary.uploader.upload(
        image.tempFilePath,
        { folder: "AUCTION_ITEMS" },
      );
      auctionItem.image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const wasRejected = auctionItem.approvalStatus === "Rejected";
    if (wasRejected) auctionItem.approvalStatus = "Pending";

    await auctionItem.save();

    if (wasRejected) {
      const io = getIO();
      io.emit("auctionApprovalChanged", {
        auctionId: auctionItem._id.toString(),
        approvalStatus: "Pending",
      });
      io.emit("newAuctionSubmitted", {
        ...auctionItem.toObject(),
        createdBy: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });

      await notifyAdmins({
        type: "NEW_AUCTION",
        title: "Auction Resubmitted",
        message: `${req.user.name} edited and resubmitted "${auctionItem.title}" for re-review.`,
        auctionId: auctionItem._id,
        auctionTitle: auctionItem.title,
      });
    }

    res
      .status(200)
      .json({ message: "Auction updated successfully", auctionItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Republish Rejected Auction */
export const republishItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid auction ID" });
    if (!startTime || !endTime)
      return res
        .status(400)
        .json({ message: "Start time and End time required" });

    const auctionItem = await Auction.findById(id);
    if (!auctionItem)
      return res.status(404).json({ message: "Auction not found" });
    if (auctionItem.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (auctionItem.approvalStatus !== "Rejected")
      return res
        .status(400)
        .json({ message: "Only rejected auctions can be republished" });

    const start = dayjs.tz(startTime, "Asia/Kathmandu").utc().toDate();
    const end = dayjs.tz(endTime, "Asia/Kathmandu").utc().toDate();
    const now = new Date();

    if (start < now)
      return res
        .status(400)
        .json({ message: "Start time must be in the future" });
    if (start >= end)
      return res
        .status(400)
        .json({ message: "Start time must be less than end time" });

    auctionItem.startTime = start;
    auctionItem.endTime = end;
    auctionItem.bids = [];
    auctionItem.currentBid = 0;
    auctionItem.highestBidder = null;
    auctionItem.winner = null;
    auctionItem.status = "Upcoming";
    auctionItem.approvalStatus = "Pending";
    auctionItem.isProcessed = false;

    await auctionItem.save();

    getIO().emit("newAuctionSubmitted", {
      ...auctionItem.toObject(),
      createdBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    await notifyAdmins({
      type: "NEW_AUCTION",
      title: "Auction Republished",
      message: `${req.user.name} republished "${auctionItem.title}" with new dates for approval.`,
      auctionId: auctionItem._id,
      auctionTitle: auctionItem.title,
    });

    res
      .status(200)
      .json({ message: "Auction republished successfully", auctionItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
