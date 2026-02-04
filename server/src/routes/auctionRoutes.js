import express from "express";
import {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  getMyAuctionItems,
  removeFromAuction,
  republishItem,
} from "../controller/auctionController.js";

import auth from "../middlewares/auth.js";

const router = express.Router();

/* PUBLIC ROUTES */
router.get("/all", getAllItems);
router.get("/:id", getAuctionDetails);

/* PROTECTED ROUTES */
router.post("/new", auth, addNewAuctionItem);
router.get("/my", auth, getMyAuctionItems);
router.delete("/:id", auth, removeFromAuction);
router.put("/republish/:id", auth, republishItem);

export default router;
