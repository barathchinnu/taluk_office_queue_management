const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    // User account linked to this officer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Department where the officer works
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    // Government Office where the officer is stationed
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },

    // Government employee ID
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Officer designation
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // Whether officer is currently available
    isAvailable: {
      type: Boolean,
      default: false,
    },

    // Whether officer account is active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Officer", officerSchema);