import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import auth from "./middlewares/auth.js";
import http from "http";
import { Server } from "socket.io";
import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import { auctionCron } from "./cron/auctionCron.js";
import authRoutes from "./routes/authRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

connectCloudinary();

const server = http.createServer(app);

// --- Create Socket.IO before routes ---
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io); // make io accessible in controllers

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/auctions",auth, auctionRoutes);
app.use("/api/bids",auth,  bidRoutes(io)); // pass io

app.get("/", (_req, res) => {
  res.json({ name: process.env.NAME, version: process.env.VERSION, message: "Server is running" });
});

// --- Socket connection ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`User joined auction room ${auctionId}`);
  });

  socket.on("leaveAuction", (auctionId) => {
    socket.leave(auctionId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// --- Start auction cron ---
auctionCron(io);

const PORT = process.env.PORT || 8000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`${process.env.NAME} running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

startServer();
