const mongoose = require("mongoose");
const GovernmentOffice = require("../models/GovernmentOffice");
const Department = require("../models/Department");
const Service = require("../models/Service");

// =====================================================
// GET ALL GOVERNMENT OFFICES (Public / Citizen / Admin)
// =====================================================
const getOffices = async (req, res) => {
  try {
    const { all, district, taluk, state } = req.query;
    const filter = all === "true" ? {} : { isActive: true };

    if (district) {
      filter.district = new RegExp(`^${district}$`, "i");
    }
    if (taluk) {
      filter.taluk = new RegExp(`^${taluk}$`, "i");
    }
    if (state) {
      filter.state = new RegExp(`^${state}$`, "i");
    }

    let offices = await GovernmentOffice.find(filter)
      .populate("stateRef", "name code")
      .populate("districtRef", "name code")
      .populate("talukRef", "name code")
      .sort({ name: 1 });

    // If no offices exist yet, auto-seed authoritative locations
    if (offices.length === 0 && !district && !taluk) {
      const seedAllLocations = require("../seedLocations");
      await seedAllLocations(false);
      offices = await GovernmentOffice.find(filter)
        .populate("stateRef", "name code")
        .populate("districtRef", "name code")
        .populate("talukRef", "name code")
        .sort({ name: 1 });
    }

    return res.status(200).json({
      success: true,
      count: offices.length,
      data: offices,
      offices,
    });
  } catch (error) {
    console.error("Get Offices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICE BY ID
// =====================================================
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID",
      });
    }

    const office = await GovernmentOffice.findById(id)
      .populate("stateRef", "name code")
      .populate("districtRef", "name code")
      .populate("talukRef", "name code");

    if (!office) {
      return res.status(404).json({
        success: false,
        message: "Government office not found",
      });
    }

    // Attach departments within this office
    const departments = await Department.find({
      $or: [{ office: office._id }, { office: null }],
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      office,
      departments,
    });
  } catch (error) {
    console.error("Get Office By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET DEPARTMENTS FOR A SPECIFIC OFFICE
// =====================================================
const getOfficeDepartments = async (req, res) => {
  try {
    const { officeId } = req.params;

    let filter = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(officeId)) {
      filter.$or = [{ office: officeId }, { office: null }];
    }

    const departments = await Department.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
      departments,
    });
  } catch (error) {
    console.error("Get Office Departments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET SERVICES FOR A SPECIFIC OFFICE
// =====================================================
const getOfficeServices = async (req, res) => {
  try {
    const { officeId } = req.params;

    let filter = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(officeId)) {
      filter.$or = [{ office: officeId }, { office: null }];
    }

    const services = await Service.find(filter)
      .populate("department", "name code description")
      .populate("office", "name code district taluk")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
      services,
    });
  } catch (error) {
    console.error("Get Office Services Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// CREATE OFFICE (Admin)
// =====================================================
const createOffice = async (req, res) => {
  try {
    const {
      name,
      code,
      officeType,
      description,
      address,
      pincode,
      latitude,
      longitude,
      state,
      district,
      taluk,
      stateRef,
      districtRef,
      talukRef,
      contactPhone,
      email,
      openingTime,
      closingTime,
      workingDays,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    const existing = await GovernmentOffice.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Office with code '${code}' already exists`,
      });
    }

    const office = await GovernmentOffice.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      officeType: officeType || "taluk_office",
      description: description ? description.trim() : "",
      address: address ? address.trim() : "",
      pincode: pincode ? pincode.trim() : "",
      latitude: latitude || null,
      longitude: longitude || null,
      state: state ? state.trim() : "Tamil Nadu",
      district: district ? district.trim() : "Coimbatore",
      taluk: taluk ? taluk.trim() : "Pollachi",
      stateRef: stateRef || null,
      districtRef: districtRef || null,
      talukRef: talukRef || null,
      contactPhone: contactPhone ? contactPhone.trim() : "",
      email: email ? email.trim() : "",
      openingTime: openingTime || "09:00 AM",
      closingTime: closingTime || "05:00 PM",
      workingDays: workingDays || undefined,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Government office created successfully",
      office,
    });
  } catch (error) {
    console.error("Create Office Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// UPDATE OFFICE (Admin)
// =====================================================
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID",
      });
    }

    const office = await GovernmentOffice.findById(id);
    if (!office) {
      return res.status(404).json({
        success: false,
        message: "Office not found",
      });
    }

    const updatable = [
      "name",
      "officeType",
      "description",
      "address",
      "pincode",
      "latitude",
      "longitude",
      "state",
      "district",
      "taluk",
      "stateRef",
      "districtRef",
      "talukRef",
      "contactPhone",
      "email",
      "openingTime",
      "closingTime",
      "workingDays",
      "isActive",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        office[field] = req.body[field];
      }
    });

    if (req.body.code) {
      office.code = req.body.code.trim().toUpperCase();
    }

    await office.save();

    return res.status(200).json({
      success: true,
      message: "Office updated successfully",
      office,
    });
  } catch (error) {
    console.error("Update Office Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// DELETE / DEACTIVATE OFFICE (Admin)
// =====================================================
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID",
      });
    }

    const office = await GovernmentOffice.findById(id);
    if (!office) {
      return res.status(404).json({
        success: false,
        message: "Office not found",
      });
    }

    office.isActive = false;
    await office.save();

    return res.status(200).json({
      success: true,
      message: "Office deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Office Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getOffices,
  getOfficeById,
  getOfficeDepartments,
  getOfficeServices,
  createOffice,
  updateOffice,
  deleteOffice,
};
