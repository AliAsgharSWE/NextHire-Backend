import { generateToken } from "../utils/token.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import {
  createUser,
  findUserByEmail,
  validatePassword,
} from "../services/user.service.js";
import User from "../models/user.model.js";

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
    const user = await createUser({
      fullname,
      email,
      password,
      phoneNumber,
      role,
    });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const token = generateToken({ id: user._id, role: user.role });

    res
      .status(201)
      .cookie("token", token, { ...cookieOptions, maxAge: 3600000 })
      .json({
        message: "User registered successfully",
        user: userWithoutPassword,
        token,
      });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
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

    const token = generateToken({ id: user._id, role: user.role });

    const { password: _, ...userWithoutPassword } = user._doc;

    res
      .status(200)
      .cookie("token", token, { ...cookieOptions, maxAge: 3600000 })
      .json({ message: "Login successful", user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const logoutUser = (req, res) => {
  res
    .clearCookie("token", cookieOptions)
    .status(200)
    .json({ message: "Logout successful" });
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
    const { password: _, ...userWithoutPassword } = user._doc;

    res
      .status(200)
      .json({ message: "Profile updated", user: userWithoutPassword });
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
