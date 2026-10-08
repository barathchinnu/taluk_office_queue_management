const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },

    tokenDisplay: {
      type: String,
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    aadhaarApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AadhaarApplication",
      default: null,
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

    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counter",
      default: null,
    },

    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    priorityType: {
      type: String,
      set: (v) => {
        if (!v) return "normal";
        const clean = v.toLowerCase().replace(/[-\s]/g, "_");
        if (clean === "disability" || clean === "pwd") return "differently_abled";
        if (clean === "pregnant") return "pregnant_woman";
        return clean;
      },
      enum: [
        "normal",
        "senior_citizen",
        "differently_abled",
        "pregnant_woman",
        "emergency",
        "disability",
        "pregnant",
        "NORMAL",
        "SENIOR_CITIZEN",
        "DIFFERENTLY_ABLED",
        "PREGNANT_WOMAN",
        "EMERGENCY",
        "DISABILITY",
        "PREGNANT",
      ],
      default: "normal",
    },

    priorityVerified: {
      type: Boolean,
      default: false,
    },

    priorityApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    queueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "called",
        "serving",
        "completed",
        "skipped",
        "cancelled",
      ],
      default: "waiting",
    },

    calledAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    servingAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tokenSchema.index({ department: 1, queueDate: 1, status: 1 });
tokenSchema.index({ department: 1, queueDate: 1, priorityVerified: -1, tokenNumber: 1 });
tokenSchema.index({ citizen: 1, status: 1 });
tokenSchema.index({ appointment: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model("Token", tokenSchema);