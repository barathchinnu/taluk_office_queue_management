const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Department = require("../models/Department");
const Service = require("../models/Service");
const Token = require("../models/Token");
const { notifyQueueUpdate } = require("../sockets/socket");
const {
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
} = require("../services/notificationService");

// Helper for today's date range
const getDayBounds = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// =====================================================
// CREATE APPOINTMENT (Citizen books)
// =====================================================
const createAppointment = async (req, res) => {
  try {
    const { department, service, appointmentDate, appointmentTime, purpose, notes } = req.body;
    // Identify citizen from JWT or body if admin
    const citizenId = req.user ? req.user._id : req.body.citizen;

    if (!citizenId || !department || !service || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Citizen, department, service and appointment date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department) || !mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or service ID",
      });
    }

    const citizenExists = await User.findById(citizenId);
    if (!citizenExists) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists || !departmentExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Department not found or inactive",
      });
    }

    const serviceExists = await Service.findById(service);
    if (!serviceExists || !serviceExists.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    if (serviceExists.department.toString() !== department.toString()) {
      return res.status(400).json({
        success: false,
        message: "Service does not belong to the selected department",
      });
    }

    // Validate appointment date
    const selectedDate = new Date(appointmentDate);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date format",
      });
    }

    // Prevent booking in the past (compare with start of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    // Check daily booking capacity for this service (prevent overbooking)
    const { startOfDay, endOfDay } = getDayBounds(selectedDate);
    const existingBookingsCount = await Appointment.countDocuments({
      service,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["booked", "confirmed"] },
    });

    const maxDailyCapacity = 30; // configurable service daily capacity
    if (existingBookingsCount >= maxDailyCapacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum appointment capacity (${maxDailyCapacity}) reached for this service on the selected date. Please choose another date.`,
      });
    }

    const { office, priorityType } = req.body;
    const validPriorities = ["normal", "senior_citizen", "differently_abled", "pregnant_woman", "emergency"];
    const pType = validPriorities.includes(priorityType) ? priorityType : "normal";

    const appointment = await Appointment.create({
      citizen: citizenId,
      department,
      service,
      office: office || departmentExists.office || null,
      priorityType: pType,
      appointmentDate: selectedDate,
      appointmentTime: appointmentTime || "10:00 AM",
      purpose: purpose || notes || "",
      notes: notes || purpose || "",
      status: "booked",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime");

    // Trigger notification to citizen
    notifyAppointmentConfirmed(populatedAppointment).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET MY APPOINTMENTS (Citizen)
// =====================================================
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    const appointments = await Appointment.find({ citizen: userId })
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get My Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET ALL APPOINTMENTS (Admin / Staff)
// =====================================================
const getAppointments = async (req, res) => {
  try {
    const { department, status, date } = req.query;
    const filter = {};

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      filter.department = department;
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      const { startOfDay, endOfDay } = getDayBounds(new Date(date));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET SINGLE APPOINTMENT BY ID
// =====================================================
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Role-based authorization
    if (
      req.user &&
      req.user.role === "citizen" &&
      appointment.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this appointment",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// CANCEL APPOINTMENT
// =====================================================
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Ensure citizen only cancels their own appointment
    if (
      req.user &&
      req.user.role === "citizen" &&
      appointment.citizen.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Trigger notification
    notifyAppointmentCancelled(appointment).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// APPOINTMENT CHECK-IN -> GENERATE TOKEN (Phase 13)
// =====================================================
const checkInAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("department")
      .populate("service");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Only owner citizen or admin
    if (
      req.user.role !== "admin" &&
      appointment.citizen.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only check in for your own appointment",
      });
    }

    if (appointment.status !== "booked" && appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Appointment status is '${appointment.status}'`,
      });
    }

    // Check if token already exists
    const existingToken = await Token.findOne({ appointment: appointment._id });
    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: "Token already generated for this appointment",
        token: existingToken,
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    // Next token number for today
    const lastToken = await Token.findOne({
      department: appointment.department._id,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ tokenNumber: -1 });

    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const deptPrefix = appointment.department.code
      ? appointment.department.code.substring(0, 3).toUpperCase()
      : appointment.department.name.substring(0, 3).toUpperCase() || "APT";

    const tokenDisplay = `${deptPrefix}${String(nextTokenNumber).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber: nextTokenNumber,
      tokenDisplay,
      citizen: appointment.citizen,
      department: appointment.department._id,
      service: appointment.service._id,
      appointment: appointment._id,
      queueDate: new Date(),
      status: "waiting",
    });

    appointment.status = "checked_in";
    await appointment.save();

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(appointment.department._id, "tokenCreated", populatedToken);

    return res.status(201).json({
      success: true,
      message: "Check-in successful. Token generated!",
      token: populatedToken,
      appointment,
    });
  } catch (error) {
    console.error("Appointment Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  checkInAppointment,
};