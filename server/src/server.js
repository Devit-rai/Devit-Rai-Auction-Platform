import express from "express"
import dotenv from "dotenv";
import { connectDB }from './config/db.js';

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: process.env.NAME,
    version: process.env.VERSION,
    message: "Server is running",
  });
});

const PORT = process.env.PORT || 5000;

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


