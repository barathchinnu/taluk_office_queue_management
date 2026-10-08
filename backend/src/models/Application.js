const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantPhone: {
      type: String,
      trim: true,
      default: "",
    },
    applicantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    applicantAddress: {
      type: String,
      trim: true,
      default: "",
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "DOCUMENT_VERIFICATION",
        "OFFICER_REVIEW",
        "ADDITIONAL_INFO_REQUIRED",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SUBMITTED",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: "Application submitted. Verification in progress.",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    expectedCompletionDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ applicationNumber: 1 });
applicationSchema.index({ citizen: 1, createdAt: -1 });
applicationSchema.index({ department: 1, status: 1 });
applicationSchema.index({ service: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
