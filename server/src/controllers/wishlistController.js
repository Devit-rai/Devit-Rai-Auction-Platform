import mongoose from "mongoose";
import { Wishlist } from "../models/Wishlist.js";
import { Auction } from "../models/Auction.js";

/* Add to Wishlist */
export const addToWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const item = await Wishlist.create({
      user: req.user._id,
      auctionItem: id,
    });

    res.status(201).json({
      message: "Item added to wishlist",
      item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Item already in wishlist",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

/* Get Wishlist (multiple items) */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
    })
      .populate("auctionItem")
      .sort({ createdAt: -1 });

    res.status(200).json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Remove from Wishlist */
export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    await Wishlist.findOneAndDelete({
      user: req.user._id,
      auctionItem: id,
    });

    res.status(200).json({
      message: "Item removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
