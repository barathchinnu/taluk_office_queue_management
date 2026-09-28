const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Token = require("../models/Token");


// =====================================================
// GET CITIZEN PROFILE
// =====================================================
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET MY APPOINTMENTS
// =====================================================
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    const appointments = await Appointment.find({
      citizen: userId,
    })
      .populate("department", "name")
      .populate(
        "service",
        "name averageServiceTime"
      )
      .sort({
        appointmentDate: -1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error(
      "Get My Appointments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET MY ACTIVE TOKEN
// =====================================================
const getMyToken = async (req, res) => {
  try {
    const userId = req.user._id;

    const token = await Token.findOne({
      citizen: userId,

      status: {
        $in: [
          "waiting",
          "called",
          "serving",
        ],
      },
    })
      .populate(
        "department",
        "name"
      )
      .populate(
        "service",
        "name averageServiceTime"
      )
      .populate(
        "counter",
        "counterNumber name"
      )
      .sort({
        createdAt: -1,
      });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No active token found",
      });
    }

    // ================================================
    // FIND PEOPLE AHEAD
    // ================================================

    const startOfDay = new Date(
      token.queueDate
    );

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      token.queueDate
    );

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const peopleAhead =
      await Token.countDocuments({
        department: token.department._id,

        queueDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },

        status: "waiting",

        tokenNumber: {
          $lt: token.tokenNumber,
        },
      });

    // ================================================
    // ESTIMATED WAIT TIME
    // ================================================

    const averageTime =
      token.service?.averageServiceTime || 10;

    const estimatedWaitTime =
      peopleAhead * averageTime;

    return res.status(200).json({
      success: true,

      token: {
        tokenNumber:
          token.tokenNumber,

        tokenDisplay:
          token.tokenDisplay,

        status:
          token.status,

        department:
          token.department,

        service:
          token.service,

        counter:
          token.counter,

        peopleAhead,

        estimatedWaitTime,
      },
    });

  } catch (error) {
    console.error(
      "Get My Token Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET CURRENT QUEUE
// =====================================================
const getCurrentQueue = async (req, res) => {
  try {
    const {
      departmentId,
    } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
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

    const queue =
      await Token.find({
        department: departmentId,

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
          "service",
          "name averageServiceTime"
        )
        .populate(
          "counter",
          "counterNumber name"
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
      "Get Current Queue Error:",
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
  getProfile,
  getMyAppointments,
  getMyToken,
  getCurrentQueue,
};