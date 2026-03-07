const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dailyStudyHours: {
      type: Number,
      default: 0,
    },
    topicsCompleted: {
      type: Number,
      default: 0,
    },
    productivityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one analytics record per user per day
analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
