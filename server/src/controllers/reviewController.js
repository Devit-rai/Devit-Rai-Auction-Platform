import mongoose from "mongoose";
import { Review } from "../models/Review.js";

export const addReview = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviewerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    if (sellerId === reviewerId.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existing = await Review.findOne({ seller: sellerId, reviewer: reviewerId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this seller" });
    }

    const review = await Review.create({
      seller: sellerId,
      reviewer: reviewerId,
      rating,
      comment,
    });

    const populated = await review.populate("reviewer", "name email profileImage");

    res.status(201).json({ message: "Review submitted successfully", review: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    const reviews = await Review.find({ seller: sellerId })
      .populate("reviewer", "name email profileImage createdAt")
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : 0;

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percent:
        total > 0
          ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100)
          : 0,
    }));

    res.status(200).json({ reviews, total, avgRating: Number(avgRating), breakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const canReview = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviewerId = req.user._id;

    // Can't review yourself
    if (sellerId === reviewerId.toString()) {
      return res.status(200).json({ canReview: false, reason: "own_profile" });
    }

    // Already reviewed
    const existing = await Review.findOne({ seller: sellerId, reviewer: reviewerId });
    if (existing) {
      return res.status(200).json({ canReview: false, reason: "already_reviewed", reviewId: existing._id });
    }

    // Any other logged-in user can review
    res.status(200).json({ canReview: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};