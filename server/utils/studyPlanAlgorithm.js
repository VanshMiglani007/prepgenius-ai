const Subject = require("../models/Subject");
const Topic = require("../models/Topic");

const DIFFICULTY_WEIGHT = { easy: 1, medium: 2, hard: 3 };
const PRIORITY_WEIGHT = { Low: 1, Medium: 2, High: 3 };

/**
 * Calculate urgency based on days until exam.
 * Closer exam = higher urgency (max 30, min 1).
 */
const getUrgency = (examDate, referenceDate) => {
  const exam = new Date(examDate);
  const ref = new Date(referenceDate);
  exam.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);
  const daysUntilExam = Math.ceil((exam - ref) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(30, 31 - daysUntilExam));
};

/**
 * Generate a daily study schedule.
 * Algorithm: priorityScore = difficultyWeight × urgency
 * Sorts topics by priority and distributes across days based on hoursPerDay.
 *
 * @param {Object} options
 * @param {string} userId - User ID
 * @param {number} hoursPerDay - Available study hours per day
 * @param {string} [startDate] - Start date (ISO string), defaults to today
 * @param {boolean} [includeCompleted] - Include completed topics (default: false)
 * @returns {Promise<{schedule: Array, totalDays: number, totalHours: number}>}
 */
const generateStudyPlan = async (options) => {
  const { userId, hoursPerDay = 4, startDate, includeCompleted = false } = options;
  const refDate = startDate ? new Date(startDate) : new Date();
  refDate.setHours(0, 0, 0, 0);

  const subjects = await Subject.find({ userId }).sort({ examDate: 1 });
  const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

  const topics = await Topic.find({
    subjectId: { $in: subjects.map((s) => s._id) },
    ...(includeCompleted ? {} : { completionStatus: { $ne: "completed" } }),
  });

  const topicWithPriority = topics.map((topic) => {
    const subject = subjectMap.get(topic.subjectId.toString());
    const difficultyWeight = DIFFICULTY_WEIGHT[topic.difficulty] || 2;
    const priorityWeight = PRIORITY_WEIGHT[topic.priority] || 2;
    const urgency = subject ? getUrgency(subject.examDate, refDate) : 1;
    const priorityScore = difficultyWeight * urgency * priorityWeight;
    
    // Calculate actual remaining hours needed
    const remainingHours = Math.max(0, topic.estimatedHours - (topic.completedHours || 0));

    return {
      topicId: topic._id,
      topicName: topic.name,
      subjectId: subject?._id,
      subjectName: subject?.name,
      estimatedHours: remainingHours,
      totalEstimated: topic.estimatedHours,
      difficulty: topic.difficulty,
      examDate: subject?.examDate,
      priorityScore,
      urgency,
    };
  });

  topicWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);

  const schedule = [];
  let currentDate = new Date(refDate);
  let dayHours = 0;
  let dayItems = [];
  let totalHours = 0;

  for (const item of topicWithPriority) {
    let remaining = item.estimatedHours;
    while (remaining > 0) {
      const spaceLeft = hoursPerDay - dayHours;
      const toAdd = Math.min(remaining, spaceLeft);
      const duration = Math.round(toAdd * 100) / 100;

      if (toAdd > 0) {
        dayItems.push({
          topicId: item.topicId,
          topicName: item.topicName,
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          duration,
          difficulty: item.difficulty,
        });
        dayHours += toAdd;
        totalHours += toAdd;
        remaining -= toAdd;
      }

      if (dayHours >= hoursPerDay || remaining <= 0) {
        if (dayItems.length > 0) {
          schedule.push({
            date: currentDate.toISOString().split("T")[0],
            items: dayItems,
            totalHours: Math.round(dayHours * 100) / 100,
          });
          dayItems = [];
        }
        dayHours = 0;
        if (remaining > 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
  }

  if (dayItems.length > 0) {
    schedule.push({
      date: currentDate.toISOString().split("T")[0],
      items: dayItems,
      totalHours: Math.round(dayHours * 100) / 100,
    });
  }

  return {
    schedule,
    totalDays: schedule.length,
    totalHours: Math.round(totalHours * 100) / 100,
    startDate: refDate.toISOString().split("T")[0],
    hoursPerDay,
  };
};

module.exports = { generateStudyPlan };
