const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    counterNumber: {
      type: Number,
      required: true,
      unique: true,
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

module.exports = mongoose.model("Counter", counterSchema);