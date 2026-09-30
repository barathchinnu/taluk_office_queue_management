const express = require("express");
const router = express.Router();
const {
  createOfficer,
  getOfficerProfile,
  getOfficerDashboard,
  getOfficerQueue,
  getCurrentToken,
  updateAvailability,
  getAllOfficers,
} = require("../controllers/officerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Officer routes
router.get("/profile", protect, authorize("officer", "admin"), getOfficerProfile);
router.get("/dashboard", protect, authorize("officer", "admin"), getOfficerDashboard);
router.get("/queue", protect, authorize("officer", "admin"), getOfficerQueue);
router.get("/current-token", protect, authorize("officer", "admin"), getCurrentToken);
router.post("/availability", protect, authorize("officer", "admin"), updateAvailability);

// Admin / management routes
router.post("/", protect, authorize("officer", "admin"), createOfficer);
router.get("/", protect, authorize("officer", "admin"), getAllOfficers);

module.exports = router;