import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists with this email", success: false });
  }
  // Hash the password here if needed (e.g., using bcryptjs)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
    });
    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // JWT token generation
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(201)
      .cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 3600000,
        path: "/",
        signed: true,
      })
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
  console.log("Login request received", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Fields are required: email, password",
      success: false,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid password", success: false });
    }

    // Generate JWT (still includes role if you want it in the token)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res
      .status(200)
      .cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 3600000,
        path: "/",
        signed: true,
      })
      .json({
        message: "Login successful",
        user: userWithoutPassword,
        success: true,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error, success: false });
  }
};

export const logoutUser = (req, res) => {
  res
    .status(200)
    .clearCookie("token", {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    })
    .json({ message: "Logout successful", success: true });
};
export const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(200).json({ user: userWithoutPassword, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user.id; // Assuming you have middleware to set req.user
  const { resume, fullname, email, phoneNumber, skills } = req.body;

  // Validate resume if needed

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    await user.save();

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.skills = skills || user.skills;
    // user resume will come here.


    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(200).json({
      message: "User profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.user.id; // Assuming you have middleware to set req.user
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    await user.deleteOne();
    res
      .status(200)
      .json({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
