import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./middlewares/auth.js";
import http from "http";
import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import { auctionCron } from "./cron/auctionCron.js";
import { initSocket } from "./utils/socket.js";
import authRoutes from "./routes/authRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

connectCloudinary();

const server = http.createServer(app);

// Initialize socket and attach to app
const io = initSocket(server);
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auth, auctionRoutes);
app.use("/api/bids", auth, bidRoutes(io));
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", auth, reviewRoutes);

app.get("/", (_req, res) => {
  res.json({ name: process.env.NAME, version: process.env.VERSION, message: "Server is running" });
});

// Start auction cron
auctionCron();

const PORT = process.env.PORT || 8000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(`${process.env.NAME} running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

startServer();