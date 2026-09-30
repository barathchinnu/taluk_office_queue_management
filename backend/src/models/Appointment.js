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
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ citizen: 1, appointmentDate: 1 });
appointmentSchema.index({ department: 1, appointmentDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);