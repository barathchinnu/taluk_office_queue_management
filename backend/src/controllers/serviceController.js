const mongoose = require("mongoose");
const Service = require("../models/Service");
const Department = require("../models/Department");

// Create Service
const createService = async (req, res) => {
  try {
    const { name, description, department, averageServiceTime } = req.body;

    if (!name || !description || !department || !averageServiceTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

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
      averageServiceTime: Number(averageServiceTime) || 10,
    });

    const populatedService = await Service.findById(service._id)
      .populate("department", "name code");

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: populatedService,
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
    const { all } = req.query;
    const filter = all === "true" ? {} : { isActive: true };

    const services = await Service.find(filter)
      .populate("department", "name code")
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

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const services = await Service.find({
      department: departmentId,
      isActive: true,
    })
      .populate("department", "name code")
      .sort({ name: 1 });

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

// Get Service By ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findById(id).populate("department", "name code");
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, department, averageServiceTime, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (name) service.name = name.trim();
    if (description) service.description = description.trim();
    if (department && mongoose.Types.ObjectId.isValid(department)) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
      service.department = department;
    }
    if (averageServiceTime !== undefined) {
      service.averageServiceTime = Number(averageServiceTime) || 10;
    }
    if (isActive !== undefined) {
      service.isActive = Boolean(isActive);
    }

    await service.save();

    const populatedService = await Service.findById(service._id).populate("department", "name code");

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete / Deactivate Service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);
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
  getServiceById,
  updateService,
  deleteService,
};