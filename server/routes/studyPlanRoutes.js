const express = require("express");
const router = express.Router();
const { createStudyPlan } = require("../controllers/studyPlanController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/generate", createStudyPlan);

module.exports = router;
