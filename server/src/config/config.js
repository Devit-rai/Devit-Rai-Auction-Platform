import dotenv from "dotenv";

dotenv.config();

const config = {
  appURl: process.env.APP_URL || "",
  port: process.env.PORT || 5000,
  mongoDBUrl: process.env.MONGODB_URL || "",
  name: process.env.NAME || "Auction Platform",
  version: process.env.VERSION || "1.0.0",
  jwtSecret: process.env.JWT_SECRET || "",
  
}

export default config;
