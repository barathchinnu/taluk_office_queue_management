const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
     fullName: {
  type: String,
  required: true,
  trim: true,
  },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      default: "citizen",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "transgender", "other", ""],
      default: "",
    },
    aadhaarNumber: {
      type: String,
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
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
    preferredLanguage: {
      type: String,
      default: "ta",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);