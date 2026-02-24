import express from "express";
import auth from "../middlewares/auth.js";
import { placeBid } from "../controllers/bidController.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import { USER } from "../constants/roles.js";

const router = express.Router();

export default (io) => {
  router.post("/:id", auth,roleBasedAuth(USER), placeBid(io));
  return router;
};
