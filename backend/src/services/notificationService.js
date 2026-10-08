const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitUserNotification } = require("../sockets/socket");
const nodemailer = require("nodemailer");

// Reusable Transporter setup
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Mock / Real Email Sender
 */
const sendEmailNotification = async ({ to, subject, text, html }) => {
  if (!to) return false;

  try {
    if (mailTransporter) {
      await mailTransporter.sendMail({
        from: process.env.EMAIL_FROM || '"Smart Taluk Office" <noreply@talukoffice.gov.in>',
        to,
        subject,
        text,
        html: html || `<p>${text}</p>`,
      });
      return true;
    } else {
      // Mock logger for development and demonstrations
      console.log(`✉️ [Mock Email Gateway] To: ${to} | Subject: "${subject}" | Content: ${text}`);
      return true;
    }
  } catch (err) {
    console.warn("⚠️ Email delivery warning:", err.message);
    return false;
  }
};

/**
 * Mock SMS Provider
 */
const sendSmsNotification = async ({ to, text }) => {
  if (!to) return false;
  // Mock SMS abstraction for college/demo environment without paid twilio API costs
  console.log(`📱 [Mock SMS Gateway] To: ${to} | Message: "${text}"`);
  return true;
};

/**
 * Core notification creation function
 */
const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  channel = "IN_APP",
  relatedToken = null,
  relatedAppointment = null,
  relatedApplication = null,
  metadata = {},
}) => {
  try {
    if (!userId) return null;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      channel,
      relatedToken,
      relatedAppointment,
      relatedApplication,
      metadata,
      isRead: false,
      sentAt: new Date(),
    });

    // 1. Instant real-time Socket.IO emission to citizen's private room
    emitUserNotification(userId.toString(), notification);

    // 2. Fetch user contact details for external channels
    const user = await User.findById(userId).select("email phone fullName");
    if (user) {
      // Send Email in background
      if (user.email && (channel === "EMAIL" || channel === "IN_APP")) {
        sendEmailNotification({
          to: user.email,
          subject: `[Taluk Office] ${title}`,
          text: `Dear ${user.fullName || "Citizen"},\n\n${message}\n\nSmart Government Service Platform`,
        }).catch(() => {});
      }

      // Send SMS in background
      if (user.phone && (channel === "SMS" || channel === "IN_APP")) {
        sendSmsNotification({
          to: user.phone,
          text: `[Taluk e-Seva] ${title}: ${message}`,
        }).catch(() => {});
      }
    }

    return notification;
  } catch (error) {
    console.error("❌ createNotification error:", error.message);
    return null;
  }
};

// =====================================================
// HELPER WORKFLOW TRIGGERS
// =====================================================

const notifyTokenGenerated = async (token, citizenId) => {
  const cId = citizenId || token.citizen?._id || token.citizen;
  const tokenDisplay = token.tokenDisplay || `Token #${token.tokenNumber}`;
  const deptName = token.department?.name || "the department";

  return createNotification({
    userId: cId,
    title: "Token Generated Successfully",
    message: `Your token ${tokenDisplay} for ${deptName} is active. Please monitor live wait times.`,
    type: "TOKEN_GENERATED",
    channel: "IN_APP",
    relatedToken: token._id,
  });
};

const notifyTokenNear = async (token, peopleAhead) => {
  const cId = token.citizen?._id || token.citizen;
  const tokenDisplay = token.tokenDisplay || `#${token.tokenNumber}`;

  return createNotification({
    userId: cId,
    title: "Your Turn is Approaching!",
    message: `Only ${peopleAhead} citizen${peopleAhead === 1 ? "" : "s"} ahead of token ${tokenDisplay}. Please be ready near the counters.`,
    type: "TOKEN_NEAR",
    channel: "IN_APP",
    relatedToken: token._id,
  });
};

const notifyTokenCalled = async (token, counter) => {
  const cId = token.citizen?._id || token.citizen;
  const tokenDisplay = token.tokenDisplay || `#${token.tokenNumber}`;
  const counterName = counter ? `${counter.name} (Counter #${counter.counterNumber})` : "your designated counter";

  return createNotification({
    userId: cId,
    title: "Your Token Has Been Called!",
    message: `Token ${tokenDisplay} has been called! Please proceed immediately to ${counterName}.`,
    type: "TOKEN_CALLED",
    channel: "IN_APP",
    relatedToken: token._id,
  });
};

const notifyServiceStarted = async (token, counter) => {
  const cId = token.citizen?._id || token.citizen;
  const tokenDisplay = token.tokenDisplay || `#${token.tokenNumber}`;
  const counterName = counter ? counter.name : "counter";

  return createNotification({
    userId: cId,
    title: "Service Processing Started",
    message: `Processing started for token ${tokenDisplay} at ${counterName}.`,
    type: "SERVICE_STARTED",
    channel: "IN_APP",
    relatedToken: token._id,
  });
};

const notifyServiceCompleted = async (token, counter) => {
  const cId = token.citizen?._id || token.citizen;
  const tokenDisplay = token.tokenDisplay || `#${token.tokenNumber}`;

  return createNotification({
    userId: cId,
    title: "Service Completed Successfully",
    message: `Your service for token ${tokenDisplay} has been completed. Please share your rating and feedback.`,
    type: "SERVICE_COMPLETED",
    channel: "IN_APP",
    relatedToken: token._id,
  });
};

const notifyAppointmentConfirmed = async (appointment) => {
  const cId = appointment.citizen?._id || appointment.citizen;
  const dateStr = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN")
    : "selected date";

  return createNotification({
    userId: cId,
    title: "Appointment Confirmed",
    message: `Your appointment is confirmed for ${dateStr} at ${appointment.appointmentTime || "10:00 AM"}. Please bring required documents.`,
    type: "APPOINTMENT_CONFIRMED",
    channel: "IN_APP",
    relatedAppointment: appointment._id,
  });
};

const notifyAppointmentCancelled = async (appointment) => {
  const cId = appointment.citizen?._id || appointment.citizen;

  return createNotification({
    userId: cId,
    title: "Appointment Cancelled",
    message: `Your appointment has been cancelled. You may rebook at any time from the citizen portal.`,
    type: "APPOINTMENT_CANCELLED",
    channel: "IN_APP",
    relatedAppointment: appointment._id,
  });
};

const notifyApplicationUpdate = async (application, title, message, type = "APPLICATION_SUBMITTED") => {
  const cId = application.citizen?._id || application.citizen;

  return createNotification({
    userId: cId,
    title,
    message,
    type,
    channel: "IN_APP",
    relatedApplication: application._id,
  });
};

module.exports = {
  createNotification,
  sendEmailNotification,
  sendSmsNotification,
  notifyTokenGenerated,
  notifyTokenNear,
  notifyTokenCalled,
  notifyServiceStarted,
  notifyServiceCompleted,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyApplicationUpdate,
};
