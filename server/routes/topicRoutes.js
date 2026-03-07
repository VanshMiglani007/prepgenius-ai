const express = require("express");
const router = express.Router();
const {
  createTopic,
  getTopicsBySubject,
  getAllTopics,
  updateTopic,
  deleteTopic,
} = require("../controllers/topicController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createTopic);
router.get("/", getAllTopics);
router.get("/:subjectId", getTopicsBySubject);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

module.exports = router;
