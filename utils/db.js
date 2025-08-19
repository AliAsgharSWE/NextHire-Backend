import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URI);
    // 🟢 MongoDB connected successfully
    console.log("🟢 MongoDB connected successfully");
  } catch (error) {
    // 🔴❌ MongoDB connection failed
    console.error("🔴 MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
