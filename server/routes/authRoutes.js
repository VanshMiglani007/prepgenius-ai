const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  googleSignIn,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/google", googleSignIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Protected
router.get("/profile", protect, getProfile);
router.post("/update-profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);
router.post("/delete-account", protect, deleteAccount);

module.exports = router;
