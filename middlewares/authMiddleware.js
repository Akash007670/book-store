import { verifyToken } from "../lib/token.js";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "You're not authenticated" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);

    const user = await User.findById(payload.sub); // finding user by its id.

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Please try again!!" });
    }

    // Important step: Inavalidate the token if the token version doesn't match.
    // Means someone has old access token or old refresh token which he might use to create a new access token
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token Invalidated" });
    }

    // attaching user details

    const authReq = req;

    authReq.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};
