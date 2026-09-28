const Service = require("../models/Service");
const Department = require("../models/Department");

// Create Service
const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      department,
      averageServiceTime,
    } = req.body;

    if (
      !name ||
      !description ||
      !department ||
      !averageServiceTime
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    // Check duplicate service
    const existingService = await Service.findOne({
      name: name.trim(),
      department,
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists in this department",
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      department,
      averageServiceTime,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Services
const getServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    })
      .populate("department", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Services By Department
const getServicesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const services = await Service.find({
      department: departmentId,
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Services By Department Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createService,
  getServices,
  getServicesByDepartment,
};