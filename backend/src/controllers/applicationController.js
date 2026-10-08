const mongoose = require("mongoose");
const Application = require("../models/Application");
const Document = require("../models/Document");
const Department = require("../models/Department");
const Service = require("../models/Service");
const Officer = require("../models/Officer");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const GovernmentOffice = require("../models/GovernmentOffice");
const { notifyApplicationUpdate, createNotification } = require("../services/notificationService");

// =====================================================
// 1. CREATE APPLICATION (Citizen)
// =====================================================
const createApplication = async (req, res) => {
  try {
    const citizenId = req.user._id;
    const {
      department,
      service,
      office,
      applicantName,
      applicantPhone,
      applicantEmail,
      applicantAddress,
      formData,
      appointmentId,
      tokenId,
      priorityType,
      remarks,
    } = req.body;

    const resolvedName = applicantName || req.user?.fullName || "Citizen Applicant";
    const resolvedPhone = applicantPhone || req.user?.phone || "";
    const resolvedEmail = applicantEmail || req.user?.email || "";

    if (!department || !service) {
      return res.status(400).json({
        success: false,
        message: "Department and service are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department) || !mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or service ID",
      });
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc || !deptDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: "Department not found or inactive",
      });
    }

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc || !serviceDoc.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    // Resolve Government Office and location
    const targetOfficeId = office || deptDoc.office || null;
    let officeDoc = null;
    if (targetOfficeId && mongoose.Types.ObjectId.isValid(targetOfficeId)) {
      officeDoc = await GovernmentOffice.findById(targetOfficeId);
    }

    // Meaningful Application Number: TN-{TALUK_CODE}-{DEPARTMENT_CODE}-{YEAR}-{SEQUENCE}
    const year = new Date().getFullYear();
    let talukCode = "TLK";
    if (officeDoc) {
      if (officeDoc.taluk) {
        talukCode = officeDoc.taluk.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
      } else if (officeDoc.code) {
        const parts = officeDoc.code.split("-");
        talukCode = parts.length > 2 ? parts[2].substring(0, 3).toUpperCase() : parts[parts.length - 1].substring(0, 3).toUpperCase();
      }
    } else if (req.body.taluk) {
      talukCode = req.body.taluk.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
    }
    const deptPrefix = deptDoc.code ? deptDoc.code.substring(0, 4).toUpperCase() : "REV";
    const randomSuffix = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, "0");
    const applicationNumber = `TN-${talukCode}-${deptPrefix}-${year}-${randomSuffix}`;

    // Expected completion date based on service expectedProcessingDays
    const expectedDays = serviceDoc.expectedProcessingDays || 3;
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + expectedDays);

    const application = await Application.create({
      applicationNumber,
      citizen: citizenId,
      office: targetOfficeId,
      state: officeDoc?.state || req.body.state || "Tamil Nadu",
      district: officeDoc?.district || req.body.district || "",
      taluk: officeDoc?.taluk || req.body.taluk || "",
      governmentOffice: officeDoc?.name || req.body.governmentOffice || "",
      department,
      service,
      appointment: appointmentId || null,
      token: tokenId || null,
      applicantName: resolvedName.trim(),
      applicantPhone: resolvedPhone ? resolvedPhone.trim() : (req.user?.phone || ""),
      applicantEmail: resolvedEmail ? resolvedEmail.trim() : (req.user?.email || ""),
      applicantAddress: applicantAddress ? applicantAddress.trim() : "",
      priorityType: priorityType || "NORMAL",
      remarks: remarks || "",
      formData: formData || {},
      status: "SUBMITTED",
      expectedCompletionDate,
      submittedAt: new Date(),
    });

    const populated = await Application.findById(application._id)
      .populate("department", "name code")
      .populate("service", "name averageServiceTime expectedProcessingDays fee")
      .populate("office", "name code address");

    // Send notification
    notifyApplicationUpdate(
      populated,
      "Application Submitted",
      `Your application #${applicationNumber} for ${serviceDoc.name} has been submitted. Expected resolution by ${expectedCompletionDate.toLocaleDateString("en-IN")}.`,
      "APPLICATION_SUBMITTED"
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: populated,
      application: populated,
    });
  } catch (error) {
    console.error("Create Application Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit application",
    });
  }
};

// =====================================================
// 2. GET MY APPLICATIONS (Citizen)
// =====================================================
const getMyApplications = async (req, res) => {
  try {
    const citizenId = req.user._id;

    const applications = await Application.find({ citizen: citizenId })
      .populate("department", "name code")
      .populate("service", "name averageServiceTime fee")
      .populate("office", "name code")
      .populate("token", "tokenNumber tokenDisplay status")
      .populate("appointment", "appointmentDate appointmentTime status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 3. GET APPLICATION BY ID
// =====================================================
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime fee requiredDocuments expectedProcessingDays")
      .populate("office", "name code address contactPhone")
      .populate("assignedOfficer", "designation employeeId")
      .populate("token", "tokenNumber tokenDisplay status counter")
      .populate("appointment", "appointmentDate appointmentTime status");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Role check: citizen can only view their own
    const isOwner = application.citizen._id.toString() === req.user._id.toString();
    const isStaff = ["officer", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this application",
      });
    }

    const documents = await Document.find({ application: application._id })
      .populate("uploadedBy", "fullName role")
      .populate("verifiedBy", "fullName role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      application,
      documents,
    });
  } catch (error) {
    console.error("Get Application By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 4. SEARCH / TRACK APPLICATION (Public / Citizen)
// =====================================================
const trackApplication = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const cleanQuery = query.trim();

    // Search by applicationNumber, tokenDisplay, or token ID
    let application = await Application.findOne({
      applicationNumber: { $regex: new RegExp(`^${cleanQuery}$`, "i") },
    })
      .populate("department", "name code")
      .populate("service", "name averageServiceTime expectedProcessingDays")
      .populate("office", "name code address")
      .populate("token", "tokenNumber tokenDisplay status")
      .populate("appointment", "appointmentDate appointmentTime status");

    if (!application && mongoose.Types.ObjectId.isValid(cleanQuery)) {
      application = await Application.findById(cleanQuery)
        .populate("department", "name code")
        .populate("service", "name averageServiceTime")
        .populate("office", "name code");
    }

    if (!application) {
      // Also check if query is a tokenDisplay
      const token = await Token.findOne({
        tokenDisplay: cleanQuery.toUpperCase(),
      })
        .populate("department", "name code")
        .populate("service", "name averageServiceTime")
        .populate("counter", "counterNumber name");

      if (token) {
        return res.status(200).json({
          success: true,
          type: "token",
          data: {
            tokenDisplay: token.tokenDisplay,
            tokenNumber: token.tokenNumber,
            status: token.status,
            department: token.department,
            service: token.service,
            counter: token.counter,
            queueDate: token.queueDate,
            createdAt: token.createdAt,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: "No record found matching the provided application or token number",
      });
    }

    return res.status(200).json({
      success: true,
      type: "application",
      data: {
        applicationNumber: application.applicationNumber,
        status: application.status,
        applicantName: application.applicantName,
        department: application.department,
        service: application.service,
        office: application.office,
        submittedAt: application.submittedAt,
        expectedCompletionDate: application.expectedCompletionDate,
        remarks: application.remarks,
        rejectionReason: application.rejectionReason,
        completedAt: application.completedAt,
        token: application.token,
        appointment: application.appointment,
      },
    });
  } catch (error) {
    console.error("Track Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 5. GET ALL APPLICATIONS (Officer / Admin)
// =====================================================
const getAllApplications = async (req, res) => {
  try {
    const { department, status, search, limit = 50 } = req.query;
    const filter = {};

    // If officer, automatically filter to officer's department unless admin
    if (req.user.role === "officer") {
      const officer = await Officer.findOne({ user: req.user._id });
      if (officer && officer.department) {
        filter.department = officer.department;
      }
    } else if (department && mongoose.Types.ObjectId.isValid(department)) {
      filter.department = department;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { applicationNumber: { $regex: search, $options: "i" } },
        { applicantName: { $regex: search, $options: "i" } },
        { applicantPhone: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await Application.find(filter)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime fee")
      .populate("office", "name code")
      .populate("assignedOfficer", "designation employeeId")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 6. UPDATE APPLICATION STATUS (Officer / Admin)
// =====================================================
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, rejectionReason, expectedCompletionDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const validStatuses = [
      "DRAFT",
      "SUBMITTED",
      "DOCUMENT_VERIFICATION",
      "OFFICER_REVIEW",
      "ADDITIONAL_INFO_REQUIRED",
      "APPROVED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(id).populate("service department");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Identify officer profile
    let officerProfile = null;
    if (req.user.role === "officer") {
      officerProfile = await Officer.findOne({ user: req.user._id });
      if (officerProfile) {
        application.assignedOfficer = officerProfile._id;
      }
    }

    if (status) application.status = status;
    if (remarks) application.remarks = remarks.trim();
    if (rejectionReason) application.rejectionReason = rejectionReason.trim();
    if (expectedCompletionDate) application.expectedCompletionDate = new Date(expectedCompletionDate);

    if (status === "COMPLETED") {
      application.completedAt = new Date();
    }

    await application.save();

    // Trigger Notification to Citizen
    const statusMessages = {
      DOCUMENT_VERIFICATION: "Your submitted documents are currently being verified by an officer.",
      OFFICER_REVIEW: "Your application is under active review by the designated Taluk officer.",
      ADDITIONAL_INFO_REQUIRED: `Action Required: ${remarks || "Please upload additional documentary proof or visit the counter."}`,
      APPROVED: "Great news! Your government service application has been verified and APPROVED.",
      REJECTED: `Your application could not be approved. Reason: ${rejectionReason || remarks || "Documentation criteria not met."}`,
      COMPLETED: "Your service application has been completed and certificate/acknowledgement issued.",
    };

    const notifMessage = statusMessages[status] || `Application status updated to ${status}.`;

    notifyApplicationUpdate(
      application,
      `Application ${status.replace(/_/g, " ")}`,
      `[#${application.applicationNumber}] ${notifMessage}`,
      status === "APPROVED" ? "APPLICATION_APPROVED" : status === "REJECTED" ? "APPLICATION_REJECTED" : "APPLICATION_SUBMITTED"
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

// =====================================================
// 7. UPLOAD DOCUMENT FOR APPLICATION
// =====================================================
const uploadApplicationDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file was uploaded",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const document = await Document.create({
      application: application._id,
      documentType: documentType || "Identity / Address Proof",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      verificationStatus: "PENDING",
      uploadedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload Document Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document",
    });
  }
};

// =====================================================
// 8. VERIFY DOCUMENT (Officer / Admin)
// =====================================================
const verifyDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { verificationStatus, verificationRemarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const validStatuses = ["PENDING", "VERIFIED", "REJECTED", "REUPLOAD_REQUIRED"];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const document = await Document.findById(docId).populate("application");
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    document.verificationStatus = verificationStatus;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    if (verificationRemarks) {
      document.verificationRemarks = verificationRemarks.trim();
    }

    await document.save();

    // Notify citizen if document rejected or reupload needed
    if (["REJECTED", "REUPLOAD_REQUIRED"].includes(verificationStatus) && document.application) {
      createNotification({
        userId: document.application.citizen,
        title: `Document ${verificationStatus === "REJECTED" ? "Rejected" : "Re-upload Required"}`,
        message: `Your document '${document.documentType}' requires attention: ${verificationRemarks || "Please upload a clearer copy."}`,
        type: "DOCUMENT_REJECTED",
        channel: "IN_APP",
        relatedApplication: document.application._id,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${verificationStatus}`,
      document,
    });
  } catch (error) {
    console.error("Verify Document Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  trackApplication,
  getAllApplications,
  updateApplicationStatus,
  uploadApplicationDocument,
  verifyDocument,
};
