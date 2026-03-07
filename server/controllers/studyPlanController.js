const { generateStudyPlan } = require("../utils/studyPlanAlgorithm");

const createStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const raw = req.body || {};
    const hoursPerDay = Number(raw.hoursPerDay) || 4;
    const { startDate, includeCompleted = false } = raw;

    if (hoursPerDay < 0.5 || hoursPerDay > 24) {
      return res.status(400).json({
        success: false,
        message: "Please provide hoursPerDay between 0.5 and 24.",
      });
    }

    const result = await generateStudyPlan({
      userId,
      hoursPerDay,
      startDate,
      includeCompleted: !!includeCompleted,
    });

    res.status(200).json({
      success: true,
      message: "Study plan generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Study plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating study plan.",
    });
  }
};

module.exports = { createStudyPlan };
