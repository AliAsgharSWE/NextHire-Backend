import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.patch("/profile/update", isAuthenticated, updateUserProfile);
router.delete("/profile/delete", isAuthenticated, deleteUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/refresh-token", refreshAccessToken);

export default router;
