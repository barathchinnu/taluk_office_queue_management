import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { tokenService, appointmentService } from "../../services/api";
import { getSocket, joinDepartment } from "../../services/socket";
import StatusBadge from "../../components/StatusBadge";
import {
  Ticket,
  Clock,
  Users,
  Building2,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

const CitizenDashboard = () => {
  const [activeToken, setActiveToken] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Fetch active token
      try {
        const tokenRes = await tokenService.getMyToken();
        if (tokenRes.success) {
          setActiveToken(tokenRes.token);
          if (tokenRes.token?.department?._id) {
            joinDepartment(tokenRes.token.department._id);
          }
        }
      } catch (err) {
        // 404 means no active token, which is normal
        setActiveToken(null);
      }

      // Fetch appointments
      try {
        const apptRes = await appointmentService.getMyAppointments();
        if (apptRes.success) {
          setAppointments(apptRes.appointments);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Socket.io real-time listeners
    const socket = getSocket();
    const handleUpdate = () => {
      fetchData();
    };

    socket.on("tokenCalled", handleUpdate);
    socket.on("serviceStarted", handleUpdate);
    socket.on("serviceCompleted", handleUpdate);
    socket.on("queueUpdated", handleUpdate);

    // Fallback polling every 8 seconds
    const interval = setInterval(fetchData, 8000);

    return () => {
      socket.off("tokenCalled", handleUpdate);
      socket.off("serviceStarted", handleUpdate);
      socket.off("serviceCompleted", handleUpdate);
      socket.off("queueUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleCheckIn = async (appointmentId) => {
    try {
      setCheckInLoading(appointmentId);
      setMessage(null);
      const res = await appointmentService.checkIn(appointmentId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `Check-in successful! Your token is ${res.token.tokenDisplay}.`,
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Check-in failed. Please try again.",
      });
    } finally {
      setCheckInLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gov-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading your token & appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Citizen Service Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time status of your active token, queue wait time and upcoming appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/citizen/take-token"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 rounded-lg shadow-sm transition-all"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-300" />
            <span>Take New Token</span>
          </Link>
        </div>
      </div>

      {/* Alert banner if any */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Token Card */}
      {activeToken ? (
        <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-2xl -z-10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Active Live Token
                </span>
                <StatusBadge status={activeToken.status} />
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-heading">
                  {activeToken.tokenDisplay}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Token #{activeToken.tokenNumber}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {activeToken.department?.name}
                </span>
                <span>•</span>
                <span>{activeToken.service?.name}</span>
                {activeToken.counter && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Assigned: {activeToken.counter.name} (Counter #{activeToken.counter.counterNumber})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Queue Metrics Blocks */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    People Ahead
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeToken.peopleAhead ?? 0}
                </div>
                <span className="text-[10px] text-slate-400">waiting tokens</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Est. Wait Time
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  ~{activeToken.estimatedWaitTime ?? 0}
                  <span className="text-xs font-semibold ml-1">mins</span>
                </div>
                <span className="text-[10px] text-slate-400">approximate</span>
              </div>
            </div>
          </div>

          {/* Status Instruction Callout */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-2">
              {activeToken.status === "called" ? (
                <span className="text-blue-700 font-bold flex items-center gap-1.5 animate-bounce">
                  🔔 Please proceed immediately to your assigned counter!
                </span>
              ) : activeToken.status === "serving" ? (
                <span className="text-purple-700 font-bold flex items-center gap-1.5">
                  💼 You are currently being served at the counter.
                </span>
              ) : (
                <span>
                  Please remain seated in the waiting hall. Your token will be announced on the screen when ready.
                </span>
              )}
            </div>

            <Link
              to={`/display/${activeToken.department?._id}`}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Department Hall Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State: No active token */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">No Active Token Right Now</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Visiting the Taluk Office today? Generate a paperless digital token to reserve your spot in the service queue.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/citizen/take-token"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Generate Walk-in Token</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Walk-in Token</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate an instant queue token for same-day taluk office services without standing in physical queues.
            </p>
          </div>
          <Link
            to="/citizen/take-token"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Take Token Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Book Appointment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule your visit for upcoming dates. Avoid morning rushes and get priority check-in directly to the queue.
            </p>
          </div>
          <Link
            to="/citizen/appointments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Book Visit Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Queue Monitor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View current tokens being served across Revenue, Certificates, Welfare, and Admin counters in real-time.
            </p>
          </div>
          <Link
            to="/citizen/queue"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>View Department Queues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Your Booked Appointments
            </h3>
            <p className="text-xs text-slate-500">Upcoming office visits and check-in options</p>
          </div>
          <Link
            to="/citizen/appointments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Manage All →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            You have no booked appointments. Click "Book Appointment" to plan a visit.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 3).map((appt) => (
              <div
                key={appt._id}
                className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{appt.service?.name}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{appt.department?.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{appt.appointmentTime || "10:00 AM"}</span>
                  </div>
                </div>

                <div>
                  {(appt.status === "booked" || appt.status === "confirmed") && (
                    <button
                      onClick={() => handleCheckIn(appt._id)}
                      disabled={checkInLoading === appt._id}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      {checkInLoading === appt._id ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Ticket className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>Check In to Queue</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
