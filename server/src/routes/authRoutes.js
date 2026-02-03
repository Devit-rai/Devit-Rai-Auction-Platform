import express from "express";
import authController from "../controller/authController.js";
const router = express.Router();

// URL: /api/auth/signup
router.post("/signup", authController.signup);

// URL: /api/auth/login
router.post("/login", authController.login);

export default router;
