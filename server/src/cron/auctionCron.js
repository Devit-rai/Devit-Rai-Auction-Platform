import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { sendWinnerEmail } from "../utils/auctionWinner.js";


export const auctionCron = (io) => {
  cron.schedule("*/1 * * * * *", async () => {
    // runs every second (better for testing)

    const now = new Date();
    // console.log("Cron running:", now.toLocaleTimeString());

    const auctions = await Auction.find({ isProcessed: false });

    for (let auction of auctions) {
      let updated = false;

      // Upcoming → Live
      if (
        now >= auction.startTime &&
        now < auction.endTime &&
        auction.status !== "Live"
      ) {
        auction.status = "Live";
        updated = true;
        console.log("Auction LIVE:", auction._id);
      }

      // Live → Ended
      if (now >= auction.endTime && auction.status !== "Ended") {
        auction.status = "Ended";
        auction.isProcessed = true;
        updated = true;

        // Determine winner
        if (auction.bids.length > 0) {
          // Sort bids descending by amount
          const sortedBids = auction.bids.sort((a, b) => b.amount - a.amount);
          const winner = sortedBids[0]; // highest bidder
          auction.winner = {
            userId: winner.userId,
            userName: winner.userName,
            amount: winner.amount,
          };

          // Send email to winner
          sendWinnerEmail(winner.userId, auction);
        }

      }

      if (updated) {
        await auction.save();

        // Real-time update via Socket.IO
        io.emit("auctionStatusUpdated", {
          auctionId: auction._id,
          status: auction.status,
        });
      }
    }
  });
};
