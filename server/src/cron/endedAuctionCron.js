import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { Bid } from "../models/Bid.js";
import User from "../models/User.js";

/* 🔥 Cron to process ended auctions */
export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      // Find auctions that have ended and not yet processed
      const endedAuctions = await Auction.find({
        endTime: { $lt: now },
        isProcessed: false,
      });

      // Only log if there are ended auctions
      if (endedAuctions.length > 0) {
        console.log(`Processing ${endedAuctions.length} ended auction(s)...`);
      }

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

            // Update bidder stats
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
          console.error("Error processing auction:", error);
        }
      }
    } catch (error) {
      console.error("Error in cron:", error);
    }
  });
};
