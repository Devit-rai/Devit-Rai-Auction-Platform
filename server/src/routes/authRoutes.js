import express from "express";
import authController from "../controllers/authController.js";
import auth from "../middlewares/auth.js";

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

// URL: /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// URL: /api/auth/reset-password
router.post("/reset-password", authController.resetPassword);

router.get ("/profile", auth, authController.getProfile);
router.put ("/profile", auth, authController.updateProfile);
router.get("/seller/:id", auth, authController.getSellerProfile);

export default router;
