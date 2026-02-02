import dotenv from "dotenv";
import { version } from "mongoose";

dotenv.config();

const config = {
  mongoDBUrl: process.env.MONGODB_URL || "",
  name: process.env.NAME || "Auction Platform",

  version: process.env.VERSION || "1.0.0",
  resendEmailApiKey: process.env.RESEND_EMAIL_API_KEY || "",
};

export default config;
