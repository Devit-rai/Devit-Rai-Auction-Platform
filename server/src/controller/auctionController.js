import mongoose from "mongoose";
import { Auction } from "../models/Auction.js";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

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

    /* Nepal Time → UTC Conversion */
    const start = dayjs.tz(startTime, "Asia/Kathmandu").utc().toDate();
    const end = dayjs.tz(endTime, "Asia/Kathmandu").utc().toDate();
    const now = new Date();

    if (start < now) {
      return res
        .status(400)
        .json({ message: "Start time cannot be in the past" });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "Start time must be less than end time" });
    }

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
      status: start > now ? "Upcoming" : "Live",
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      createdBy: req.user._id,
      isProcessed: false,
    });

    req.app.get("io")?.emit("auctionStatusUpdate", {
      auctionId: auctionItem._id.toString(),
      status: auctionItem.status,
    });

    res.status(201).json({
      message: "Auction item created successfully",
      auctionItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get all auctions */ 
export const getAllItems = async (_req, res) => {
  try {
    const items = await Auction.find();
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* Get Auction Details */
export const getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const bidders = auctionItem.bids.sort((a, b) => b.amount - a.amount);

    res.status(200).json({ auctionItem, bidders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get My Auctions */
export const getMyAuctionItems = async (req, res) => {
  try {
    const items = await Auction.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Delete Auction */
export const removeFromAuction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auctionItem = await Auction.findById(id);

    if (!auctionItem) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auctionItem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await auctionItem.deleteOne();

    res.status(200).json({
      message: "Auction item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Republish Auction */
export const republishItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "Start time and End time required",
      });
    }

    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const start = dayjs.tz(startTime, "Asia/Kathmandu").utc().toDate();

    const end = dayjs.tz(endTime, "Asia/Kathmandu").utc().toDate();

    const now = new Date();

    if (auctionItem.status === "Live") {
      return res.status(400).json({ message: "Auction is still active" });
    }

    if (start < now) {
      return res.status(400).json({ message: "Start time must be in future" });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Start time must be less than end time",
      });
    }

    auctionItem.startTime = start;
    auctionItem.endTime = end;
    auctionItem.bids = [];
    auctionItem.currentBid = auctionItem.startingBid;
    auctionItem.highestBidder = null;
    auctionItem.status = start > now ? "Upcoming" : "Live";
    auctionItem.isProcessed = false;

    await auctionItem.save();

    res.status(200).json({
      message: "Auction republished successfully",
      auctionItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
