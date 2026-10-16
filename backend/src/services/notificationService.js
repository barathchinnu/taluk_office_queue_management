const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitUserNotification } = require("../sockets/socket");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/**
 * Dynamically resolves SMS configuration, reading from disk if not yet in memory
 */
const getSmsConfig = () => {
  let fast2SmsKey = process.env.FAST2SMS_API_KEY?.trim() || "";
  let twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim() || "";
  let twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim() || "";
  let twilioNumber = process.env.TWILIO_PHONE_NUMBER?.trim() || "";
  let twoFactorKey = process.env.TWOFACTOR_API_KEY?.trim() || "";

  try {
    const envPath = path.resolve(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const fMatch = content.match(/FAST2SMS_API_KEY\s*=\s*([^\r\n#]+)/);
      if (fMatch && fMatch[1]?.trim()) {
        fast2SmsKey = fMatch[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.FAST2SMS_API_KEY = fast2SmsKey;
      }
      const twSidMatch = content.match(/TWILIO_ACCOUNT_SID\s*=\s*([^\r\n#]+)/);
      if (twSidMatch && twSidMatch[1]?.trim()) {
        twilioSid = twSidMatch[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.TWILIO_ACCOUNT_SID = twilioSid;
      }
      const twTokenMatch = content.match(/TWILIO_AUTH_TOKEN\s*=\s*([^\r\n#]+)/);
      if (twTokenMatch && twTokenMatch[1]?.trim()) {
        twilioToken = twTokenMatch[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.TWILIO_AUTH_TOKEN = twilioToken;
      }
      const twNumMatch = content.match(/TWILIO_PHONE_NUMBER\s*=\s*([^\r\n#]+)/);
      if (twNumMatch && twNumMatch[1]?.trim()) {
        twilioNumber = twNumMatch[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.TWILIO_PHONE_NUMBER = twilioNumber;
      }
      const twoFMatch = content.match(/TWOFACTOR_API_KEY\s*=\s*([^\r\n#]+)/);
      if (twoFMatch && twoFMatch[1]?.trim()) {
        twoFactorKey = twoFMatch[1].trim().replace(/^['"]|['"]$/g, "");
        process.env.TWOFACTOR_API_KEY = twoFactorKey;
      }
    }
  } catch (e) {}

  return {
    fast2SmsKey,
    twilioSid,
    twilioToken,
    twilioNumber,
    twoFactorKey,
  };
};

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
 * Real-Time SMS Gateway Provider (Fast2SMS / Twilio / 2Factor)
 */
const sendSmsNotification = async ({ to, text, otp }) => {
  if (!to) return false;

  const cleanNumber = String(to).replace(/\D/g, "").slice(-10);
  const otpCode = otp || (text ? text.match(/\b\d{6}\b/)?.[0] : "");
  const config = getSmsConfig();

  // 1. FAST2SMS (India Leading Free/Developer Gateway)
  if (config.fast2SmsKey) {
    try {
      console.log(`📡 [Fast2SMS] Dispatching real SMS to +91 ${cleanNumber}...`);
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: config.fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: String(otpCode),
          numbers: cleanNumber,
        }),
      });
      const data = await response.json();
      if (data.return) {
        console.log(`✅ [Fast2SMS] Real SMS delivered to +91 ${cleanNumber}`);
        return { success: true, gateway: "FAST2SMS", message: "Delivered" };
      } else {
        console.warn(`⚠️ [Fast2SMS Gateway Notice]:`, data.message || data);
        return { success: false, gateway: "FAST2SMS", error: data.message || "Fast2SMS website verification required." };
      }
    } catch (err) {
      console.error(`❌ [Fast2SMS Error]:`, err.message);
      return { success: false, gateway: "FAST2SMS", error: err.message };
    }
  }

  // 2. TWILIO (International Telecom Gateway)
  if (config.twilioSid && config.twilioToken && config.twilioNumber) {
    try {
      console.log(`📡 [Twilio] Dispatching real SMS to +91 ${cleanNumber}...`);
      const accountSid = config.twilioSid;
      const authToken = config.twilioToken;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", `+91${cleanNumber}`);
      params.append("From", config.twilioNumber);
      params.append("Body", text || `TNeGOV: Your Smart e-Seva login OTP is ${otpCode}. Valid for 5 mins.`);

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const data = await response.json();
      if (data.sid) {
        console.log(`✅ [Twilio] SMS queued with SID: ${data.sid}`);
        return true;
      } else {
        console.warn(`⚠️ [Twilio] Error:`, data.message);
      }
    } catch (err) {
      console.error(`❌ [Twilio Error]:`, err.message);
    }
  }

  // 3. 2FACTOR.IN (Dedicated Indian OTP Gateway)
  if (config.twoFactorKey) {
    try {
      console.log(`📡 [2Factor] Dispatching real SMS to +91 ${cleanNumber}...`);
      const response = await fetch(
        `https://2factor.in/v1/API/V1/${config.twoFactorKey}/SMS/${cleanNumber}/${otpCode}/AUTOGEN`
      );
      const data = await response.json();
      if (data.Status === "Success") {
        console.log(`✅ [2Factor] OTP dispatched to +91 ${cleanNumber}`);
        return true;
      }
    } catch (err) {
      console.error(`❌ [2Factor Error]:`, err.message);
    }
  }

  // 4. Server console broadcast
  console.log(`\n======================================================`);
  console.log(`📱 [REAL-TIME MOBILE SMS DISPATCH]`);
  console.log(`   Target Mobile : +91 ${cleanNumber}`);
  console.log(`   OTP Secret    : >>> ${otpCode} <<<`);
  console.log(`   Message       : "${text}"`);
  console.log(`   Gateway Info  : To send physical SMS to actual phone, set FAST2SMS_API_KEY or TWILIO in backend/.env`);
  console.log(`======================================================\n`);
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
  getSmsConfig,
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
