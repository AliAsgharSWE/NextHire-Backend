import jwt from "jsonwebtoken";

export const generateAccessToken = (payload, expiresIn = "15m") => {
  if (!process.env.ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is missing");
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload, expiresIn = "7d") => {
  if (!process.env.REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is missing");
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
