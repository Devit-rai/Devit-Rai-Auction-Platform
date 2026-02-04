import mongoose from "mongoose";
import { Auction } from "../models/Auction.js";
import { Bid } from "../models/Bid.js";
import User from "../models/User.js";

/* Place bide */
const placeBid = (io) => async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auctionItem = await Auction.findById(id);

    if (!auctionItem) {
      return res.status(404).json({ message: "Auction item not found" });
    }

    if (!amount) {
      return res.status(400).json({ message: "Please enter bid amount" });
    }

    if (amount <= auctionItem.currentBid) {
      return res.status(400).json({
        message: "Bid must be greater than current bid",
      });
    }

    if (amount < auctionItem.startingBid) {
      return res.status(400).json({
        message: "Bid must be greater than starting bid",
      });
    }

    let existingBid = await Bid.findOne({
      "bidder.id": req.user._id,
      auctionItem: auctionItem._id,
    });

    let existingBidInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() === req.user._id.toString()
    );

    if (existingBid && existingBidInAuction) {
      existingBid.amount = amount;
      existingBidInAuction.amount = amount;
      await existingBid.save();
    } else {
      const bidderDetail = await User.findById(req.user._id);

      await Bid.create({
        amount,
        bidder: {
          id: bidderDetail._id,
          userName: bidderDetail.name,
          profileImage: bidderDetail.profileImageUrl,
        },
        auctionItem: auctionItem._id,
      });

      auctionItem.bids.push({
        userId: bidderDetail._id,
        userName: bidderDetail.name,
        profileImage: bidderDetail.profileImageUrl,
        amount,
      });
    }

    auctionItem.currentBid = amount;
    auctionItem.highestBidder = req.user._id;

    await auctionItem.save();

    /* Socket live updates */
    if (io) {
      io.emit(`bidUpdate-${auctionItem._id}`, {
        auctionId: auctionItem._id,
        amount,
        bidder: req.user._id,
      });
    }

    res.status(201).json({
      message: "Bid placed successfully",
      currentBid: auctionItem.currentBid,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { placeBid };
