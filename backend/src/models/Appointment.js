const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
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

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,
      default: "10:00 AM",
      trim: true,
    },

    purpose: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
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

    status: {
      type: String,
      enum: [
        "booked",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "booked",
    },

    checkedInAt: {
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

appointmentSchema.index({ citizen: 1, appointmentDate: 1 });
appointmentSchema.index({ department: 1, appointmentDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);