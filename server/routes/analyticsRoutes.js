const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDailyAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

// Ensure all analytics routes require authentication
router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/daily", getDailyAnalytics);

module.exports = router;
