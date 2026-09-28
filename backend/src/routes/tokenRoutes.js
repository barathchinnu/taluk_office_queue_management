const express = require("express");

const router = express.Router();

const {
  generateToken,
  getQueue,
  callNextToken,
  startService,
  completeService,
} = require("../controllers/tokenController");

// Generate token
router.post("/", generateToken);

// Get current queue
router.get("/queue/:departmentId", getQueue);

// Call next waiting token
router.post("/call-next", callNextToken);

// Start service
router.post("/:id/start", startService);

// Complete service
router.post("/:id/complete", completeService);

module.exports = router;