const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Department = require("../models/Department");
const Service = require("../models/Service");

// Create Appointment
const createAppointment = async (req, res) => {
  try {
    const {
      citizen,
      department,
      service,
      appointmentDate,
      purpose,
    } = req.body;

    if (!citizen || !department || !service || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Citizen, department, service and appointment date are required",
      });
    }

    // Check citizen
    const citizenExists = await User.findById(citizen);

    if (!citizenExists) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
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

    // Check service
    const serviceExists = await Service.findById(service);

    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Make sure service belongs to selected department
    if (serviceExists.department.toString() !== department) {
      return res.status(400).json({
        success: false,
        message: "Service does not belong to selected department",
      });
    }

    // Prevent booking in the past
    const selectedDate = new Date(appointmentDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    if (selectedDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    const appointment = await Appointment.create({
      citizen,
      department,
      service,
      appointmentDate: selectedDate,
      purpose: purpose || "",
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate("citizen", "fullName email phone")
      .populate("department", "name")
      .populate("service", "name averageServiceTime");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Appointments
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("citizen", "fullName email phone")
      .populate("department", "name")
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

// Cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

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

module.exports = {
  createAppointment,
  getAppointments,
  cancelAppointment,
};