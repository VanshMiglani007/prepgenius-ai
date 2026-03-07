const express = require("express");
const router = express.Router();
const {
  startSession,
  endSession,
  getSessions,
  updateSession,
  deleteSession
} = require("../controllers/studySessionController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.post("/start", startSession);
router.get("/", getSessions);

router
  .route("/:id")
  .put(updateSession)
  .delete(deleteSession);

router.put("/:id/end", endSession);

module.exports = router;
