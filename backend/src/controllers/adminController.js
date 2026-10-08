const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Service = require("../models/Service");
const Officer = require("../models/Officer");
const Counter = require("../models/Counter");
const Appointment = require("../models/Appointment");
const Token = require("../models/Token");
const bcrypt = require("bcryptjs");

const getDayBounds = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// =====================================================
// ADMIN DASHBOARD STATS
// =====================================================
const getDashboardStats = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getDayBounds();

    const [
      totalCitizens,
      totalOfficers,
      totalDepartments,
      totalServices,
      totalCounters,
      todayAppointments,
      todayTokens,
      waitingTokens,
      servingTokens,
      completedTokens,
      skippedTokens,
      recentTokens,
      departmentsList,
    ] = await Promise.all([
      User.countDocuments({ role: "citizen" }),
      Officer.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Counter.countDocuments({ isActive: true }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      }),
      Token.countDocuments({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
      }),
      Token.countDocuments({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
        status: "waiting",
      }),
      Token.countDocuments({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
        status: "serving",
      }),
      Token.countDocuments({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
        status: "completed",
      }),
      Token.countDocuments({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
        status: "skipped",
      }),
      Token.find({
        queueDate: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("citizen", "fullName phone email")
        .populate("department", "name code")
        .populate("service", "name averageServiceTime")
        .populate("counter", "counterNumber name")
        .sort({ updatedAt: -1 })
        .limit(10),
      Department.find({ isActive: true }).select("name code"),
    ]);

    // Calculate department-level token stats
    const departmentStats = await Promise.all(
      departmentsList.map(async (dept) => {
        const [waiting, serving, completed] = await Promise.all([
          Token.countDocuments({
            department: dept._id,
            queueDate: { $gte: startOfDay, $lte: endOfDay },
            status: "waiting",
          }),
          Token.countDocuments({
            department: dept._id,
            queueDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["called", "serving"] },
          }),
          Token.countDocuments({
            department: dept._id,
            queueDate: { $gte: startOfDay, $lte: endOfDay },
            status: "completed",
          }),
        ]);

        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          waiting,
          serving,
          completed,
          total: waiting + serving + completed,
        };
      })
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalCitizens,
        totalOfficers,
        totalDepartments,
        totalServices,
        totalCounters,
        todayAppointments,
        todayTokens,
        waitingTokens,
        servingTokens,
        completedTokens,
        skippedTokens,
      },
      departmentStats,
      recentTokens,
    });
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// ADMIN OFFICER MANAGEMENT
// =====================================================
const getOfficers = async (req, res) => {
  try {
    const officers = await Officer.find()
      .populate("user", "fullName email phone role isVerified")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    // Also attach assigned counter if any
    const officersWithCounter = await Promise.all(
      officers.map(async (officer) => {
        const counter = await Counter.findOne({
          officer: officer._id,
          isActive: true,
        }).select("counterNumber name status");

        return {
          ...officer.toObject(),
          assignedCounter: counter || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: officersWithCounter.length,
      officers: officersWithCounter,
    });
  } catch (error) {
    console.error("Admin Get Officers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createOfficerWithUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, department, employeeId, designation } = req.body;

    if (!fullName || !email || !phone || !password || !department || !employeeId || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (fullName, email, phone, password, department, employeeId, designation)",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    const empExists = await Officer.findOne({ employeeId: employeeId.trim() });
    if (empExists) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: "officer",
      isVerified: true,
    });

    const officer = await Officer.create({
      user: user._id,
      department,
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      isAvailable: true,
      isActive: true,
    });

    const populatedOfficer = await Officer.findById(officer._id)
      .populate("user", "fullName email phone role")
      .populate("department", "name code");

    return res.status(201).json({
      success: true,
      message: "Officer created successfully",
      officer: populatedOfficer,
    });
  } catch (error) {
    console.error("Admin Create Officer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, designation, employeeId, isAvailable, isActive, fullName, phone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
    }

    const officer = await Officer.findById(id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
      officer.department = department;
    }

    if (designation) officer.designation = designation.trim();
    if (employeeId && employeeId.trim() !== officer.employeeId) {
      const duplicateEmp = await Officer.findOne({ employeeId: employeeId.trim() });
      if (duplicateEmp) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already in use",
        });
      }
      officer.employeeId = employeeId.trim();
    }

    if (isAvailable !== undefined) officer.isAvailable = Boolean(isAvailable);
    if (isActive !== undefined) {
      officer.isActive = Boolean(isActive);
      if (!officer.isActive) {
        // If deactivating officer, unassign from any counters
        await Counter.updateMany({ officer: officer._id }, { officer: null, status: "closed" });
      }
    }

    await officer.save();

    // Update user details if provided
    if (fullName || phone) {
      const updateFields = {};
      if (fullName) updateFields.fullName = fullName.trim();
      if (phone) updateFields.phone = phone.trim();
      await User.findByIdAndUpdate(officer.user, updateFields);
    }

    const populatedOfficer = await Officer.findById(officer._id)
      .populate("user", "fullName email phone role")
      .populate("department", "name code");

    return res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      officer: populatedOfficer,
    });
  } catch (error) {
    console.error("Admin Update Officer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid officer ID",
      });
    }

    const officer = await Officer.findById(id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    officer.isActive = false;
    officer.isAvailable = false;
    await officer.save();

    // Unassign from counters
    await Counter.updateMany({ officer: officer._id }, { officer: null, status: "closed" });

    return res.status(200).json({
      success: true,
      message: "Officer deactivated successfully",
    });
  } catch (error) {
    console.error("Admin Delete Officer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// STATEWIDE HIERARCHY OVERVIEW & DRILL-DOWN (Admin)
// =====================================================
const State = require("../models/State");
const District = require("../models/District");
const Taluk = require("../models/Taluk");
const GovernmentOffice = require("../models/GovernmentOffice");
const Application = require("../models/Application");

const getHierarchyOverview = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getDayBounds();

    const [
      totalDistricts,
      totalTaluks,
      totalOffices,
      totalDepartments,
      totalOfficers,
      totalApplications,
      todayTokens,
    ] = await Promise.all([
      District.countDocuments({ isActive: true }),
      Taluk.countDocuments({ isActive: true }),
      GovernmentOffice.countDocuments({ isActive: true }),
      Department.countDocuments({ isActive: true }),
      Officer.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Token.countDocuments({ queueDate: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    return res.status(200).json({
      success: true,
      state: "Tamil Nadu",
      counts: {
        districts: totalDistricts,
        taluks: totalTaluks,
        offices: totalOffices,
        departments: totalDepartments,
        officers: totalOfficers,
        applications: totalApplications,
        todayTokens,
      },
    });
  } catch (error) {
    console.error("Hierarchy Overview Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getHierarchyDrillDown = async (req, res) => {
  try {
    const { districtId, talukId, officeId, departmentId } = req.query;
    const { startOfDay, endOfDay } = getDayBounds();

    // Level 4: Office + Department Queue
    if (officeId && departmentId) {
      const [office, dept, queue, counters, officers] = await Promise.all([
        GovernmentOffice.findById(officeId),
        Department.findById(departmentId),
        Token.find({
          office: officeId,
          department: departmentId,
          queueDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["waiting", "called", "serving"] },
        })
          .populate("citizen", "fullName phone")
          .populate("service", "name")
          .sort({ tokenNumber: 1 }),
        Counter.find({ office: officeId, department: departmentId }).populate("officer"),
        Officer.find({ office: officeId, department: departmentId }).populate("user", "fullName email"),
      ]);

      return res.status(200).json({
        success: true,
        level: "queue",
        office,
        department: dept,
        queue,
        counters,
        officers,
      });
    }

    // Level 3: Taluk Office Details
    if (officeId) {
      const office = await GovernmentOffice.findById(officeId);
      const [depts, services, counters, officers, todayTokensCount, activeAppsCount] = await Promise.all([
        Department.find({ isActive: true }),
        Service.find({ isActive: true }),
        Counter.find({ office: officeId }).populate("officer department"),
        Officer.find({ office: officeId }).populate("user department"),
        Token.countDocuments({ office: officeId, queueDate: { $gte: startOfDay, $lte: endOfDay } }),
        Application.countDocuments({ office: officeId }),
      ]);

      return res.status(200).json({
        success: true,
        level: "office",
        office,
        departments: depts,
        services,
        counters,
        officers,
        todayTokensCount,
        activeAppsCount,
      });
    }

    // Level 2: Taluks under District
    if (districtId) {
      const district = await District.findById(districtId);
      const taluks = await Taluk.find({ district: districtId, isActive: true }).sort({ name: 1 });
      const offices = await GovernmentOffice.find({ districtRef: districtId, isActive: true }).sort({ name: 1 });

      return res.status(200).json({
        success: true,
        level: "taluks",
        district,
        taluks,
        offices,
      });
    }

    // Level 1: All 38 Districts in Tamil Nadu
    const state = await State.findOne({ code: "TN" });
    const districts = await District.find({ isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      level: "districts",
      state: state || { name: "Tamil Nadu", code: "TN" },
      districts,
    });
  } catch (error) {
    console.error("Hierarchy Drill-down Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getDashboardStats,
  getOfficers,
  createOfficerWithUser,
  updateOfficer,
  deleteOfficer,
  getHierarchyOverview,
  getHierarchyDrillDown,
};
