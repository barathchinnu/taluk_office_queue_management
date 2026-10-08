const mongoose = require("mongoose");

const governmentOfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    officeType: {
      type: String,
      enum: [
        "taluk_office",
        "revenue_office",
        "sub_registrar",
        "social_welfare",
        "municipality",
        "government_hospital",
        "general_citizen_center",
        "other",
        "TALUK_OFFICE",
        "REVENUE_OFFICE",
        "SUB_REGISTRAR",
        "SOCIAL_WELFARE",
        "MUNICIPALITY",
        "GOVERNMENT_HOSPITAL",
        "GENERAL_CITIZEN_CENTER",
        "OTHER",
      ],
      default: "taluk_office",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "Central",
    },
    taluk: {
      type: String,
      trim: true,
      default: "Headquarters",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    openingTime: {
      type: String,
      trim: true,
      default: "09:00 AM",
    },
    closingTime: {
      type: String,
      trim: true,
      default: "05:00 PM",
    },
    workingDays: {
      type: [String],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
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

governmentOfficeSchema.index({ district: 1, taluk: 1 });

module.exports = mongoose.model("GovernmentOffice", governmentOfficeSchema);
