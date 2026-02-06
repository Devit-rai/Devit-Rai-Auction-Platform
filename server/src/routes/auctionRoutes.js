import express from "express";
import {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  removeFromAuction,
  republishItem,
} from "../controller/auctionController.js";

import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { SELLER } from "../constants/roles.js";

const router = express.Router();

router.get("/all", auth, getAllItems);
router.get("/:id",auth, getAuctionDetails);

router.post("/new", auth, roleBasedAuth(SELLER), addNewAuctionItem);
router.delete("/:id", auth, removeFromAuction);
router.put("/republish/:id", auth, republishItem);

export default router;
