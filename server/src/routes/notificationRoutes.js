import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/NotificationController.js"; 
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.put("/read-all", auth, markAllAsRead);
router.put("/:id/read", auth, markAsRead);

export default router;