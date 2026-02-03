import User from "../models/User.js";
import bcrypt from "bcryptjs";

const signup = async (data) => {
  const user = await User.findOne({ email: data.email });

  if (user) throw { statusCode: 409, message: "User already exists" };

  const hashedPassword = bcrypt.hashSync(data.password);

  const signupUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
  });

  return {
    _id: signupUser._id,
    name: signupUser.name,
    email: signupUser.email,
    roles: signupUser.roles,
  };
};

const login = async (data) => {
  const user = await User.findOne({ email: data.email });

  if (!user) throw { statusCode: 404, message: "User not found" };

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

export default { signup, login,};
