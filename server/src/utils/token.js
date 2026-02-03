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
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTgyMjFiZDZhYzEzNmVjODAyNzlkNjUiLCJuYW1lIjoiVGVzdDEiLCJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzcwMTM2MDA4LCJleHAiOjE3NzAyMjI0MDh9.s1gcfzSEum4x8Lq_0MpECzpzfC5M7cTg9yrr-aHFB-M