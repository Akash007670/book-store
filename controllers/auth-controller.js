import User from "../models/user.js";
import RefreshToken from "../models/refresh-token.js";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyToken,
} from "../lib/token.js";

const register = async (req, res) => {
  try {
    // step 1: get the payload from form data
    const { email, name, password, role } = req.body;

    // check if the user already exists
    const isUserAlreadyExists = await User.findOne({
      email: email,
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    };

    //Create new user
    const newUser = await User.create(payload);

    if (!newUser) {
      return res.status(400).json({ message: "Couldn't create new user" });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};
const login = async (req, res) => {
  try {
    // get email and password from the form
    const { email, password } = req.body;

    // check if the email exist for the login or not

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }

    // If user email is correct and is legitimate
    // then we'll verify the password.

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      return res.status(400).json({ message: "Incorrect Password!!! " });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.name,
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    // Save refresh token to DB
    await RefreshToken.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes for testing
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000, // 30 minutes for testing
    });

    return res.status(200).json({
      message: "Logged in succesfully",
      data: {
        accessToken: accessToken,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server error", error: error });
  }
};
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const tokenHash = hashToken(token);

      await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};

// Existing logic that supports
// ✅ Verifying refresh token
// ✅ Fetching user from DB
// ✅ Checking tokenVersion
// ✅ Issuing new access + refresh token
const refresh = async (req, res) => {
  try {
    // get the token from cookies we stored when we logged in.
    const token = req?.cookies?.refreshToken;

    // If no token found then give error
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // verify the token using jwt and get the result
    const payload = verifyToken(token);

    // find the user using the id we get from the vefified token payload

    const user = await User.findById(payload.sub); // payload.sub is the id of the user.

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    // once all checks passed, we'll create new access token and new refresh token as well.

    const newAccessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const newRefreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 5 minutes for testing
    });

    return res.status(200).json({
      message: "Token Refreshed Succesfully",
      data: {
        accessToken: newAccessToken,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Problems we need to fix in this version

// Old refresh tokens are still valid until expiry
// You cannot detect reuse (token theft)
// Rotation is meaningless because nothing invalidates the previous token

// 👉 Right now, this is equivalent to:
// “I keep issuing new refresh tokens, but I never invalidate old ones”

const refreshV2 = async (req, res) => {
  try {
    // Step 1. get the token from cooke
    const token = req?.cookies?.refreshToken;

    // Step 2: if token not found throw an error
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    // Step 3. validate/verify the token
    const payload = verifyToken(token);

    // Step 4. once the token is verified, we'll find the user using the id we get from payload.

    const user = await User.findById(payload.sub); // payload.sub contains the id of the user.

    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 5. if the token version is not same as payload token version means the token is invalidated.
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    // New Step 6. Hash the token
    const hash = hashToken(token);

    // Step 7. check if the token exists or not.

    const existingToken = await RefreshToken.findOne({ tokenHash: hash });

    if (!existingToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 🚨 reuse detection
    if (existingToken.revoked) {
      // token reuse detected → possible attack
      user.tokenVersion += 1;
      await user.save();

      return res.status(401).json({ message: "Token reuse detected" });
    }

    // rotate
    existingToken.revoked = true;
    await existingToken.save();

    const newRefreshToken = createRefreshToken(user.id, user.tokenVersion);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes for testing
    });

    const newAccessToken = createAccessToken(
      user.id,
      user.role,
      user.name,
      user.tokenVersion,
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000, // 30 minutes for testing
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    // Step 1. get the email
    const { oldPassword, newPassword } = req.body;

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Password can't be same as old one" });
    }

    // step 2. check if the email exists or not.

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(401).json({ message: "User not found!!" });
    }

    // step 3. compare the password stored in db

    const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatching) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // step 4. If password matches, hash the password again and save it.

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    user.password = newPasswordHash;

    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal serverl error" });
  }
};

export { register, login, logout, refresh, refreshV2, changePassword };
