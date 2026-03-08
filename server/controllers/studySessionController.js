const StudySession = require("../models/StudySession");
const Task = require("../models/Task");
const Topic = require("../models/Topic");
const User = require("../models/User");

// Helper to calculate difference in minutes
const calculateDurationInMinutes = (startTime, endTime) => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / 60000);
};

const startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId, topicId, subjectId, sessionType } = req.body;

    // Optional validation to ensure task belongs to user (if taskId provided)
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, userId });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found or doesn't belong to the user.",
        });
      }
    }

    const session = await StudySession.create({
      userId,
      taskId,
      topicId,
      subjectId,
      sessionType: sessionType || "focus",
    });

    res.status(201).json({
      success: true,
      message: "Study session started successfully",
      data: { session },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Validation failed.",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error starting session.",
    });
  }
};

const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await StudySession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (session.completed) {
      return res.status(400).json({
        success: false,
        message: "Session is already completed.",
      });
    }

    session.endTime = new Date();
    session.duration = calculateDurationInMinutes(session.startTime, session.endTime);
    session.completed = true;

    await session.save();

    // V2: Update Topic Progress and User Streaks
    if (session.topicId) {
      const topic = await Topic.findById(session.topicId);
      if (topic) {
        topic.completedHours += (session.duration / 60);
        if (topic.completedHours >= topic.estimatedHours && topic.completionStatus !== 'completed') {
            topic.completionStatus = 'in_progress';
        } else if (topic.completionStatus === 'not_started') {
            topic.completionStatus = 'in_progress';
        }
        await topic.save();
      }
    }

    const userObj = await User.findById(userId);
    if (userObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastStudy = userObj.lastStudyDate ? new Date(userObj.lastStudyDate) : null;
      if (lastStudy) lastStudy.setHours(0, 0, 0, 0);

      if (!lastStudy) {
        userObj.currentStreak = 1;
        userObj.lastStudyDate = new Date();
      } else {
        const diffTime = Math.abs(today - lastStudy);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          userObj.currentStreak += 1;
          userObj.lastStudyDate = new Date();
        } else if (diffDays > 1) {
          userObj.currentStreak = 1;
          userObj.lastStudyDate = new Date();
        }
      }
      await userObj.save();
    }

    res.status(200).json({
      success: true,
      message: "Study session completed successfully",
      data: { session },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error ending session.",
    });
  }
};

const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, type, completed } = req.query;

    const filter = { userId };
    
    // Apply filters if provided
    if (type) filter.sessionType = type;
    if (completed !== undefined) filter.completed = completed === 'true';
    
    // Date range filter
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const sessions = await StudySession.find(filter)
      .populate("taskId", "duration status scheduledDate")
      .populate("topicId", "name difficulty")
      .populate("subjectId", "name color")
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      data: { 
          count: sessions.length,
          sessions 
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching sessions.",
    });
  }
};

const updateSession = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { duration, completed } = req.body;
      
      const session = await StudySession.findOne({ _id: id, userId });
      
      if (!session) {
          return res.status(404).json({
            success: false,
            message: "Session not found.",
          });
      }
      
      if (duration !== undefined) session.duration = Number(duration);
      if (completed !== undefined) session.completed = completed;
      
      await session.save();
      
      res.status(200).json({
          success: true,
          message: "Session updated successfully.",
          data: { session }
      });
      
    } catch (error) {
        if (error.name === "CastError") {
          return res.status(400).json({
            success: false,
            message: "Invalid session ID.",
          });
        }
        res.status(500).json({
          success: false,
          message: "Server error updating session.",
        });
    }
}

const deleteSession = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const session = await StudySession.findOneAndDelete({ _id: id, userId });
      
      if (!session) {
          return res.status(404).json({
            success: false,
            message: "Session not found.",
          });
      }
      
      res.status(200).json({
          success: true,
          message: "Session deleted successfully.",
          data: { id: session._id }
      });
      
    } catch (error) {
        if (error.name === "CastError") {
          return res.status(400).json({
            success: false,
            message: "Invalid session ID.",
          });
        }
        res.status(500).json({
          success: false,
          message: "Server error deleting session.",
        });
    }
}

module.exports = {
  startSession,
  endSession,
  getSessions,
  updateSession,
  deleteSession
};
