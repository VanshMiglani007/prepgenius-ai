const Task = require("../models/Task");
const Subject = require("../models/Subject");
const { generateStudyPlan } = require("../utils/studyPlanAlgorithm");

const verifySubjectOwnership = async (subjectId, userId) => {
  const subject = await Subject.findOne({ _id: subjectId, userId });
  return subject;
};

const createTask = async (req, res) => {
  try {
    const { topicId, subjectId, scheduledDate, duration, status } = req.body;
    const userId = req.user._id;

    if (!topicId || !subjectId || !scheduledDate || duration === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide topicId, subjectId, scheduledDate, and duration.",
      });
    }

    const subject = await verifySubjectOwnership(subjectId, userId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    const task = await Task.create({
      topicId,
      subjectId,
      userId,
      scheduledDate: new Date(scheduledDate),
      duration: Number(duration) || 1,
      status: status || "pending",
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
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
        message: "Invalid ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating task.",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledDate = {};
      if (from) filter.scheduledDate.$gte = new Date(from);
      if (to) filter.scheduledDate.$lte = new Date(to);
    }

    const tasks = await Task.find(filter)
      .populate("topicId", "name difficulty estimatedHours")
      .populate("subjectId", "name color examDate")
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching tasks.",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { scheduledDate, duration, status } = req.body;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (scheduledDate !== undefined) task.scheduledDate = new Date(scheduledDate);
    if (duration !== undefined) task.duration = Number(duration);
    if (status !== undefined) task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task },
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
        message: "Invalid task ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating task.",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: { id: task._id },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error deleting task.",
    });
  }
};

const createTasksFromPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hoursPerDay = 4, startDate } = req.body;

    const plan = await generateStudyPlan({
      userId,
      hoursPerDay: Number(hoursPerDay) || 4,
      startDate,
      includeCompleted: false,
    });

    const tasksToCreate = [];
    for (const day of plan.schedule) {
      for (const item of day.items) {
        tasksToCreate.push({
          topicId: item.topicId,
          subjectId: item.subjectId,
          userId,
          scheduledDate: new Date(day.date),
          duration: item.duration,
          status: "pending",
        });
      }
    }

    const tasks = await Task.insertMany(tasksToCreate);

    res.status(201).json({
      success: true,
      message: `${tasks.length} tasks created from study plan`,
      data: { tasks, totalDays: plan.totalDays },
    });
  } catch (error) {
    console.error("Create tasks from plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating tasks from study plan.",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createTasksFromPlan,
};
