const express = require("express");
const router = express.Router();
const {
  getStates,
  getDistrictsByState,
  getTaluksByDistrict,
  getOfficesByTaluk,
  createState,
  createDistrict,
  createTaluk,
} = require("../controllers/locationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public endpoints for cascading location dropdowns
router.get("/states", getStates);
router.get("/districts/:stateId", getDistrictsByState);
router.get("/taluks/:districtId", getTaluksByDistrict);
router.get("/offices/:talukId", getOfficesByTaluk);

// Admin-only management endpoints
router.post("/states", protect, authorize("admin"), createState);
router.post("/districts", protect, authorize("admin"), createDistrict);
router.post("/taluks", protect, authorize("admin"), createTaluk);

module.exports = router;
