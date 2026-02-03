import authService from "../services/authServices.js";

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

    res.status(201).json({
      message: "User registered successfully",
      user
    });
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

    res.status(200).json({
      message: "Login successful",
      user
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};

export default { signup, login,};
