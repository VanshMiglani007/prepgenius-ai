const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ─── Email transporter (Gmail) ───
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ─── SIGNUP ───
const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email and password." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email." });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: formatUser(user), token },
    });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
    if (error.code === 11000) return res.status(400).json({ success: false, message: "User already exists with this email." });
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
};

// ─── LOGIN ───
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please provide email and password." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    // Google-only accounts can't use password login
    if (user.googleId && !user.password) {
      return res.status(400).json({ success: false, message: "This account uses Google Sign-In. Please sign in with Google." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: "Login successful", data: { user: formatUser(user), token } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ─── GOOGLE SIGN-IN ───
const googleSignIn = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    if (!email || !googleId) return res.status(400).json({ success: false, message: "Missing Google credentials." });

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link Google to existing account
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user without password (Google-only)
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        avatar,
        password: crypto.randomBytes(32).toString("hex"), // random password for schema validation
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: "Google sign-in successful", data: { user: formatUser(user), token } });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ success: false, message: "Server error during Google sign-in." });
  }
};

// ─── FORGOT PASSWORD — Send OTP ───
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide your email." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({ success: true, message: "If this email is registered, you will receive an OTP." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await transporter.sendMail({
        from: `"PrepGenius" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Password Reset OTP — PrepGenius",
        html: `
          <div style="font-family: sans-serif; padding: 30px; max-width: 400px;">
            <h2 style="margin-bottom: 10px;">Reset Your Password</h2>
            <p style="color: #666; margin-bottom: 20px;">Use this code to reset your PrepGenius password. It expires in 10 minutes.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #222;">
              ${otp}
            </div>
            <p style="color: #999; margin-top: 20px; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Still return success to not reveal info
    }

    res.status(200).json({ success: true, message: "If this email is registered, you will receive an OTP." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── VERIFY OTP ───
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetOtp +resetOtpExpiry");
    if (!user) return res.status(400).json({ success: false, message: "Invalid request." });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── RESET PASSWORD ───
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "All fields are required." });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetOtp +resetOtpExpiry +password");
    if (!user || !user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid request." });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired." });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error resetting password." });
  }
};

// ─── PROFILE ───
const getProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: { user: formatUser(req.user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching profile." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, dailyGoalHours } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (dailyGoalHours !== undefined) user.dailyGoalHours = dailyGoalHours;
    await user.save();
    res.status(200).json({ success: true, message: "Profile updated", data: { user: formatUser(user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating profile." });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Please provide current and new password." });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect." });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error changing password." });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: "Please provide your password." });
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Password is incorrect." });
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error deleting account." });
  }
};

// ─── Helper ───
function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    dailyGoalHours: user.dailyGoalHours,
    currentStreak: user.currentStreak,
    lastStudyDate: user.lastStudyDate,
  };
}

module.exports = {
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
};
