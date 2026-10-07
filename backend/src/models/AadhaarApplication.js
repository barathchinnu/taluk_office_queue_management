const mongoose = require("mongoose");

const aadhaarApplicationSchema = new mongoose.Schema(
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

    serviceType: {
      type: String,
      enum: ["apply", "update", "correction"],
      required: true,
    },

    applicantName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "transgender"],
      required: true,
    },

    dateOfBirth: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      doorNo: { type: String, default: "" },
      street: { type: String, default: "" },
      villageTown: { type: String, default: "" },
      taluk: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "Tamil Nadu" },
      pincode: { type: String, default: "" },
    },

    // Apply (New Enrollment) specific data
    applyData: {
      enrolmentType: { type: String, default: "new_adult" },
      guardianName: { type: String, default: "" },
      guardianRelation: { type: String, default: "" },
      guardianAadhaar: { type: String, default: "" },
      poiDocument: { type: String, default: "" },
      poaDocument: { type: String, default: "" },
      dobDocument: { type: String, default: "" },
    },

    // Update specific data
    updateData: {
      existingAadhaar: { type: String, default: "" },
      updateFields: [{ type: String }],
      updatedAddress: { type: String, default: "" },
      updatedMobile: { type: String, default: "" },
      updatedEmail: { type: String, default: "" },
      updateReason: { type: String, default: "" },
      supportingDocument: { type: String, default: "" },
      documentNumber: { type: String, default: "" },
    },

    // Correction specific data
    correctionData: {
      existingAadhaar: { type: String, default: "" },
      correctionFields: [{ type: String }],
      correctedName: { type: String, default: "" },
      correctedDob: { type: String, default: "" },
      correctedGender: { type: String, default: "" },
      correctionReason: { type: String, default: "" },
      supportingDocument: { type: String, default: "" },
      documentNumber: { type: String, default: "" },
    },

    queueAction: {
      type: String,
      enum: ["token", "appointment", "none"],
      default: "token",
    },

    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    status: {
      type: String,
      enum: ["submitted", "in_review", "verified", "completed", "rejected"],
      default: "submitted",
    },

    remarks: {
      type: String,
      default: "Application submitted successfully. Verification pending at Aadhaar Kendra counter.",
    },
  },
  {
    timestamps: true,
  }
);

aadhaarApplicationSchema.index({ citizen: 1, createdAt: -1 });
aadhaarApplicationSchema.index({ applicationNumber: 1 });

module.exports = mongoose.model("AadhaarApplication", aadhaarApplicationSchema);
