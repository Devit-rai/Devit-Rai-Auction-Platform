import express from "express";
import authController from "../controller/authController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// URL: /api/auth/signup
router.post("/signup", authController.signup);

// URL: /api/auth/login
router.post("/login", authController.login);

// URL: /api/auth/logout
router.post("/logout", auth, authController.logout);

export default router;
