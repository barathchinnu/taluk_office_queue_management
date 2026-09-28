const express = require("express");

const router = express.Router();

const {
  getProfile,
  getMyAppointments,
  getMyToken,
  getCurrentQueue,
} = require("../controllers/citizenController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


// =====================================================
// CITIZEN PROFILE
// =====================================================
router.get(
  "/profile",
  protect,
  authorize("citizen"),
  getProfile
);


// =====================================================
// MY APPOINTMENTS
// =====================================================
router.get(
  "/appointments",
  protect,
  authorize("citizen"),
  getMyAppointments
);


// =====================================================
// MY ACTIVE TOKEN
// =====================================================
router.get(
  "/token",
  protect,
  authorize("citizen"),
  getMyToken
);


// =====================================================
// CURRENT QUEUE
// =====================================================
router.get(
  "/queue/:departmentId",
  protect,
  authorize("citizen", "officer", "admin"),
  getCurrentQueue
);


module.exports = router;