import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { Bid } from "../models/Bid.js";
import User from "../models/User.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      console.log("Cron for ended auction running...");

      // Only process auctions that have ended and not yet processed
      const endedAuctions = await Auction.find({
        endTime: { $lt: now },
        isProcessed: false,
      });

      for (const auction of endedAuctions) {
        try {
          // Find highest bid
          const highestBidder = await Bid.findOne({
            auctionItem: auction._id,
            amount: auction.currentBid,
          });

          if (highestBidder) {
            const bidder = await User.findById(highestBidder.bidder.id);

            // Update auction with highest bidder
            auction.highestBidder = bidder._id;

            // Optionally update bidder stats
            await User.findByIdAndUpdate(
              bidder._id,
              {
                $inc: {
                  auctionsWon: 1,
                  moneySpent: highestBidder.amount,
                },
              },
              { new: true }
            );
          }

          // Mark auction as processed
          auction.isProcessed = true;
          await auction.save();

          console.log(`Auction ${auction._id} processed successfully`);

        } catch (error) {
          console.error("Auction processing error:", error);
        }
      }
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
};
