const express = require("express");
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  trackApplication,
  getAllApplications,
  updateApplicationStatus,
  uploadApplicationDocument,
  verifyDocument,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public search/tracking route (no auth needed so citizens can track anywhere with application or token number)
router.get("/track/:query", trackApplication);

// Citizen & Protected routes
router.use(protect);

router.post("/", createApplication);
router.get("/my", getMyApplications);
router.get("/:id", getApplicationById);
router.post("/:id/documents", upload.single("document"), uploadApplicationDocument);

// Staff / Officer / Admin routes
router.get("/", authorize("officer", "admin"), getAllApplications);
router.patch("/:id/status", authorize("officer", "admin"), updateApplicationStatus);
router.patch("/documents/:docId/verify", authorize("officer", "admin"), verifyDocument);

module.exports = router;
