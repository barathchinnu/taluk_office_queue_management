const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "APPOINTMENT_BOOKED",
        "APPOINTMENT_CONFIRMED",
        "APPOINTMENT_CANCELLED",
        "TOKEN_GENERATED",
        "QUEUE_UPDATE",
        "TOKEN_NEAR",
        "TOKEN_CALLED",
        "SERVICE_STARTED",
        "SERVICE_COMPLETED",
        "APPLICATION_SUBMITTED",
        "DOCUMENT_VERIFICATION",
        "DOCUMENT_REJECTED",
        "APPLICATION_APPROVED",
        "APPLICATION_REJECTED",
        "FEEDBACK_REQUESTED",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },
    channel: {
      type: String,
      enum: ["IN_APP", "EMAIL", "SMS", "PUSH"],
      default: "IN_APP",
    },
    relatedToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
