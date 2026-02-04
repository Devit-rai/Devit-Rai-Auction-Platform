import mongoose from "mongoose";
import { Auction } from "../models/Auction.js";
import { v2 as cloudinary } from "cloudinary";

/* ADD NEW AUCTION ITEM */
const addNewAuctionItem = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Auction item image is required" });
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

    if (new Date(startTime) < Date.now()) {
      return res
        .status(400)
        .json({ message: "Start time must be in the future" });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "Start time must be less than end time" });
    }


    const uploadResult = await cloudinary.uploader.upload(
      image.tempFilePath,
      { folder: "AUCTION_ITEMS" }
    );

    const auctionItem = await Auction.create({
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Auction item created successfully",
      auctionItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL AUCTION ITEMS */
const getAllItems = async (req, res) => {
  try {
    const items = await Auction.find();
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET AUCTION DETAILS */
const getAuctionDetails = async (req, res) => {
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

    res.status(200).json({
      auctionItem,
      bidders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET MY AUCTION ITEMS */
const getMyAuctionItems = async (req, res) => {
  try {
    const items = await Auction.find({ createdBy: req.user._id });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE AUCTION ITEM */
const removeFromAuction = async (req, res) => {
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

/* REPUBLISH AUCTION ITEM */
const republishItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "Start time and End time required" });
    }

    const auctionItem = await Auction.findById(id);

    if (!auctionItem) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (new Date(auctionItem.endTime) > Date.now()) {
      return res
        .status(400)
        .json({ message: "Auction is still active" });
    }

    if (new Date(startTime) < Date.now()) {
      return res
        .status(400)
        .json({ message: "Start time must be in future" });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "Start time must be less than end time" });
    }

    auctionItem.startTime = startTime;
    auctionItem.endTime = endTime;
    auctionItem.bids = [];
    auctionItem.currentBid = 0;
    auctionItem.highestBidder = null;

    await auctionItem.save();

    res.status(200).json({
      message: "Auction republished successfully",
      auctionItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ✅ NAMED EXPORTS */
export {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  getMyAuctionItems,
  removeFromAuction,
  republishItem,
};
