const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

    const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "dummy_key");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build context
    let dbContext = `The user is preparing for the following subjects: ${subjects.map(s => s.name).join(', ')}. `;
    if (totalTopics > 0) {
       dbContext += `Out of ${totalTopics} total topics, they have mastered ${completedTopics}. `;
    }
    
    // Check specific subjects
    if (subjectMatches.length > 0) {
      const targetSubject = subjectMatches[0];
      const targetTopics = topics.filter(t => t.subjectId.toString() === targetSubject._id.toString());
      const remainingTopics = targetTopics.filter(t => t.completionStatus !== 'completed');
      const daysLeft = targetSubject.examDate ? Math.max(1, Math.ceil((new Date(targetSubject.examDate) - new Date()) / (1000 * 60 * 60 * 24))) : 'unknown';

      dbContext += `They asked about ${targetSubject.name}. It has ${remainingTopics.length} remaining topics. Exam is in ${daysLeft} days. `;
      if (remainingTopics.length > 0) {
         dbContext += `High priority topics to review: ${remainingTopics.slice(0, 3).map(t => t.name).join(', ')}. `;
      }
    }

    const prompt = `You are the "PrepGenius AI", an expert multi-agent study assistant in a modern web app. Keep your answer VERY CONCISE, under 3 sentences unless asked for a detailed list. Use friendly, motivational tone.
Database Context: ${dbContext}
User Question: "${message}"`;

    let aiResponse = "";
    
    try {
      if (!process.env.AI_API_KEY) {
        throw new Error("No AI_API_KEY configured.");
      }
      const result = await model.generateContent(prompt);
      const response = await result.response;
      aiResponse = response.text();
    } catch (apiErr) {
      // Fallback if no real API key or quota exceeded
      aiResponse = "I'm currently running in offline mode. Make sure to add `AI_API_KEY` to your backend `.env` file to unlock my full brain! As a tip, try reviewing your high-priority topics first.";
      console.warn("AI fallback used because:", apiErr.message);
    }

    res.status(200).json({
      success: true,
      data: { response: aiResponse }
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing AI query.",
    });
  }
};

module.exports = { chatWithAssistant };
