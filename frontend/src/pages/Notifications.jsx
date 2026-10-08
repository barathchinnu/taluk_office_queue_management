import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/api";
import { getSocket, joinUser, leaveUser } from "../services/socket";
import {
  Bell,
  CheckCheck,
  Trash2,
  Ticket,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

const getNotificationBadge = (type) => {
  switch (type) {
    case "TOKEN_GENERATED":
    case "TOKEN_NEAR":
    case "TOKEN_CALLED":
      return {
        icon: <Ticket className="w-5 h-5 text-amber-600" />,
        bg: "bg-amber-50 border-amber-200",
        label: "Token",
      };
    case "APPOINTMENT_BOOKED":
    case "APPOINTMENT_CONFIRMED":
    case "APPOINTMENT_CANCELLED":
      return {
        icon: <Calendar className="w-5 h-5 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-200",
        label: "Appointment",
      };
    case "APPLICATION_SUBMITTED":
    case "DOCUMENT_VERIFICATION":
      return {
        icon: <FileText className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-50 border-blue-200",
        label: "Application",
      };
    case "APPLICATION_APPROVED":
    case "SERVICE_COMPLETED":
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
        bg: "bg-teal-50 border-teal-200",
        label: "Success",
      };
    case "APPLICATION_REJECTED":
    case "DOCUMENT_REJECTED":
      return {
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        bg: "bg-rose-50 border-rose-200",
        label: "Notice",
      };
    default:
      return {
        icon: <Bell className="w-5 h-5 text-indigo-600" />,
        bg: "bg-indigo-50 border-indigo-200",
        label: "System",
      };
  }
};

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMy(50);
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchNotifications();

    const socket = getSocket();
    if (user?._id) {
      joinUser(user._id);

      const handleNewNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on("notification:new", handleNewNotification);

      return () => {
        socket.off("notification:new", handleNewNotification);
        leaveUser(user._id);
      };
    }
  }, [isAuthenticated, user?._id]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.delete(id);
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleActionClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }

    if (notif.relatedToken) {
      navigate("/citizen");
    } else if (notif.relatedAppointment) {
      navigate("/citizen/appointments");
    } else if (notif.relatedApplication) {
      navigate("/citizen/applications");
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gov-700 to-indigo-800 flex items-center justify-center text-white shadow-md">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Citizen Notification Center
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time queue alerts, appointment reminders, and service application updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-gov-50 hover:bg-gov-100 text-gov-700 font-semibold text-sm rounded-xl border border-gov-200 transition-colors flex items-center gap-2 shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters and Counters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                filter === "unread"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 hidden sm:block">
            Connected via Live WebSocket Room
          </p>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-700 mx-auto"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading your government notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
            <h3 className="text-lg font-bold text-slate-800">No Notifications</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {filter === "unread"
                ? "You have caught up with all your government service notifications."
                : "You don't have any notifications right now. Activity on your tokens or appointments will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const badge = getNotificationBadge(notif.type);
              const hasLink =
                notif.relatedToken || notif.relatedAppointment || notif.relatedApplication;

              return (
                <div
                  key={notif._id}
                  onClick={() => hasLink && handleActionClick(notif)}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                    !notif.isRead
                      ? "border-amber-300 bg-amber-50/20 ring-1 ring-amber-200"
                      : "border-slate-200 hover:border-slate-300"
                  } ${hasLink ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}
                    >
                      {badge.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {badge.label}
                        </span>
                        <h4
                          className={`text-base font-bold ${
                            !notif.isRead ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(notif.sentAt || notif.createdAt).toLocaleString(
                            undefined,
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </span>
                        {notif.channel && notif.channel !== "IN_APP" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                            via {notif.channel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        title="Mark as read"
                        className="p-2 text-slate-500 hover:text-gov-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      title="Delete"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {hasLink && (
                      <span className="text-xs font-bold text-gov-700 flex items-center gap-1 pl-2">
                        View
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
