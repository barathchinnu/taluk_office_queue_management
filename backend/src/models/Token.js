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
tokenSchema.index({ department: 1, queueDate: 1, tokenNumber: 1 });
tokenSchema.index({ citizen: 1, status: 1 });
tokenSchema.index({ appointment: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model("Token", tokenSchema);