const Officer = require("../models/Officer");
const Department = require("../models/Department");
const Token = require("../models/Token");


// =====================================================
// CREATE OFFICER PROFILE
// =====================================================
const createOfficer = async (req, res) => {
  try {
    const {
      user,
      department,
      employeeId,
      designation,
    } = req.body;

    // Validation
    if (
      !user ||
      !department ||
      !employeeId ||
      !designation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User, department, employeeId and designation are required",
      });
    }

    // Check if officer profile already exists
    const existingOfficer = await Officer.findOne({
      user,
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message:
          "Officer profile already exists for this user",
      });
    }

    // Check employee ID
    const employeeExists = await Officer.findOne({
      employeeId,
    });

    if (employeeExists) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    // Check department
    const departmentExists =
      await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Create officer
    const officer = await Officer.create({
      user,
      department,
      employeeId,
      designation,
      isAvailable: true,
      isActive: true,
    });

    // Populate user and department
    const populatedOfficer =
      await Officer.findById(officer._id)
        .populate(
          "user",
          "fullName email phone role"
        )
        .populate(
          "department",
          "name"
        );

    return res.status(201).json({
      success: true,
      message:
        "Officer profile created successfully",
      officer: populatedOfficer,
    });

  } catch (error) {
    console.error(
      "Create Officer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET OFFICER PROFILE
// =====================================================
const getOfficerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const officer = await Officer.findOne({
      user: userId,
    })
      .populate(
        "user",
        "fullName email phone role"
      )
      .populate(
        "department",
        "name"
      );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      officer,
    });

  } catch (error) {
    console.error(
      "Get Officer Profile Error:",
      error
    );

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

    const officer = await Officer.findOne({
      user: userId,
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date();
    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const queue = await Token.find({
      department: officer.department,

      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },

      status: {
        $in: [
          "waiting",
          "called",
          "serving",
        ],
      },
    })
      .populate(
        "citizen",
        "fullName phone"
      )
      .populate(
        "service",
        "name averageServiceTime"
      )
      .sort({
        tokenNumber: 1,
      });

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });

  } catch (error) {
    console.error(
      "Get Officer Queue Error:",
      error
    );

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

    const officer = await Officer.findOne({
      user: userId,
    })
      .populate(
        "user",
        "fullName email phone"
      )
      .populate(
        "department",
        "name"
      );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer profile not found",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date();
    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    // Waiting tokens
    const waitingCount =
      await Token.countDocuments({
        department:
          officer.department._id,

        status: "waiting",

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    // Currently called/serving token
    const servingToken =
      await Token.findOne({
        department:
          officer.department._id,

        status: {
          $in: [
            "called",
            "serving",
          ],
        },

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .populate(
          "citizen",
          "fullName phone"
        )
        .populate(
          "service",
          "name"
        );

    // Completed tokens
    const completedCount =
      await Token.countDocuments({
        department:
          officer.department._id,

        status: "completed",

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    return res.status(200).json({
      success: true,

      dashboard: {
        officer,
        waitingCount,
        completedCount,
        servingToken,
      },
    });

  } catch (error) {
    console.error(
      "Get Officer Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createOfficer,
  getOfficerProfile,
  getOfficerDashboard,
  getOfficerQueue,
};