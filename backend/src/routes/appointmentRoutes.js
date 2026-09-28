const express = require("express");

const router = express.Router();

const {
  createAppointment,
  getAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);

router.get("/", getAppointments);

router.patch("/:id/cancel", cancelAppointment);

module.exports = router;