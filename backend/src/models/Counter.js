const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    counterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    name: {
      type: String,
      required: true,
      trim: true,
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

    status: {
      type: String,
      enum: ["available", "busy", "closed"],
      default: "closed",
    },

    isAvailable: {
      type: Boolean,
      default: true,
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

counterSchema.index({ office: 1, counterNumber: 1 });

module.exports = mongoose.model("Counter", counterSchema);