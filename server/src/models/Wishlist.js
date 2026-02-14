import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auctionItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
  },
  { timestamps: true }
);

/* Prevent duplicate items */
wishlistSchema.index({ user: 1, auctionItem: 1 }, { unique: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
