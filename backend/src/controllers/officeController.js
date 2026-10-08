const mongoose = require("mongoose");
const GovernmentOffice = require("../models/GovernmentOffice");
const Department = require("../models/Department");

// =====================================================
// GET ALL GOVERNMENT OFFICES (Public / Citizen / Admin)
// =====================================================
const getOffices = async (req, res) => {
  try {
    const { all } = req.query;
    const filter = all === "true" ? {} : { isActive: true };

    let offices = await GovernmentOffice.find(filter).sort({ name: 1 });

    // If no offices exist yet, auto-provision default Taluk Office for backward compatibility
    if (offices.length === 0) {
      const defaultOffice = await GovernmentOffice.create({
        name: "Taluk Administrative Office",
        code: "TALUK-HQ",
        officeType: "taluk_office",
        description: "Principal Taluk Revenue and Administrative Headquarters for Citizens",
        address: "Taluk Office Complex, Kacheri Road",
        district: "Erode",
        taluk: "Perundurai",
        contactPhone: "0424-2253100",
        email: "tahsildar@talukoffice.gov.in",
        openingTime: "09:30 AM",
        closingTime: "05:30 PM",
        isActive: true,
      });
      offices = [defaultOffice];

      // Link any unassigned departments to default office
      await Department.updateMany(
        { office: null },
        { office: defaultOffice._id }
      );
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

    const office = await GovernmentOffice.findById(id);
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
      district,
      taluk,
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
      district: district ? district.trim() : "Central",
      taluk: taluk ? taluk.trim() : "Headquarters",
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
      "district",
      "taluk",
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
  createOffice,
  updateOffice,
  deleteOffice,
};
