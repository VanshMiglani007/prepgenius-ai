const Subject = require("../models/Subject");

const createSubject = async (req, res) => {
  try {
    const { name, examDate, difficulty, color } = req.body;
    const userId = req.user._id;

    if (!name || !examDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and exam date.",
      });
    }

    const subject = await Subject.create({
      name,
      examDate,
      difficulty: difficulty || "medium",
      color: color || "#6366f1",
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: { subject },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Validation failed.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating subject.",
    });
  }
};

const getSubjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const subjects = await Subject.find({ userId }).sort({ examDate: 1 });

    res.status(200).json({
      success: true,
      data: { subjects },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching subjects.",
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, examDate, difficulty, color } = req.body;

    const subject = await Subject.findOne({ _id: id, userId });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    if (name !== undefined) subject.name = name;
    if (examDate !== undefined) subject.examDate = examDate;
    if (difficulty !== undefined) subject.difficulty = difficulty;
    if (color !== undefined) subject.color = color;

    await subject.save();

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: { subject },
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
      message: "Server error updating subject.",
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const subject = await Subject.findOneAndDelete({ _id: id, userId });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
      data: { id: subject._id },
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
      message: "Server error deleting subject.",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
};
