const express = require("express");
const router = express.Router();
const {
  createCounter,
  getCounters,
  getCounterById,
  updateCounter,
  deleteCounter,
  assignOfficer,
  removeOfficer,
} = require("../controllers/counterController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public/Citizen/Officer view of counters
router.get("/", getCounters);
router.get("/:id", getCounterById);

// Admin counter management
router.post("/", protect, authorize("admin"), createCounter);
router.put("/:id", protect, authorize("admin"), updateCounter);
router.delete("/:id", protect, authorize("admin"), deleteCounter);
router.post("/:id/assign-officer", protect, authorize("admin"), assignOfficer);
router.post("/:id/remove-officer", protect, authorize("admin"), removeOfficer);

module.exports = router;