const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { sendEmailNotification, sendSmsNotification } = require("../services/notificationService");
const { emitOtpNotification } = require("../sockets/socket");

// ==========================
// Register User
// ==========================
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check email
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check phone
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || "citizen",
    });

    // Generate Token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Login User
// ==========================
const login = async (req, res) => {
  try {
    const { email, password, mobile, phone } = req.body;
    const identifier = email || mobile || phone;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Mobile and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Send OTP (Real-Time Service)
// ==========================
const sendOtp = async (req, res) => {
  try {
    const { mobile, email } = req.body;
    if (!mobile && !email) {
      return res.status(400).json({
        success: false,
        message: "Mobile number or email is required",
      });
    }

    const identifier = mobile ? String(mobile).trim() : String(email).trim().toLowerCase();
    const type = mobile ? "MOBILE" : "EMAIL";

    // 1. Generate real-time dynamic 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 2. Clear prior pending OTPs for this identifier
    await Otp.deleteMany({ identifier });

    // 3. Store new OTP in MongoDB
    await Otp.create({
      identifier,
      otp: generatedOtp,
      type,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    // 4. Send Email if email identifier
    if (type === "EMAIL" || email) {
      const targetEmail = email ? String(email).trim().toLowerCase() : identifier;
      await sendEmailNotification({
        to: targetEmail,
        subject: `[Tamil Nadu e-Seva] Your Login OTP: ${generatedOtp}`,
        text: `Your Smart e-Seva portal login verification code is ${generatedOtp}. Valid for 5 minutes. Do not disclose this OTP to anyone.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #0b3b60; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0b3b60; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Government of Tamil Nadu</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #f6c855;">Smart e-Seva Queue & Appointment Portal</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; text-align: center;">
              <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">Your One-Time Password (OTP) for Citizen Portal Login is:</p>
              <div style="background-color: #f1f5f9; border: 2px dashed #0b3b60; border-radius: 8px; padding: 14px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0b3b60; display: inline-block;">
                ${generatedOtp}
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 16px 0 0;">This OTP is valid for <strong>5 minutes</strong>. For your security, do not share this code with anyone.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Official Smart Public Administration • Taluk Office Citizen Desk
            </div>
          </div>
        `,
      });
    }

    // 5. Send SMS (Logs to SMS Gateway or sends via configured gateway)
    if (type === "MOBILE" || mobile) {
      await sendSmsNotification({
        to: mobile,
        text: `TNeGOV: Your Smart e-Seva login OTP is ${generatedOtp}. Valid for 5 mins. Do not share with anyone. - Govt of Tamil Nadu`,
      });
    }

    // 6. Broadcast real-time Socket event to client
    emitOtpNotification(identifier, {
      identifier,
      otp: generatedOtp,
      type,
      expiresAt,
      message: `TNeGOV: Your OTP is ${generatedOtp}. Valid for 5 minutes.`,
    });

    console.log(`\n======================================================`);
    console.log(`🔐 [REAL-TIME OTP DISPATCHED]`);
    console.log(`   Recipient : ${identifier} (${type})`);
    console.log(`   OTP Code  : >>> ${generatedOtp} <<<`);
    console.log(`   Valid For : 5 Minutes (Expires: ${expiresAt.toLocaleTimeString()})`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      identifier,
      type,
      expiresMinutes: 5,
      otp: generatedOtp, // Real dynamic OTP for real-time auto-fill & notification toast
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while generating OTP",
    });
  }
};

// ==========================
// Verify OTP & Login
// ==========================
const verifyOtp = async (req, res) => {
  try {
    const { mobile, email, otp, fullName } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP code is required",
      });
    }

    const cleanOtp = String(otp).trim();
    const identifier = mobile ? String(mobile).trim() : String(email).trim().toLowerCase();

    // Query active unverified OTP for this recipient
    const otpRecord = await Otp.findOne({
      identifier,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No active OTP request found for this number/email. Please request a new OTP.",
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "The OTP has expired. Please request a new OTP.",
      });
    }

    // Check maximum attempts limit
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    // Compare OTP
    if (otpRecord.otp !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. Please enter the correct code. (${remaining} attempts remaining)`,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create User
    let user = null;
    if (mobile) {
      user = await User.findOne({ phone: mobile.trim() });
    } else if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      const defaultPassword = await bcrypt.hash(`citizen_${Date.now()}`, 10);
      user = await User.create({
        fullName: fullName || (mobile ? `Citizen (${mobile.slice(-4)})` : "Citizen"),
        email: email ? email.trim().toLowerCase() : `citizen.${mobile || Date.now()}@tne-seva.tn.gov.in`,
        phone: mobile ? mobile.trim() : `98765${Math.floor(10000 + Math.random() * 90000)}`,
        password: defaultPassword,
        role: "citizen",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "OTP verification successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during OTP verification",
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
};