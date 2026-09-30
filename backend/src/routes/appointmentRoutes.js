const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  checkInAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Citizen routes
router.get("/my", protect, getMyAppointments);
router.post("/", protect, createAppointment);
router.post("/:id/check-in", protect, checkInAppointment);
router.put("/:id/cancel", protect, cancelAppointment);
router.patch("/:id/cancel", protect, cancelAppointment);
router.get("/:id", protect, getAppointmentById);

// Admin / officer view
router.get("/", protect, authorize("officer", "admin"), getAppointments);

module.exports = router;