import express from "express";
import {
  getChatUsers,
  getMessages,
  sendMessage,
  getUnreadCount,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/users
router.get("/users", getChatUsers);

// GET /api/chat/messages/:userId
router.get("/messages/:userId", getMessages);

// POST /api/chat/send/:userId
router.post("/send/:userId", sendMessage);

// GET /api/chat/unread-count 
router.get("/unread-count", getUnreadCount);

export default router;