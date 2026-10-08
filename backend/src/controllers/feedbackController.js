const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");

// =====================================================
// 1. SUBMIT FEEDBACK (Citizen)
// =====================================================
const submitFeedback = async (req, res) => {
  try {
    const citizenId = req.user._id;
    const {
      tokenId,
      appointmentId,
      serviceId,
      departmentId,
      officeId,
      officerId,
      service,
      department,
      token,
      appointment,
      rating,
      comment,
      anonymous,
    } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5 stars",
      });
    }

    let finalToken = tokenId || token;
    let finalAppointment = appointmentId || appointment;
    let finalService = serviceId || service;
    let finalDepartment = departmentId || department;
    let finalOfficer = officerId;
    let finalOffice = officeId;

    // Validate token if provided
    if (finalToken) {
      const tokenDoc = await Token.findById(finalToken).populate("counter");
      if (tokenDoc) {
        finalService = finalService || tokenDoc.service;
        finalDepartment = finalDepartment || tokenDoc.department;
        finalOffice = finalOffice || tokenDoc.office;
        if (tokenDoc.counter?.officer) {
          finalOfficer = finalOfficer || tokenDoc.counter.officer;
        }
      }
    }

    // Validate appointment if provided
    if (finalAppointment) {
      const appt = await Appointment.findById(finalAppointment);
      if (appt) {
        finalService = finalService || appt.service;
        finalDepartment = finalDepartment || appt.department;
        finalOffice = finalOffice || appt.office;
      }
    }

    // Auto-derive department from service if needed
    if (finalService && !finalDepartment) {
      const sDoc = await Service.findById(finalService);
      if (sDoc) finalDepartment = sDoc.department;
    }

    if (!finalService || !finalDepartment) {
      return res.status(400).json({
        success: false,
        message: "Service and department are required for feedback",
      });
    }

    const feedback = await Feedback.create({
      citizen: citizenId,
      token: tokenId || null,
      appointment: appointmentId || null,
      service: finalService,
      department: finalDepartment,
      office: finalOffice || null,
      officer: finalOfficer || null,
      rating: numRating,
      comment: comment ? comment.trim() : "",
      anonymous: Boolean(anonymous),
    });

    const populated = await Feedback.findById(feedback._id)
      .populate("service", "name")
      .populate("department", "name code");

    return res.status(201).json({
      success: true,
      message: "Thank you for your valuable feedback!",
      feedback: populated,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 2. GET CITIZEN'S FEEDBACK HISTORY
// =====================================================
const getMyFeedback = async (req, res) => {
  try {
    const citizenId = req.user._id;

    const feedbacks = await Feedback.find({ citizen: citizenId })
      .populate("service", "name")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error("Get My Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// 3. GET FEEDBACK ANALYTICS (Admin)
// =====================================================
const getFeedbackAnalytics = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();

    // Aggregate overall rating and star breakdown
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    // Service-wise ratings
    const serviceStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$service",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceInfo",
        },
      },
      { $unwind: { path: "$serviceInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          serviceId: "$_id",
          serviceName: "$serviceInfo.name",
          avgRating: { $round: ["$avgRating", 1] },
          count: 1,
        },
      },
    ]);

    // Department-wise ratings
    const departmentStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$department",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "deptInfo",
        },
      },
      { $unwind: { path: "$deptInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          deptId: "$_id",
          deptName: "$deptInfo.name",
          deptCode: "$deptInfo.code",
          avgRating: { $round: ["$avgRating", 1] },
          count: 1,
        },
      },
    ]);

    // Recent comments
    const recentFeedbacks = await Feedback.find()
      .populate("service", "name")
      .populate("department", "name code")
      .populate("citizen", "fullName")
      .sort({ createdAt: -1 })
      .limit(15);

    const safeRecent = recentFeedbacks.map((f) => ({
      _id: f._id,
      rating: f.rating,
      comment: f.comment,
      serviceName: f.service?.name,
      departmentName: f.department?.name,
      citizenName: f.anonymous ? "Anonymous Citizen" : f.citizen?.fullName || "Citizen",
      createdAt: f.createdAt,
    }));

    const overview = stats[0] || {
      avgRating: 0,
      total: 0,
      star5: 0,
      star4: 0,
      star3: 0,
      star2: 0,
      star1: 0,
    };

    const avgRatingVal = overview.avgRating ? Number(overview.avgRating.toFixed(1)) : 0;
    const breakdownObj = {
      5: overview.star5,
      4: overview.star4,
      3: overview.star3,
      2: overview.star2,
      1: overview.star1,
    };

    return res.status(200).json({
      success: true,
      totalFeedbacks,
      averageRating: avgRatingVal,
      breakdown: breakdownObj,
      serviceStats,
      departmentStats,
      recentFeedbacks: safeRecent,
      data: {
        summary: {
          totalReviews: totalFeedbacks,
          averageRating: avgRatingVal,
        },
        breakdown: breakdownObj,
        recentFeedback: safeRecent,
        serviceStats,
        departmentStats,
      },
    });
  } catch (error) {
    console.error("Feedback Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
  getFeedbackAnalytics,
};
