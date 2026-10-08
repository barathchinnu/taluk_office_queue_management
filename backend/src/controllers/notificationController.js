const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// =====================================================
// GET CURRENT USER'S NOTIFICATIONS
// =====================================================
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(Number(req.query.limit) || 30, 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .populate("relatedToken", "tokenNumber tokenDisplay status")
        .populate("relatedAppointment", "appointmentDate appointmentTime status")
        .populate("relatedApplication", "applicationNumber status")
        .sort({ createdAt: -1 })
        .limit(limit),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get My Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
    });
  }
};

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Marked as read",
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// =====================================================
// MARK ALL AS READ
// =====================================================
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// =====================================================
// DELETE NOTIFICATION
// =====================================================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
      unreadCount,
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
