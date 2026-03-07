const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      required: true,
      min: 0.25,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "skipped"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1 });
taskSchema.index({ userId: 1, scheduledDate: 1 });

module.exports = mongoose.model("Task", taskSchema);
