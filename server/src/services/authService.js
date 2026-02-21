import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/otp.js";
import { sendVerificationCode } from "./emailService.js";
import { USER, ADMIN, SELLER } from "../constants/roles.js";

const OTP_EXPIRY_MINUTES = 15; // 15 minutes expiry

// Signup → create user & send verification code
const signup = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw { statusCode: 409, message: "User already exists" };

  const hashedPassword = bcrypt.hashSync(data.password, 10);

  let selectedRole = USER;

  if (data.role === SELLER) {
    selectedRole = SELLER;
  }

  if (data.role === ADMIN) {
    throw { statusCode: 403, message: "Admin cannot be self assigned" };
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpiryTime =
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  const signupUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    roles: [selectedRole],
    isVerified: false,
    verificationCode,
    verificationCodeExpiryTime,
  });

  await sendVerificationCode(signupUser.email, verificationCode);

  return {
    _id: signupUser._id,
    name: signupUser.name,
    email: signupUser.email,
    phone: signupUser.phone,
    roles: signupUser.roles,
    message: "User created. Check your email for verification code",
  };
};

// Verify email OTP
const verifyEmail = async (email, code) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (user.isVerified)
    throw { statusCode: 400, message: "User already verified" };

  if (!user.verificationCode)
    throw { statusCode: 400, message: "Verification code missing" };

  if (user.verificationCodeExpiryTime < Date.now())
    throw { statusCode: 400, message: "Verification code expired" };

  if (user.verificationCode.toString().trim() !== code.toString().trim())
    throw { statusCode: 400, message: "Invalid verification code" };

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiryTime = null;
  await user.save();

  return { message: "Email verified successfully" };
};

// Resend OTP
const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (user.isVerified)
    throw { statusCode: 400, message: "User already verified" };

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  user.verificationCodeExpiryTime = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  await user.save();

  await sendVerificationCode(user.email, verificationCode);

  return { message: "Verification code resent successfully" };
};

// Login
const login = async (data) => {
  const user = await User.findOne({ email: data.email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (!user.isVerified)
    throw {
      statusCode: 401,
      message: "Please verify your email before logging in",
    };
  if (user.status === "Suspended") {
  throw { statusCode: 403, message: "Account is suspended" };
  }

  if (user.status === "Banned") {
    throw { statusCode: 403, message: "Account is banned" };
  }

  const isMatch = bcrypt.compareSync(data.password, user.password);
  if (!isMatch) throw { statusCode: 401, message: "Invalid email or password" };

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
  };
  
};

// Forgot Password → Send Reset OTP
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };

  const resetCode = generateVerificationCode();
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiryTime =
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  await user.save();

  await sendVerificationCode(user.email, resetCode);

  return { message: "Reset password OTP sent to email" };
};

// Reset Password → Verify OTP & Update Password
const resetPassword = async (email, code, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };

  if (!user.resetPasswordCode)
    throw { statusCode: 400, message: "Reset code missing" };

  if (user.resetPasswordExpiryTime < Date.now())
    throw { statusCode: 400, message: "Reset code expired" };

  if (user.resetPasswordCode.toString().trim() !== code.toString().trim())
    throw { statusCode: 400, message: "Invalid reset code" };

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordCode = null;
  user.resetPasswordExpiryTime = null;

  await user.save();

  return { message: "Password reset successfully" };
};

export default { signup, verifyEmail, login, resendOtp, forgotPassword, resetPassword };
