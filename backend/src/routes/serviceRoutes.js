const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  getServicesByDepartment,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public / Citizen / Officer read
router.get("/", getServices);
router.get("/:id", getServiceById);
router.get("/department/:departmentId", getServicesByDepartment);

// Admin management
router.post("/", protect, authorize("admin"), createService);
router.put("/:id", protect, authorize("admin"), updateService);
router.delete("/:id", protect, authorize("admin"), deleteService);

module.exports = router;