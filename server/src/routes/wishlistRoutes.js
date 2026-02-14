import express from "express";
import auth from "../middlewares/auth.js";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controller/wishlistController.js";

const router = express.Router();

router.post("/:id", auth, addToWishlist);
router.get("/", auth, getWishlist);
router.delete("/:id", auth, removeFromWishlist);

export default router;
