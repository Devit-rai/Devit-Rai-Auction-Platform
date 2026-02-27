import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { sendWinnerEmail } from "../utils/auctionWinner.js";
import { getIO } from "../utils/socket.js";

export const auctionCron = () => {
  cron.schedule("*/1 * * * * *", async () => {
    try {
      const io  = getIO();
      const now = new Date();
      const auctions = await Auction.find({ isProcessed: false });

      for (let auction of auctions) {
        let updated = false;

        /* Upcoming → Live */
        if (
          auction.approvalStatus === "Approved" &&
          now >= auction.startTime &&
          now <  auction.endTime  &&
          auction.status !== "Live"
        ) {
          auction.status = "Live";
          updated = true;
          console.log(`Auction LIVE: ${auction._id}`);
        }

        /* Auto-reject: start time passed without approval  */
        if (
          auction.approvalStatus !== "Approved" &&
          auction.approvalStatus !== "Rejected" &&
          now >= auction.startTime
        ) {
          auction.approvalStatus = "Rejected";
          auction.status = "Ended";
          auction.isProcessed = true;

          await auction.save();

          // Notify seller — badge flips Pending → Rejected in real-time
          io.emit("auctionApprovalChanged", {
            auctionId: auction._id.toString(),
            approvalStatus: "Rejected",
          });
          io.emit("auctionStatusUpdated", {
            auctionId: auction._id.toString(),
            status: "Ended",
          });

          console.log(`Auction AUTO-REJECTED (start time passed without approval): ${auction._id}`);
          continue;
        }

        /* Live → Ended */
        if (
          auction.approvalStatus === "Approved" &&
          now >= auction.endTime  &&
          auction.status !== "Ended"
        ) {
          auction.status = "Ended";
          auction.isProcessed = true;
          updated = true;
          console.log(`Auction ENDED: ${auction._id}`);

          if (auction.bids && auction.bids.length > 0) {
            const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount);
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
            endTime:   auction.endTime,
          });
        }

        /* Save & broadcast if status changed */
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