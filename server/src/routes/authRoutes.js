import express from "express";
import authController from "../controller/authController.js";

const router = express.Router();

// URL: /api/auth/signup
router.post("/signup", authController.signup);

// URL: /api/auth/login
router.post("/login", authController.login);

// URL: /api/auth/logout
router.post("/logout", authController.logout);

// URL: /api/auth/verify-email
router.post("/verify-email", authController.verifyEmail);

// URL: /api/auth/resend-otp
router.post("/resend-otp", authController.resendOtp);

export default router;
