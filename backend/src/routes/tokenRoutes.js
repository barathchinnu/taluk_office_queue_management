const express = require("express");
const router = express.Router();
const {
  generateToken,
  getMyToken,
  getQueue,
  getPublicQueue,
  callNextToken,
  startService,
  completeService,
  skipToken,
} = require("../controllers/tokenController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public queue display (no login required)
router.get("/public/queue/:departmentId", getPublicQueue);

// Citizen active token
router.get("/my-token", protect, getMyToken);

// Generate token (walk-in or check-in)
router.post("/", protect, generateToken);

// Department queue
router.get("/queue/:departmentId", getQueue);

// Officer actions
router.post("/call-next", protect, authorize("officer", "admin"), callNextToken);
router.post("/:id/start", protect, authorize("officer", "admin"), startService);
router.post("/:id/complete", protect, authorize("officer", "admin"), completeService);
router.post("/:id/skip", protect, authorize("officer", "admin"), skipToken);

module.exports = router;