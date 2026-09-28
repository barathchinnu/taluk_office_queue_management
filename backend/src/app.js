const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();
const departmentRoutes = require("./routes/departmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const officerRoutes = require("./routes/officerRoutes");
const counterRoutes = require("./routes/counterRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const citizenRoutes = require("./routes/citizenRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/citizens", citizenRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Government Queue Management API is Running 🚀"
    });
});

module.exports = app;