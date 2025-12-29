import authService from "../services/authServices.js";
import { createJWT } from "../utils/tokens.js";

const signup = async (req, res) => {
  const input = req.body;

  try {

    if (!input.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!input.confirmPassword) {
      return res.status(400).json({ message: "Confirm Password is required" });
    }

    if (input.password !== input.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await authService.signup(input);

    const authToken = createJWT(data);

    res.cookie("authToken", authToken, { maxAge: 900000 * 1000 });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const input = req.body;

  try {
    
    if (!input) {
      return res.status(400).json({ message: "Required fields are required" });
    }

    if (!input.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!input.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await authService.login(input);

    const authToken = createJWT(user);

    res.cookie("authToken", authToken, { maxAge: 900000 * 1000 });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const input = req.body;
  
  try{
    if (!input.email) {
      return res.status(400).json({ message: "Email is required" });
  }

  const data = await authService.forgotPassword(input.email);

  res.json(data);
} catch (error) {
  res.status(error.statusCode || 500).send({ message: error.message });
}
};

const ResetPassword = async (req, res) => {
  const input = req.body;
  const query = req.query;

  try {

     if (!query.token || !query.userId) {
      return res.status(400).json({ message: "Token and UserID are required." });
    }

    if (!input.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!input.confirmPassword) {
      return res.status(400).json({ message: "Confirm Password is required" });
    }

    if (input.password !== input.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await authService.ResetPassword(
      query.userId, 
      query.token, 
      input.password
    );

    res.status(201).json( data );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { signup, login, forgotPassword, ResetPassword };
