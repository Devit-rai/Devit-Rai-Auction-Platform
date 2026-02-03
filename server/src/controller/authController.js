import authService from "../services/authServices.js";
import { createJWT } from "../utils/token.js";

const signup = async (req, res) => {
  try {
    const input = req.body;

    if (!input.password || !input.confirmPassword) {
      return res.status(400).json({ message: "Password and Confirm Password are required" });
    }

    if (input.password !== input.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await authService.signup(input);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const input = req.body;

    const user = await authService.login(input);
    const authToken = createJWT(user);

    // SET COOKIE
    res.cookie("authToken", authToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    //CLEAR COOKIE
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export default { signup, login, logout };
