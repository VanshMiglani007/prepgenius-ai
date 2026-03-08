const Topic = require("../models/Topic");
const Subject = require("../models/Subject");
const Task = require("../models/Task");

const verifySubjectOwnership = async (subjectId, userId) => {
  const subject = await Subject.findOne({ _id: subjectId, userId });
  return subject;
};

const createTopic = async (req, res) => {
  try {
    const { subjectId, name, estimatedHours, difficulty, completionStatus } =
      req.body;
    const userId = req.user._id;

    if (!subjectId || !name) {
      return res.status(400).json({
        success: false,
        message: "Please provide subjectId and topic name.",
      });
    }

    const subject = await verifySubjectOwnership(subjectId, userId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const topic = await Topic.create({
      subjectId,
      name,
      estimatedHours: estimatedHours ?? 1,
      difficulty: difficulty ?? "medium",
      completionStatus: completionStatus ?? "not_started",
    });

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: { topic },
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
        message: "Invalid subject ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating topic.",
    });
  }
};

const getTopicsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user._id;

    const subject = await verifySubjectOwnership(subjectId, userId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const topics = await Topic.find({ subjectId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { topics },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error fetching topics.",
    });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, estimatedHours, difficulty, completionStatus } = req.body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const subject = await verifySubjectOwnership(topic.subjectId, userId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const previousStatus = topic.completionStatus;

    if (name !== undefined) topic.name = name;
    if (estimatedHours !== undefined) topic.estimatedHours = estimatedHours;
    if (difficulty !== undefined) topic.difficulty = difficulty;
    if (completionStatus !== undefined)
      topic.completionStatus = completionStatus;

    await topic.save();

    // Trigger Spaced Repetition if topic just got completed
    if (previousStatus !== "completed" && topic.completionStatus === "completed") {
      const today = new Date();
      const intervals = [1, 3, 7, 14];

      const revisionTasks = intervals.map((days) => {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + days);
        return {
          topicId: topic._id,
          subjectId: topic.subjectId,
          userId,
          scheduledDate,
          duration: 0.5, // 30 mins revision
          status: "pending",
        };
      });

      await Task.insertMany(revisionTasks);
    }

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: { topic },
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
        message: "Invalid topic ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating topic.",
    });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const subject = await verifySubjectOwnership(topic.subjectId, userId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    await Topic.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
      data: { id: topic._id },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error deleting topic.",
    });
  }
};

const getAllTopics = async (req, res) => {
  try {
    const userId = req.user._id;

    const subjects = await Subject.find({ userId });
    const subjectIds = subjects.map((s) => s._id);

    const topics = await Topic.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'name color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { topics },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching topics.",
    });
  }
};

module.exports = {
  createTopic,
  getTopicsBySubject,
  getAllTopics,
  updateTopic,
  deleteTopic,
};
