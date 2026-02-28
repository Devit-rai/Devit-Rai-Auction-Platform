import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientRole: {
    type: String,
    enum: ["ADMIN", "SELLER", "USER"],
    required: true,
  },
  type: {
    type: String,
    enum: [
      "NEW_AUCTION",
      "AUCTION_APPROVED",
      "AUCTION_REJECTED",
      "AUCTION_LIVE",
      "AUCTION_ENDED", 
      "NEW_BID",
      "AUTO_REJECTED",
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
  auctionTitle: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);