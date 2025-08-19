import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import {
  createUser,
  findUserByEmail,
  validatePassword,
} from "../services/user.service.js";
import User from "../models/user.model.js";
import { refreshCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { fullname, email, password, phoneNumber, role } = req.body;

  if (!fullname || !email || !password || !phoneNumber || !role) {
    return res.status(400).json({
      message:
        "Fields are required: fullname, email, password, phoneNumber, role",
      success: false,
    });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists with this email" });
  }

  try {
    // createUser must hash password inside
    const user = await createUser({
      fullname,
      email,
      password,
      phoneNumber,
      role,
    });


    // Generate tokens
    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    // Save refresh token in DB
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token in secure cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    const { password: _, refreshTokens, ...userWithoutSensitive } = user._doc;


    return res.status(201).json({
      message: "User registered successfully",
      user: userWithoutSensitive,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await validatePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const payload = { id: user._id, role: user.role };

    // Generate tokens using correct env variables
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    const { password: _, refreshTokens, ...userWithoutSensitive } = user._doc;


    // Set secure refresh token cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: userWithoutSensitive,
      accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};


export const logoutUser = async (req, res) => {
  try {
    const token = req.signedCookies?.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
      }
    }

    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out", error });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const oldToken = req.signedCookies?.refreshToken;
    if (!oldToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No refresh token" });
    }

    jwt.verify(
      oldToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err)
          return res
            .status(403)
            .json({ message: "Forbidden: Invalid refresh token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 🔹 CASE 1: Token exists → rotate normally
        if (user.refreshTokens.includes(oldToken)) {
          // Remove old token
          user.refreshTokens = user.refreshTokens.filter((t) => t !== oldToken);

          // Generate new tokens
          const payload = { id: user._id, role: user.role };
          const accessToken = generateAccessToken(payload);
          const newRefreshToken = generateRefreshToken(payload);

          user.refreshTokens.push(newRefreshToken);
          await user.save();

          res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
          return res.status(200).json({ accessToken });
        }

        // 🔹 CASE 2: Token reuse detected (stolen token was used)

        // Revoke ALL refresh tokens for that user
        user.refreshTokens = [];
        await user.save();

        res.clearCookie("refreshToken", refreshCookieOptions);
        return res.status(403).json({
          message: "Forbidden: Token reuse detected, logged out everywhere",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Error refreshing token", error });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullname, email, phoneNumber, skills } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.skills = skills || user.skills;

    await user.save();
    const { password: _, refreshTokens, ...userWithoutSensitive } = user._doc;


    res
      .status(200)
      .json({ message: "Profile updated", user: userWithoutSensitive });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
