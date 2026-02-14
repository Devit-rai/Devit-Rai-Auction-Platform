import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { sendWinnerEmail } from "../utils/auctionWinner.js";

export const auctionCron = (io) => {
  cron.schedule("*/1 * * * * *", async () => {
    try {
      const now = new Date();

      const auctions = await Auction.find({ isProcessed: false });

      for (let auction of auctions) {
        let updated = false;

        /* Upcomming -> Live */
        if (
          now >= auction.startTime &&
          now < auction.endTime &&
          auction.status !== "Live"
        ) {
          auction.status = "Live";
          updated = true;

          console.log(`Auction LIVE: ${auction._id}`);
        }

        /* Live -> Ended */
        if (now >= auction.endTime && auction.status !== "Ended") {
          auction.status = "Ended";
          auction.isProcessed = true;
          updated = true;

          console.log(`Auction ENDED: ${auction._id}`);

          if (auction.bids && auction.bids.length > 0) {
            const sortedBids = auction.bids.sort((a, b) => b.amount - a.amount);

            const winner = sortedBids[0];

            auction.winner = {
              userId: winner.userId,
              userName: winner.userName,
              amount: winner.amount,
            };

            await sendWinnerEmail(winner.userId, auction);
          }
        }

        /* Live Countdown */
        if (auction.status === "Live") {
            io.to(auction._id.toString()).emit("auctionCountdown", {
              auctionId: auction._id,
              endTime: auction.endTime,
            });
          
        }

        /* Save Realtime update */
        if (updated) {
          await auction.save();

          io.emit("auctionStatusUpdated", {
            auctionId: auction._id,
            status: auction.status,
            startTime: auction.startTime,
            endTime: auction.endTime,
          });
        }
      }
    } catch (error) {
      console.error("Auction Cron Error:", error.message);
    }
  });
};
