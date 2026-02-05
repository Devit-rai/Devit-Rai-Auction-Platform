import dotenv from "dotenv";

dotenv.config();

const config = {
  appURl: process.env.APP_URL || "",
  port: process.env.PORT || 5000,
  mongoDBUrl: process.env.MONGODB_URL || "",
  name: process.env.NAME || "Auction Platform",
  version: process.env.VERSION || "1.0.0",
  jwtSecret: process.env.JWT_SECRET || "",
    cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  
  smtp_mail: process.env.SMTP_MAIL || "",
  smtp_password: process.env.SMTP_PASSWORD || "",
}

export default config;
