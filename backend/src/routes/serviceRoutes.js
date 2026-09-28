const express = require("express");

const router = express.Router();

const {
  createService,
  getServices,
  getServicesByDepartment,
} = require("../controllers/serviceController");

router.post("/", createService);

router.get("/", getServices);

router.get(
  "/department/:departmentId",
  getServicesByDepartment
);

module.exports = router;