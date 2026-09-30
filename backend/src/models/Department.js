const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      uppercase: true,
      trim: true,
      default: function () {
        return this.name ? this.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() : "DEPT";
      },
    },

    description: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Department", departmentSchema);