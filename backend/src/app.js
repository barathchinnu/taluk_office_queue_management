const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const officerRoutes = require("./routes/officerRoutes");
const counterRoutes = require("./routes/counterRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aadhaarRoutes = require("./routes/aadhaarRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const officeRoutes = require("./routes/officeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const serviceCatalogRoutes = require("./routes/serviceCatalogRoutes");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/aadhaar", aadhaarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/service-catalog", serviceCatalogRoutes);

// Root Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Government Queue Management API is Running 🚀",
  });
});

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;