import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  category: { type: String, required: true },
  condition: { type: String, enum: ["New", "Used"], required: true },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  status: { type: String, enum: ["Upcoming", "Live", "Ended"], default: "Upcoming" },
  isProcessed: { type: Boolean, default: false },

  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  bids: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      profileImage: String,
      amount: Number,
    },
  ],
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isProcessed: {
    type: Boolean,
    default: false,
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Auction = mongoose.model("Auction", auctionSchema);
