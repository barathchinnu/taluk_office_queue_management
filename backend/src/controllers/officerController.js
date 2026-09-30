const mongoose = require("mongoose");
const Officer = require("../models/Officer");
const Department = require("../models/Department");
const Counter = require("../models/Counter");
const Token = require("../models/Token");
const User = require("../models/User");

// Helper for today's date range
const getDayBounds = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// =====================================================
// CREATE OFFICER PROFILE (Admin or Officer setup)
// =====================================================
const createOfficer = async (req, res) => {
  try {
    const { user, department, employeeId, designation } = req.body;

    if (!user || !department || !employeeId || !designation) {
      return res.status(400).json({
        success: false,
        message: "User, department, employeeId and designation are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or department ID",
      });
    }

    const existingOfficer = await Officer.findOne({ user });
    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "Officer profile already exists for this user",
      });
    }

    const employeeExists = await Officer.findOne({ employeeId: employeeId.trim() });
    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' already exists`,
      });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Ensure user role is updated to officer
    await User.findByIdAndUpdate(user, { role: "officer" });

    const officer = await Officer.create({
      user,
      department,
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      isAvailable: true,
      isActive: true,
    });

    const populatedOfficer = await Officer.findById(officer._id)
      .populate("user", "fullName email phone role")
      .populate("department", "name code");

    return res.status(201).json({
      success: true,
      message: "Officer profile created successfully",
      officer: populatedOfficer,
    });
  } catch (error) {
    console.error("Create Officer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICER PROFILE
// =====================================================
const getOfficerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const officer = await Officer.findOne({ user: userId })
      .populate("user", "fullName email phone role")
      .populate("department", "name code");

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    // Check if counter is assigned
    const counter = await Counter.findOne({
      officer: officer._id,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      officer,
      counter: counter || null,
    });
  } catch (error) {
    console.error("Get Officer Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICER DASHBOARD
// =====================================================
const getOfficerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const officer = await Officer.findOne({ user: userId })
      .populate("user", "fullName email phone role")
      .populate("department", "name code");

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    // Find assigned counter
    const counter = await Counter.findOne({
      officer: officer._id,
      isActive: true,
    }).populate("department", "name code");

    // Waiting count for officer's department today
    const waitingCount = await Token.countDocuments({
      department: officer.department._id,
      status: "waiting",
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Currently serving or called token for this officer's counter (or department if no counter)
    let currentTokenQuery = {
      department: officer.department._id,
      status: { $in: ["called", "serving"] },
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    };

    if (counter) {
      currentTokenQuery.counter = counter._id;
    }

    const currentToken = await Token.findOne(currentTokenQuery)
      .populate("citizen", "fullName phone email")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name")
      .sort({ updatedAt: -1 });

    // Completed count for this department today
    const completedCount = await Token.countDocuments({
      department: officer.department._id,
      ...(counter ? { counter: counter._id } : {}),
      status: "completed",
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        officer,
        currentToken: currentToken || null,
        waitingCount,
        completedCount,
        counter: counter || null,
      },
    });
  } catch (error) {
    console.error("Get Officer Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICER QUEUE
// =====================================================
const getOfficerQueue = async (req, res) => {
  try {
    const userId = req.user._id;

    const officer = await Officer.findOne({ user: userId });
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    const queue = await Token.find({
      department: officer.department,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["waiting", "called", "serving"] },
    })
      .populate("citizen", "fullName phone email")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name")
      .sort({ tokenNumber: 1 });

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    console.error("Get Officer Queue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICER CURRENT TOKEN
// =====================================================
const getCurrentToken = async (req, res) => {
  try {
    const userId = req.user._id;

    const officer = await Officer.findOne({ user: userId });
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    const counter = await Counter.findOne({
      officer: officer._id,
      isActive: true,
    });

    const { startOfDay, endOfDay } = getDayBounds();

    const tokenQuery = {
      department: officer.department,
      status: { $in: ["called", "serving"] },
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    };

    if (counter) {
      tokenQuery.counter = counter._id;
    }

    const currentToken = await Token.findOne(tokenQuery)
      .populate("citizen", "fullName phone email")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    return res.status(200).json({
      success: true,
      currentToken: currentToken || null,
    });
  } catch (error) {
    console.error("Get Current Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// UPDATE OFFICER AVAILABILITY
// =====================================================
const updateAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isAvailable } = req.body;

    const officer = await Officer.findOne({ user: userId });
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    officer.isAvailable = typeof isAvailable === "boolean" ? isAvailable : !officer.isAvailable;
    await officer.save();

    // If counter assigned, update counter status accordingly
    const counter = await Counter.findOne({ officer: officer._id, isActive: true });
    if (counter) {
      counter.isAvailable = officer.isAvailable;
      if (!officer.isAvailable && counter.status === "available") {
        counter.status = "closed";
      } else if (officer.isAvailable && counter.status === "closed") {
        counter.status = "available";
      }
      await counter.save();
    }

    return res.status(200).json({
      success: true,
      message: `Availability updated to ${officer.isAvailable ? "Available" : "Unavailable"}`,
      isAvailable: officer.isAvailable,
      officer,
    });
  } catch (error) {
    console.error("Update Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET ALL OFFICERS (Admin or Department List)
// =====================================================
const getAllOfficers = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { isActive: true };

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      filter.department = department;
    }

    const officers = await Officer.find(filter)
      .populate("user", "fullName email phone role")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: officers.length,
      officers,
    });
  } catch (error) {
    console.error("Get All Officers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createOfficer,
  getOfficerProfile,
  getOfficerDashboard,
  getOfficerQueue,
  getCurrentToken,
  updateAvailability,
  getAllOfficers,
};