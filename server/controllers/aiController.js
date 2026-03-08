const Subject = require("../models/Subject");
const Topic = require("../models/Topic");

const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Please provide a message." });
    }

    // Heuristics: Analyze database context
    const subjects = await Subject.find({ userId });
    const topics = await Topic.find({ subjectId: { $in: subjects.map(s => s._id) } });

    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.completionStatus === 'completed').length;
    
    // Extract subject names for keyword matching
    const subjectMatches = subjects.filter(s => message.toLowerCase().includes(s.name.toLowerCase()));

    let aiResponse = "";

    if (subjectMatches.length > 0) {
        const targetSubject = subjectMatches[0];
        const targetTopics = topics.filter(t => t.subjectId.toString() === targetSubject._id.toString());
        const remainingTopics = targetTopics.filter(t => t.completionStatus !== 'completed');
        
        const daysLeft = targetSubject.examDate ? Math.max(1, Math.ceil((new Date(targetSubject.examDate) - new Date()) / (1000 * 60 * 60 * 24))) : 'unknown';

        aiResponse = `To prepare for **${targetSubject.name}**, you have ${remainingTopics.length} topics remaining out of ${targetTopics.length}. `;
        if (daysLeft !== 'unknown') {
            aiResponse += `Your exam is in ${daysLeft} days! `;
        }
        
        if (remainingTopics.length > 0) {
            const highPriority = remainingTopics.filter(t => t.priority === 'High' || t.difficulty === 'hard');
            if (highPriority.length > 0) {
                 aiResponse += `I strongly suggest starting with high-priority topics like: ${highPriority.map(t => t.name).join(', ')}. `;
            } else {
                 aiResponse += `I suggest starting with: ${remainingTopics[0].name}. `;
            }
        } else {
            aiResponse += `Great job! You have completed all topics for this subject. I recommend using the Pomodoro timer to review.`;
        }
    } else if (message.toLowerCase().includes("progress") || message.toLowerCase().includes("how am i doing")) {
         const percent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
         aiResponse = `You have completed ${percent}% of your total syllabus (${completedTopics} out of ${totalTopics} topics). Keep up the great work!`;
    } else {
         aiResponse = `I am your PrepGenius AI. I can analyze your study progress, tell you how to prepare for specific subjects like "${subjects[0]?.name || 'Math'}", and remind you of exam dates!`;
    }

    // Simulate network delay for "AI thinking"
    setTimeout(() => {
        res.status(200).json({
            success: true,
            data: { reply: aiResponse }
        });
    }, 1000);

  } catch (error) {
    console.error("AI Assistant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing AI query.",
    });
  }
};

module.exports = { chatWithAssistant };
