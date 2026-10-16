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
// UPDATE CITIZEN PROFILE
// =====================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      aadhaarNumber,
      address,
      emergencyContact,
      preferredLanguage,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (aadhaarNumber !== undefined) user.aadhaarNumber = aadhaarNumber;

    if (address) {
      user.address = {
        doorNo: address.doorNo ?? user.address?.doorNo ?? "",
        street: address.street ?? user.address?.street ?? "",
        villageTown: address.villageTown ?? user.address?.villageTown ?? "",
        taluk: address.taluk ?? user.address?.taluk ?? "",
        district: address.district ?? user.address?.district ?? "",
        state: address.state ?? user.address?.state ?? "Tamil Nadu",
        pincode: address.pincode ?? user.address?.pincode ?? "",
      };
    }

    if (emergencyContact) {
      user.emergencyContact = {
        name: emergencyContact.name ?? user.emergencyContact?.name ?? "",
        phone: emergencyContact.phone ?? user.emergencyContact?.phone ?? "",
        relation: emergencyContact.relation ?? user.emergencyContact?.relation ?? "",
      };
    }

    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
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
      .populate("department", "name code")
      .populate(
        "service",
        "name averageServiceTime requiredDocuments fee expectedProcessingDays description code"
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
        "name code"
      )
      .populate(
        "service",
        "name averageServiceTime requiredDocuments fee expectedProcessingDays description code"
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
        _id: token._id,

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

        calledAt: token.calledAt,
        servingAt: token.servingAt,
        createdAt: token.createdAt,

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
          "name averageServiceTime requiredDocuments fee expectedProcessingDays description code"
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
  updateProfile,
  getMyAppointments,
  getMyToken,
  getCurrentQueue,
};