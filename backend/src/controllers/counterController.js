const Counter = require("../models/Counter");
const Department = require("../models/Department");
const Officer = require("../models/Officer");

// Create Counter
const createCounter = async (req, res) => {
  try {
    const {
      counterNumber,
      name,
      department,
      officer,
    } = req.body;

    if (!counterNumber || !name || !department) {
      return res.status(400).json({
        success: false,
        message: "Counter number, name and department are required",
      });
    }

    // Check department
    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check counter number
    const existingCounter = await Counter.findOne({
      counterNumber,
    });

    if (existingCounter) {
      return res.status(400).json({
        success: false,
        message: "Counter number already exists",
      });
    }

    // If officer is provided, verify officer
    if (officer) {
      const officerExists = await Officer.findById(officer);

      if (!officerExists) {
        return res.status(404).json({
          success: false,
          message: "Officer not found",
        });
      }
    }

    const counter = await Counter.create({
      counterNumber,
      name: name.trim(),
      department,
      officer: officer || null,
      status: "closed",
    });

    res.status(201).json({
      success: true,
      message: "Counter created successfully",
      counter,
    });
  } catch (error) {
    console.error("Create Counter Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Counters
const getCounters = async (req, res) => {
  try {
    const counters = await Counter.find({
      isActive: true,
    })
      .populate("department", "name")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({ counterNumber: 1 });

    res.status(200).json({
      success: true,
      count: counters.length,
      counters,
    });
  } catch (error) {
    console.error("Get Counters Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCounter,
  getCounters,
};