import express from "express";
import {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  removeFromAuction,
  updateAuctionItem,
  republishItem
} from "../controllers/auctionController.js";

import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { SELLER } from "../constants/roles.js";

const router = express.Router();

router.get("/all", auth, getAllItems);
router.get("/:id",auth, getAuctionDetails);

router.post("/new", auth, roleBasedAuth(SELLER), addNewAuctionItem);
router.delete("/:id", auth, roleBasedAuth(SELLER), removeFromAuction);
router.put("/:id", auth, roleBasedAuth(SELLER), updateAuctionItem);
router.put("/republish/:id", auth, republishItem);

export default router;
