const mongoose = require("mongoose");
const Counter = require("../models/Counter");
const Department = require("../models/Department");
const Officer = require("../models/Officer");

// Create Counter
const createCounter = async (req, res) => {
  try {
    const { counterNumber, name, department, officer } = req.body;

    if (!counterNumber || !name || !department) {
      return res.status(400).json({
        success: false,
        message: "Counter number, name and department are required",
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

    const existingCounter = await Counter.findOne({ counterNumber });
    if (existingCounter) {
      return res.status(400).json({
        success: false,
        message: `Counter number ${counterNumber} already exists`,
      });
    }

    let assignedOfficerId = null;
    if (officer) {
      if (!mongoose.Types.ObjectId.isValid(officer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid officer ID",
        });
      }

      const officerExists = await Officer.findById(officer);
      if (!officerExists) {
        return res.status(404).json({
          success: false,
          message: "Officer not found",
        });
      }

      if (officerExists.department.toString() !== department.toString()) {
        return res.status(400).json({
          success: false,
          message: "Officer must belong to the same department as the counter",
        });
      }

      // Check if officer is already assigned to an active counter
      const existingAssignment = await Counter.findOne({
        officer,
        isActive: true,
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: `Officer is already assigned to Counter ${existingAssignment.counterNumber}`,
        });
      }

      assignedOfficerId = officerExists._id;
    }

    const counter = await Counter.create({
      counterNumber,
      name: name.trim(),
      department,
      officer: assignedOfficerId,
      status: assignedOfficerId ? "available" : "closed",
      isAvailable: true,
      isActive: true,
    });

    const populatedCounter = await Counter.findById(counter._id)
      .populate("department", "name code")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      });

    res.status(201).json({
      success: true,
      message: "Counter created successfully",
      counter: populatedCounter,
    });
  } catch (error) {
    console.error("Create Counter Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Get All Counters
const getCounters = async (req, res) => {
  try {
    const { department, includeInactive } = req.query;
    const filter = {};

    if (includeInactive !== "true") {
      filter.isActive = true;
    }

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      filter.department = department;
    }

    const counters = await Counter.find(filter)
      .populate("department", "name code")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      })
      .sort({ counterNumber: 1 });

    res.status(200).json({
      success: true,
      count: counters.length,
      counters,
    });
  } catch (error) {
    console.error("Get Counters Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Single Counter by ID
const getCounterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counter ID",
      });
    }

    const counter = await Counter.findById(id)
      .populate("department", "name code")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      });

    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    res.status(200).json({
      success: true,
      counter,
    });
  } catch (error) {
    console.error("Get Counter By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Counter
const updateCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const { counterNumber, name, department, officer, status, isAvailable, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counter ID",
      });
    }

    const counter = await Counter.findById(id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    if (counterNumber && counterNumber !== counter.counterNumber) {
      const duplicate = await Counter.findOne({ counterNumber });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Counter number ${counterNumber} is already in use`,
        });
      }
      counter.counterNumber = counterNumber;
    }

    if (name) counter.name = name.trim();
    if (department && mongoose.Types.ObjectId.isValid(department)) {
      counter.department = department;
    }

    if (officer !== undefined) {
      if (officer === null || officer === "") {
        counter.officer = null;
        counter.status = "closed";
      } else if (mongoose.Types.ObjectId.isValid(officer)) {
        const officerExists = await Officer.findById(officer);
        if (!officerExists) {
          return res.status(404).json({
            success: false,
            message: "Officer not found",
          });
        }
        counter.officer = officer;
        counter.status = "available";
      }
    }

    if (status) counter.status = status;
    if (isAvailable !== undefined) counter.isAvailable = Boolean(isAvailable);
    if (isActive !== undefined) counter.isActive = Boolean(isActive);

    await counter.save();

    const populatedCounter = await Counter.findById(counter._id)
      .populate("department", "name code")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      });

    res.status(200).json({
      success: true,
      message: "Counter updated successfully",
      counter: populatedCounter,
    });
  } catch (error) {
    console.error("Update Counter Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete / Deactivate Counter
const deleteCounter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counter ID",
      });
    }

    const counter = await Counter.findById(id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    counter.isActive = false;
    counter.status = "closed";
    counter.officer = null;
    await counter.save();

    res.status(200).json({
      success: true,
      message: "Counter deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Counter Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Assign Officer to Counter
const assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counter ID",
      });
    }

    if (!officerId || !mongoose.Types.ObjectId.isValid(officerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid officerId is required",
      });
    }

    const counter = await Counter.findById(id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    if (!counter.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign officer to an inactive counter",
      });
    }

    const officer = await Officer.findById(officerId);
    if (!officer || !officer.isActive) {
      return res.status(404).json({
        success: false,
        message: "Active officer not found",
      });
    }

    // Counter belongs to department; officer must belong to same department
    if (counter.department.toString() !== officer.department.toString()) {
      return res.status(400).json({
        success: false,
        message: "Officer must belong to the same department as the counter",
      });
    }

    // Check if officer is already assigned to another active counter
    const alreadyAssigned = await Counter.findOne({
      officer: officer._id,
      isActive: true,
      _id: { $ne: counter._id },
    });

    if (alreadyAssigned) {
      // Unassign from previous counter to avoid duplicate active counters
      alreadyAssigned.officer = null;
      alreadyAssigned.status = "closed";
      await alreadyAssigned.save();
    }

    counter.officer = officer._id;
    counter.status = "available";
    counter.isAvailable = true;
    await counter.save();

    const populatedCounter = await Counter.findById(counter._id)
      .populate("department", "name code")
      .populate({
        path: "officer",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      });

    res.status(200).json({
      success: true,
      message: `Officer assigned to Counter ${counter.counterNumber} successfully`,
      counter: populatedCounter,
    });
  } catch (error) {
    console.error("Assign Officer Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Remove Officer from Counter
const removeOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counter ID",
      });
    }

    const counter = await Counter.findById(id);
    if (!counter) {
      return res.status(404).json({
        success: false,
        message: "Counter not found",
      });
    }

    counter.officer = null;
    counter.status = "closed";
    await counter.save();

    const populatedCounter = await Counter.findById(counter._id)
      .populate("department", "name code");

    res.status(200).json({
      success: true,
      message: "Officer removed from counter successfully",
      counter: populatedCounter,
    });
  } catch (error) {
    console.error("Remove Officer Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCounter,
  getCounters,
  getCounterById,
  updateCounter,
  deleteCounter,
  assignOfficer,
  removeOfficer,
};