const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // Stored in minutes
      default: 0,
    },
    sessionType: {
      type: String,
      enum: ["focus", "break"],
      default: "focus",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up analytical queries
studySessionSchema.index({ userId: 1, startTime: -1 });
studySessionSchema.index({ userId: 1, completed: 1, sessionType: 1 });

module.exports = mongoose.model("StudySession", studySessionSchema);
