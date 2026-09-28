const Officer = require("../models/Officer");
const User = require("../models/User");
const Department = require("../models/Department");

// Create Officer
const createOfficer = async (req, res) => {
  try {
    const {
      user,
      department,
      employeeId,
      designation,
    } = req.body;

    if (!user || !department || !employeeId || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const existingOfficer = await Officer.findOne({
      $or: [
        { user },
        { employeeId: employeeId.trim() },
      ],
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "Officer already exists",
      });
    }

    const officer = await Officer.create({
      user,
      department,
      employeeId: employeeId.trim(),
      designation: designation.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      officer,
    });
  } catch (error) {
    console.error("Create Officer Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Officers
const getOfficers = async (req, res) => {
  try {
    const officers = await Officer.find({
      isActive: true,
    })
      .populate("user", "fullName email phone")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: officers.length,
      officers,
    });
  } catch (error) {
    console.error("Get Officers Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createOfficer,
  getOfficers,
};