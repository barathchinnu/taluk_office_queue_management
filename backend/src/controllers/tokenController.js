const Token = require("../models/Token");
const Appointment = require("../models/Appointment");

// =====================================================
// Generate Token
// =====================================================
const generateToken = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check appointment status
    if (appointment.status !== "booked") {
      return res.status(400).json({
        success: false,
        message: "Token cannot be generated for this appointment",
      });
    }

    // Check if token already exists
    const existingToken = await Token.findOne({
      appointment: appointmentId,
    });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: "Token already generated for this appointment",
        token: existingToken,
      });
    }

    // Today's date
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find last token of this department today
    const lastToken = await Token.findOne({
      department: appointment.department,
      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({
      tokenNumber: -1,
    });

    const nextTokenNumber = lastToken
      ? lastToken.tokenNumber + 1
      : 1;

    // Example: T001, T002, T003
    const tokenDisplay = `T${String(nextTokenNumber).padStart(3, "0")}`;

    // Create token
    const token = await Token.create({
      tokenNumber: nextTokenNumber,
      tokenDisplay,
      appointment: appointment._id,
      citizen: appointment.citizen,
      department: appointment.department,
      service: appointment.service,
      queueDate: new Date(),
      status: "waiting",
    });

    // Update appointment
    appointment.status = "checked_in";
    await appointment.save();

    // Populate token data
    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName phone")
      .populate("department", "name")
      .populate("service", "name averageServiceTime");

    return res.status(201).json({
      success: true,
      message: "Token generated successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Generate Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// Get Current Queue
// =====================================================
const getQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const queue = await Token.find({
      department: departmentId,
      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $in: ["waiting", "called", "serving"],
      },
    })
      .populate("citizen", "fullName phone")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name")
      .sort({
        tokenNumber: 1,
      });

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    console.error("Get Queue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// Call Next Token
// =====================================================
const callNextToken = async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check whether another token is already active
    const activeToken = await Token.findOne({
      department: departmentId,
      status: {
        $in: ["called", "serving"],
      },
      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (activeToken) {
      return res.status(400).json({
        success: false,
        message:
          "Complete the current token before calling the next one",
        token: activeToken,
      });
    }

    // Find first waiting token
    const nextToken = await Token.findOne({
      department: departmentId,
      status: "waiting",
      queueDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({
      tokenNumber: 1,
    });

    if (!nextToken) {
      return res.status(404).json({
        success: false,
        message: "No waiting tokens",
      });
    }

    // Change status
    nextToken.status = "called";
    nextToken.calledAt = new Date();

    await nextToken.save();

    const populatedToken = await Token.findById(nextToken._id)
      .populate("citizen", "fullName phone")
      .populate("department", "name")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    return res.status(200).json({
      success: true,
      message: "Token called successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Call Next Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// Start Service
// =====================================================
const startService = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await Token.findById(id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // Token must be called first
    if (token.status !== "called") {
      return res.status(400).json({
        success: false,
        message: "Only a called token can start service",
      });
    }

    token.status = "serving";
    token.servingAt = new Date();

    await token.save();

    return res.status(200).json({
      success: true,
      message: "Service started successfully",
      token,
    });
  } catch (error) {
    console.error("Start Service Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// Complete Service
// =====================================================
const completeService = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await Token.findById(id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // Token must be serving
    if (token.status !== "serving") {
      return res.status(400).json({
        success: false,
        message: "Only a serving token can be completed",
      });
    }

    // Update token
    token.status = "completed";
    token.completedAt = new Date();

    await token.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(
      token.appointment,
      {
        status: "completed",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Service completed successfully",
      token,
    });
  } catch (error) {
    console.error("Complete Service Error:", error);

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
  generateToken,
  getQueue,
  callNextToken,
  startService,
  completeService,
};