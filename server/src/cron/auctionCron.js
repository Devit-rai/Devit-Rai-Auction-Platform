import cron from "node-cron";
import { Auction } from "../models/Auction.js";

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
        console.log("Auction ENDED:", auction._id);
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
