const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          dailyGoalHours: user.dailyGoalHours,
          currentStreak: user.currentStreak,
          lastStudyDate: user.lastStudyDate,
        },
        token,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Validation failed.",
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during signup.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          dailyGoalHours: user.dailyGoalHours,
          currentStreak: user.currentStreak,
          lastStudyDate: user.lastStudyDate,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          dailyGoalHours: user.dailyGoalHours,
          currentStreak: user.currentStreak,
          lastStudyDate: user.lastStudyDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching profile.",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, dailyGoalHours } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (dailyGoalHours !== undefined) user.dailyGoalHours = dailyGoalHours;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          dailyGoalHours: user.dailyGoalHours,
          currentStreak: user.currentStreak,
          lastStudyDate: user.lastStudyDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating profile.",
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getProfile,
  updateProfile,
};
