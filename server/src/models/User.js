import mongoose from "mongoose";
import { ADMIN, USER, SELLER } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  roles: {
    type: [String],
    default: [USER],
    enum: [USER, ADMIN, SELLER],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: { 
    type: String 
  },
  verificationCodeExpiryTime: { 
    type: Number 
  },
  resetPasswordCode: { 
    type: String 
  },
  resetPasswordExpiryTime: { 
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  status: {
  type: String,
  enum: ["Active", "Suspended", "Banned"],
  default: "Active",
},
});

const User = mongoose.model("User", userSchema);
export default User;
