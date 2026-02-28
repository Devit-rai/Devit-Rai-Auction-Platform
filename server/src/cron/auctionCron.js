import cron from "node-cron";
import { Auction } from "../models/Auction.js";
import { sendWinnerEmail } from "../utils/auctionWinner.js";
import { getIO } from "../utils/socket.js";
import { createNotification, notifyBidders } from "../utils/NotificationHelper.js";

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

          // Notify all bidders who have already bid, plus the seller
          await notifyBidders({
            auction,
            type: "AUCTION_LIVE",
            title: "Auction is Live! 🔴",
            message: `"${auction.title}" is now live. Place your bids!`,
          });

          // Notify seller
          await createNotification({
            recipientId:   auction.createdBy,
            recipientRole: "SELLER",
            type: "AUCTION_LIVE",
            title: "Your Auction is Live!",
            message: `"${auction.title}" has started and is now accepting bids.`,
            auctionId: auction._id,
            auctionTitle:  auction.title,
          });
        }

        /*  Auto-reject when start time passed without approval  */
        if (
          auction.approvalStatus !== "Approved" &&
          auction.approvalStatus !== "Rejected" &&
          now >= auction.startTime
        ) {
          auction.approvalStatus = "Rejected";
          auction.status = "Ended";
          auction.isProcessed = true;

          await auction.save();

          io.emit("auctionApprovalChanged", {
            auctionId: auction._id.toString(),
            approvalStatus: "Rejected",
          });
          io.emit("auctionStatusUpdated", {
            auctionId: auction._id.toString(),
            status: "Ended",
          });

          // Notify seller
          await createNotification({
            recipientId: auction.createdBy,
            recipientRole: "SELLER",
            type: "AUTO_REJECTED",
            title: "Auction Auto-Rejected",
            message: `"${auction.title}" was automatically rejected because it wasn't approved before its start time. You can edit and resubmit.`,
            auctionId: auction._id,
            auctionTitle:  auction.title,
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

            // Notify winner
            await createNotification({
              recipientId:   winner.userId,
              recipientRole: "USER",
              type: "AUCTION_ENDED",
              title: "🏆 You Won the Auction!",
              message: `Congratulations! You won "${auction.title}" with a bid of NPR ${Number(winner.amount).toLocaleString()}.`,
              auctionId: auction._id,
              auctionTitle: auction.title,
            });

            // Notify other bidders (not the winner)
            const otherBidderIds = [...new Set(
              auction.bids
                .filter((b) => b.userId?.toString() !== winner.userId?.toString())
                .map((b) => b.userId?.toString())
                .filter(Boolean)
            )];

            await Promise.all(
              otherBidderIds.map((userId) =>
                createNotification({
                  recipientId:   userId,
                  recipientRole: "USER",
                  type: "AUCTION_ENDED",
                  title: "Auction Ended",
                  message: `"${auction.title}" has ended. Unfortunately you didn't win this time.`,
                  auctionId: auction._id,
                  auctionTitle: auction.title,
                })
              )
            );
          } else {
            // No bids — just notify seller
            await createNotification({
              recipientId: auction.createdBy,
              recipientRole: "SELLER",
              type: "AUCTION_ENDED",
              title: "Auction Ended — No Bids",
              message: `"${auction.title}" has ended with no bids received.`,
              auctionId: auction._id,
              auctionTitle: auction.title,
            });
          }

          // Notify seller that auction ended
          await createNotification({
            recipientId: auction.createdBy,
            recipientRole: "SELLER",
            type: "AUCTION_ENDED",
            title: "Your Auction Has Ended",
            message: auction.winner
              ? `"${auction.title}" ended. Winner: ${auction.winner.userName} (NPR ${Number(auction.winner.amount).toLocaleString()}).`
              : `"${auction.title}" ended with no bids.`,
            auctionId: auction._id,
            auctionTitle:  auction.title,
          });
        }

        /* Live Countdown */
        if (auction.status === "Live") {
          io.to(auction._id.toString()).emit("auctionCountdown", {
            auctionId: auction._id,
            endTime:   auction.endTime,
          });
        }

        /* Save & broadcast */
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