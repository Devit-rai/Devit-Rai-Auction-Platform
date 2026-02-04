import express from "express";
import auth from "../middlewares/auth.js";
import { placeBid } from "../controller/bidController.js";

const router = express.Router();

export default (io) => {
  router.post("/:id", auth, placeBid(io));
  return router;
};
