const express = require("express");
const router = express.Router();
const {
  submitAadhaarApplication,
  getMyAadhaarApplications,
  getAadhaarApplicationById,
  updateAadhaarApplicationStatus,
  getAadhaarServicesInfo,
} = require("../controllers/aadhaarController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public info
router.get("/info", getAadhaarServicesInfo);

// Citizen routes
router.post("/apply", protect, submitAadhaarApplication);
router.get("/my-applications", protect, getMyAadhaarApplications);
router.get("/:id", protect, getAadhaarApplicationById);

// Officer / Admin status update
router.patch(
  "/:id/status",
  protect,
  authorize("officer", "admin"),
  updateAadhaarApplicationStatus
);

module.exports = router;
