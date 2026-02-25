import express from "express";
import {
  addReview,
  getSellerReviews,
  deleteReview,
  canReview,
} from "../controllers/reviewController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Check if a user can review a seller
router.get("/:sellerId/can-review", auth, canReview);

// Get all reviews for a seller
router.get("/:sellerId", auth, getSellerReviews);

// Submit a review
router.post("/:sellerId", auth, addReview);

// Delete your own review
router.delete("/:reviewId", auth, deleteReview);

export default router;