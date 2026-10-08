const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ service: 1, rating: -1 });
feedbackSchema.index({ department: 1, rating: -1 });
feedbackSchema.index({ officer: 1 });
feedbackSchema.index({ citizen: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
