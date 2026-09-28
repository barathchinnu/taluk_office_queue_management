const express = require("express");

const router = express.Router();

const {
  createOfficer,
  getOfficerProfile,
  getOfficerDashboard,
  getOfficerQueue,
} = require("../controllers/officerController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  authorize("officer", "admin"),
  createOfficer
);

router.get(
  "/profile",
  protect,
  authorize("officer"),
  getOfficerProfile
);

router.get(
  "/dashboard",
  protect,
  authorize("officer"),
  getOfficerDashboard
);

router.get(
  "/queue",
  protect,
  authorize("officer"),
  getOfficerQueue
);

module.exports = router;