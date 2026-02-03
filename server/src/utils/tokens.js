import jwt from "jsonwebtoken";
import config from "../config/config.js";

const createJWT = (user) => {
    const token = jwt.sign(user, config.jwtSecret, { expiresIn: '1d' });
    return token;
};
async function verifyJWT(authToken) {
  return await new Promise((resolve, reject) => {
    jwt.verify(authToken, config.jwtSecret, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}
export { createJWT, verifyJWT };