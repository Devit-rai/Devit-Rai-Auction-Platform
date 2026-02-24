import express from "express";
import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { ADMIN } from "../constants/roles.js";
import {
  getAllUsers,
  updateUserStatus,
  getAllAuctions,
  updateAuctionApproval,
  forceCloseAuction,
} from "../controllers/adminController.js";

const router = express.Router();

/* Protect all admin routes */
router.use(auth, roleBasedAuth(ADMIN));

/* User Management */
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);

/* Auction Management */
router.get("/auctions", getAllAuctions);
router.put("/auctions/:id/approval", updateAuctionApproval);
router.put("/auctions/:id/force-close", forceCloseAuction);

export default router;