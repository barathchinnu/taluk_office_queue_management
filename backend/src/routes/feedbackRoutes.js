const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getMyFeedback,
  getFeedbackAnalytics,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", submitFeedback);
router.get("/my", getMyFeedback);
router.get("/analytics", authorize("admin"), getFeedbackAnalytics);

module.exports = router;
