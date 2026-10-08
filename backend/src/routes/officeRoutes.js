const express = require("express");
const router = express.Router();
const {
  getOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
} = require("../controllers/officeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public list & detail
router.get("/", getOffices);
router.get("/:id", getOfficeById);

// Admin-only management
router.post("/", protect, authorize("admin"), createOffice);
router.put("/:id", protect, authorize("admin"), updateOffice);
router.delete("/:id", protect, authorize("admin"), deleteOffice);

module.exports = router;
