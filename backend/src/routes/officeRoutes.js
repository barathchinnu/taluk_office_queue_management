const express = require("express");
const router = express.Router();
const {
  getOffices,
  getOfficeById,
  getOfficeDepartments,
  getOfficeServices,
  createOffice,
  updateOffice,
  deleteOffice,
} = require("../controllers/officeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public list & detail
router.get("/", getOffices);
router.get("/:id", getOfficeById);
router.get("/:officeId/departments", getOfficeDepartments);
router.get("/:officeId/services", getOfficeServices);

// Admin-only management
router.post("/", protect, authorize("admin"), createOffice);
router.put("/:id", protect, authorize("admin"), updateOffice);
router.delete("/:id", protect, authorize("admin"), deleteOffice);

module.exports = router;
