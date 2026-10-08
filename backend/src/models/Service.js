const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    averageServiceTime: {
      type: Number,
      required: true,
      min: 1,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    requiredDocuments: {
      type: [String],
      default: ["Proof of Identity (Aadhaar / Voter ID)", "Proof of Address (Ration Card / Utility Bill)"],
    },

    fee: {
      type: Number,
      default: 0,
    },

    expectedProcessingDays: {
      type: Number,
      default: 3,
    },

    walkInAvailable: {
      type: Boolean,
      default: true,
    },

    appointmentAvailable: {
      type: Boolean,
      default: true,
    },

    priorityEligible: {
      type: Boolean,
      default: true,
    },

    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);