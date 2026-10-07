const mongoose = require("mongoose");
const AadhaarApplication = require("../models/AadhaarApplication");
const Department = require("../models/Department");
const Service = require("../models/Service");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const { notifyQueueUpdate } = require("../sockets/socket");

// Helper to get today's start and end timestamps
const getDayBounds = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// =====================================================
// SUBMIT AADHAAR APPLICATION (Apply / Update / Correction)
// =====================================================
const submitAadhaarApplication = async (req, res) => {
  try {
    const citizenId = req.user._id;
    const {
      serviceType,
      applicantName,
      gender,
      dateOfBirth,
      mobile,
      email,
      address,
      applyData,
      updateData,
      correctionData,
      queueAction = "token",
      appointmentDate,
      appointmentTime = "10:30 AM",
    } = req.body;

    if (!serviceType || !["apply", "update", "correction"].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing serviceType. Must be 'apply', 'update', or 'correction'.",
      });
    }

    if (!applicantName || !gender || !dateOfBirth || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Applicant name, gender, date of birth, and mobile number are required.",
      });
    }

    // 1. Resolve Aadhaar Services Department
    let department = await Department.findOne({
      $or: [{ code: "UID" }, { name: "Aadhaar Services" }, { name: /Aadhaar/i }],
    });

    if (!department) {
      // Auto-create department if not yet seeded
      department = await Department.create({
        name: "Aadhaar Services",
        code: "UID",
        description: "UIDAI Aadhaar new enrollment, mobile/address update, biometric and demographic corrections",
        isActive: true,
      });
    }

    // 2. Resolve Service by serviceType
    const serviceNameMap = {
      apply: "Aadhaar Apply",
      update: "Aadhaar Update",
      correction: "Aadhaar Correction",
    };
    const targetServiceName = serviceNameMap[serviceType];

    let service = await Service.findOne({
      department: department._id,
      name: { $regex: new RegExp(serviceType, "i") },
    });

    if (!service) {
      // Find or create service
      service = await Service.findOne({
        department: department._id,
        name: targetServiceName,
      });
    }

    if (!service) {
      const serviceDefaults = {
        apply: {
          name: "Aadhaar Apply",
          description: "Apply for new 12-digit Aadhaar enrollment for citizens and children with biometric capture",
          averageServiceTime: 15,
        },
        update: {
          name: "Aadhaar Update",
          description: "Update mobile number, address, email ID, photo, or biometric details in Aadhaar",
          averageServiceTime: 10,
        },
        correction: {
          name: "Aadhaar Correction",
          description: "Correction of name spelling, date of birth, gender, and demographic details with documentary proof",
          averageServiceTime: 10,
        },
      };

      const def = serviceDefaults[serviceType];
      service = await Service.create({
        name: def.name,
        description: def.description,
        department: department._id,
        averageServiceTime: def.averageServiceTime,
        isActive: true,
      });
    }

    // 3. Generate unique application number (e.g. UID-2026-849102)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const year = new Date().getFullYear();
    const applicationNumber = `UID-${year}-${randomSuffix}`;

    // 4. Create Aadhaar Application
    const application = new AadhaarApplication({
      applicationNumber,
      citizen: citizenId,
      department: department._id,
      service: service._id,
      serviceType,
      applicantName: applicantName.trim(),
      gender,
      dateOfBirth,
      mobile: mobile.trim(),
      email: email ? email.trim() : "",
      address: address || {},
      applyData: serviceType === "apply" ? applyData : undefined,
      updateData: serviceType === "update" ? updateData : undefined,
      correctionData: serviceType === "correction" ? correctionData : undefined,
      queueAction,
      status: "submitted",
      remarks: "Application submitted successfully. Ready for verification at Aadhaar Kendra counter.",
    });

    let generatedToken = null;
    let createdAppointment = null;

    // 5. Handle Queue Action: Generate Walk-in Token
    if (queueAction === "token") {
      const { startOfDay, endOfDay } = getDayBounds();

      // Check existing active token today for Aadhaar department
      let existingActiveToken = await Token.findOne({
        citizen: citizenId,
        department: department._id,
        queueDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["waiting", "called", "serving"] },
      }).populate("service department");

      if (existingActiveToken) {
        // Link to existing token
        generatedToken = existingActiveToken;
        application.token = existingActiveToken._id;
      } else {
        // Generate next token number
        const lastToken = await Token.findOne({
          department: department._id,
          queueDate: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ tokenNumber: -1 });

        const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;
        const deptPrefix = department.code ? department.code.substring(0, 3).toUpperCase() : "UID";
        const tokenDisplay = `${deptPrefix}${String(nextTokenNumber).padStart(3, "0")}`;

        generatedToken = await Token.create({
          tokenNumber: nextTokenNumber,
          tokenDisplay,
          citizen: citizenId,
          department: department._id,
          service: service._id,
          queueDate: new Date(),
          status: "waiting",
          aadhaarApplication: application._id,
        });

        application.token = generatedToken._id;

        // Real-time socket notification
        try {
          notifyQueueUpdate(department._id);
        } catch (socketErr) {
          console.warn("Socket notification warning:", socketErr.message);
        }
      }
    } else if (queueAction === "appointment" && appointmentDate) {
      // Create scheduled appointment
      createdAppointment = await Appointment.create({
        citizen: citizenId,
        department: department._id,
        service: service._id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime || "10:30 AM",
        purpose: `Aadhaar ${serviceType.toUpperCase()} (#${applicationNumber})`,
        status: "booked",
      });

      application.appointment = createdAppointment._id;
    }

    await application.save();

    // Populate for response
    await application.populate("department service token appointment");

    res.status(201).json({
      success: true,
      message:
        serviceType === "apply"
          ? "Aadhaar enrollment application submitted successfully!"
          : serviceType === "update"
          ? "Aadhaar update request registered successfully!"
          : "Aadhaar correction application submitted successfully!",
      application,
      token: generatedToken,
      appointment: createdAppointment,
    });
  } catch (error) {
    console.error("Submit Aadhaar Application Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit Aadhaar application",
    });
  }
};

// =====================================================
// GET CITIZEN'S AADHAAR APPLICATIONS
// =====================================================
const getMyAadhaarApplications = async (req, res) => {
  try {
    const citizenId = req.user._id;

    const applications = await AadhaarApplication.find({ citizen: citizenId })
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("token", "tokenNumber tokenDisplay status counter queueDate")
      .populate("appointment", "appointmentDate appointmentTime status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Aadhaar Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Aadhaar applications",
    });
  }
};

// =====================================================
// GET AADHAAR APPLICATION BY ID
// =====================================================
const getAadhaarApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await AadhaarApplication.findById(id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate({
        path: "token",
        populate: { path: "counter", select: "counterNumber name" },
      })
      .populate("appointment");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar application not found",
      });
    }

    // Role check
    const isOwner = application.citizen._id.toString() === req.user._id.toString();
    const isStaff = ["officer", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
    });
  }
};

// =====================================================
// UPDATE AADHAAR APPLICATION STATUS (Officer / Admin)
// =====================================================
const updateAadhaarApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const application = await AadhaarApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar application not found",
      });
    }

    if (status) application.status = status;
    if (remarks) application.remarks = remarks;

    await application.save();

    res.json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

// =====================================================
// GET AADHAAR SERVICES INFO & DOCUMENT REQUIREMENTS
// =====================================================
const getAadhaarServicesInfo = async (req, res) => {
  try {
    const department = await Department.findOne({
      $or: [{ code: "UID" }, { name: "Aadhaar Services" }],
    });

    const services = department
      ? await Service.find({ department: department._id, isActive: true })
      : [];

    const documentChecklist = {
      apply: {
        poi: ["Passport", "PAN Card", "Voter ID", "Ration Card", "Government Employee ID", "Driving License"],
        poa: ["Electricity Bill (last 3 mos)", "Water Bill", "Bank Passbook", "Ration Card", "Registered Rent Agreement", "Post Office Account"],
        dob: ["Birth Certificate", "SSLC / Matriculation Certificate", "Passport", "PAN Card"],
      },
      update: {
        addressProof: ["Electricity Bill", "Bank Statement", "Voter ID", "Ration Card", "Rent Agreement"],
        mobileProof: ["OTP Authentication with biometric presence at counter"],
        biometrics: ["Live fingerprint & iris capture at counter"],
      },
      correction: {
        nameProof: ["Gazette Notification", "Passport", "PAN Card", "Marriage Certificate (post marriage)"],
        dobProof: ["Birth Certificate", "10th Class Marksheet", "Passport"],
        genderProof: ["Medical Certificate / Self-declaration as per UIDAI guidelines"],
      },
    };

    res.json({
      success: true,
      department,
      services,
      documentChecklist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load Aadhaar services info",
    });
  }
};

module.exports = {
  submitAadhaarApplication,
  getMyAadhaarApplications,
  getAadhaarApplicationById,
  updateAadhaarApplicationStatus,
  getAadhaarServicesInfo,
};
