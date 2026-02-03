import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB }from './config/db.js';
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: process.env.NAME,
    version: process.env.VERSION,
    message: "Server is running",
  });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `${process.env.NAME} is running on http://localhost:${PORT} [${process.env.NODE_ENV}]`
      );
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

startServer();


