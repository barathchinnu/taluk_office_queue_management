const mongoose = require("mongoose");
const Service = require("../models/Service");
const Department = require("../models/Department");
const GovernmentOffice = require("../models/GovernmentOffice");

// =====================================================
// GET FULL SERVICE CATALOG (Public / Citizen)
// =====================================================
const getServiceCatalog = async (req, res) => {
  try {
    const { department, search, office } = req.query;
    const filter = { isActive: true };

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      filter.department = department;
    }

    if (office && mongoose.Types.ObjectId.isValid(office)) {
      filter.office = office;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(filter)
      .populate("department", "name code description")
      .populate("office", "name code district taluk")
      .sort({ department: 1, name: 1 });

    const departments = await Department.find({ isActive: true }).select("name code description");

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
      services,
      departments,
    });
  } catch (error) {
    console.error("Get Service Catalog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET SINGLE SERVICE CATALOG DETAILS
// =====================================================
const getCatalogServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    const service = await Service.findById(id)
      .populate("department", "name code description")
      .populate("office", "name code address contactPhone email openingTime closingTime");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getServiceCatalog,
  getCatalogServiceById,
};
