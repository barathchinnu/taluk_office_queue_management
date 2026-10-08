const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

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
// Send OTP (Demo Mode)
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

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${mobile || email}`,
      demoMode: true,
      demoOtp: "123456",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        message: "OTP is required",
      });
    }

    if (otp !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. (Demo Mode: please enter 123456)",
      });
    }

    let user = null;
    if (mobile) {
      user = await User.findOne({ phone: mobile });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      const defaultPassword = await bcrypt.hash("demo@123", 10);
      user = await User.create({
        fullName: fullName || (mobile ? `Citizen (${mobile.slice(-4)})` : "Citizen"),
        email: email ? email.toLowerCase() : `citizen.${mobile || Date.now()}@tne-seva.demo`,
        phone: mobile || `98765${Math.floor(10000 + Math.random() * 90000)}`,
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
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
};