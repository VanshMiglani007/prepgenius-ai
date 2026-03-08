const Analytics = require("../models/Analytics");
const StudySession = require("../models/StudySession");
const Topic = require("../models/Topic");
const Subject = require("../models/Subject");
const User = require("../models/User");

// Get comprehensive dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch subjects owned by the user
    const subjects = await Subject.find({ userId });
    const subjectIds = subjects.map((s) => s._id);

    // 2. Fetch topics in those subjects and compute overall completion
    const topics = await Topic.find({ subjectId: { $in: subjectIds } });
    const totalTopics = topics.length;
    const completedTopics = topics.filter(
      (t) => t.completionStatus === "completed"
    ).length;

    // 3. Detailed subject-by-subject progress percentage
    const subjectProgress = subjects.map((sub) => {
      const subTopics = topics.filter(
        (t) => t.subjectId.toString() === sub._id.toString()
      );
      const subCompleted = subTopics.filter(
        (t) => t.completionStatus === "completed"
      ).length;
      return {
        subjectId: sub._id,
        name: sub.name,
        color: sub.color,
        progress:
          subTopics.length === 0
            ? 0
            : Math.round((subCompleted / subTopics.length) * 100),
      };
    });

    // 4. Calculate today's study duration from focus sessions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysSessions = await StudySession.find({
      userId,
      completed: true,
      sessionType: "focus",
      startTime: { $gte: startOfDay },
    });

    const todaysMinutes = todaysSessions.reduce(
      (acc, curr) => acc + (curr.duration || 0),
      0
    );
    // Round to 2 decimal places
    const dailyStudyHours = +(todaysMinutes / 60).toFixed(2);

    // 5. Calculate productivity score 
    // Logic: 120 minutes of focus time equals 100 score (capped at 100%)
    const productivityScore = Math.min(
      Math.round((todaysMinutes / 120) * 100),
      100
    );

    // 6. Upsert the analytics record for today to cache values in the DB
    await Analytics.findOneAndUpdate(
      { userId, date: startOfDay },
      {
        dailyStudyHours,
        topicsCompleted: completedTopics,
        productivityScore,
      },
      { upsert: true, new: true }
    );

    // Deliver unified payload to the frontend dashboard
    res.status(200).json({
      success: true,
      data: {
        dailyStudyHours,
        topicsCompleted: completedTopics,
        totalTopics,
        overallProgress:
          totalTopics === 0
            ? 0
            : Math.round((completedTopics / totalTopics) * 100),
        productivityScore,
        subjectProgress,
        dailyGoalHours: req.user.dailyGoalHours || 5, // Default to 5 if not set
        currentStreak: req.user.currentStreak || 0,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard analytics.",
    });
  }
};

// Fetch historical analytics for charting
const getDailyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    // Returns the last 7 days of analytics, sorted chronologically for graphs
    const records = await Analytics.find({ userId })
      .sort({ date: 1 })
      .limit(90);

    res.status(200).json({
      success: true,
      data: { analytics: records },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching daily analytics history.",
    });
  }
};

module.exports = {
  getDashboardStats,
  getDailyAnalytics,
};
