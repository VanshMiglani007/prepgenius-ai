const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from client
app.use(express.static(path.join(__dirname, "../client")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const topicRoutes = require("./routes/topicRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const taskRoutes = require("./routes/taskRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sessions", studySessionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/assistant", aiRoutes);

// SPA fallback - serve index.html for client routes (Express 5 uses /{*path} for catch-all)
app.get("/{*path}", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
