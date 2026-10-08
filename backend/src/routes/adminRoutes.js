const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getOfficers,
  createOfficerWithUser,
  updateOfficer,
  deleteOfficer,
  getHierarchyOverview,
  getHierarchyDrillDown,
} = require("../controllers/adminController");

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const {
  createCounter,
  getCounters,
  updateCounter,
  deleteCounter,
  assignOfficer,
  removeOfficer,
} = require("../controllers/counterController");

const { getAppointments } = require("../controllers/appointmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes require admin role
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/hierarchy-overview", getHierarchyOverview);
router.get("/drill-down", getHierarchyDrillDown);

// Officer Management
router.get("/officers", getOfficers);
router.post("/officers", createOfficerWithUser);
router.put("/officers/:id", updateOfficer);
router.delete("/officers/:id", deleteOfficer);

// Department Management
router.get("/departments", (req, res, next) => {
  req.query.all = "true";
  next();
}, getDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Service Management
router.get("/services", (req, res, next) => {
  req.query.all = "true";
  next();
}, getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// Counter Management
router.get("/counters", (req, res, next) => {
  req.query.includeInactive = "true";
  next();
}, getCounters);
router.post("/counters", createCounter);
router.put("/counters/:id", updateCounter);
router.delete("/counters/:id", deleteCounter);
router.post("/counters/:id/assign-officer", assignOfficer);
router.post("/counters/:id/remove-officer", removeOfficer);

// Appointment Management
router.get("/appointments", getAppointments);

module.exports = router;
