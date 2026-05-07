import jwt from "jsonwebtoken";
import crypto from "crypto";

const createAccessToken = (userId, role = "user", name, tokenVersion) => {
  const payload = {
    sub: userId,
    role,
    name,
    tokenVersion,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};
const createRefreshToken = (userId, tokenVersion) => {
  const payload = {
    sub: userId,
    tokenVersion,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export { createAccessToken, createRefreshToken, verifyToken, hashToken };
