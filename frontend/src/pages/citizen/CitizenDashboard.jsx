import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { tokenService, appointmentService, applicationService } from "../../services/api";
import { getSocket, joinDepartment } from "../../services/socket";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useGeoLocation } from "../../context/LocationContext";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import FeedbackModal from "../../components/FeedbackModal";
import {
  Ticket,
  Clock,
  Users,
  Building2,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  FileText,
  Search,
  BookOpen,
  Compass,
  Star,
  Sparkles,
} from "lucide-react";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { officeName, selectedLocation, openLocationModal } = useGeoLocation();
  const { t, tDeptName, tServiceName, language } = useLanguage();

  const [activeToken, setActiveToken] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);

      // 1. Fetch active live token
      try {
        const tokenRes = await tokenService.getMyToken();
        if (tokenRes.success && tokenRes.token) {
          setActiveToken(tokenRes.token);
          if (tokenRes.token?.department?._id) {
            joinDepartment(tokenRes.token.department._id);
          }
        } else {
          setActiveToken(null);
        }
      } catch (err) {
        setActiveToken(null);
      }

      // 2. Fetch citizen appointments
      try {
        const apptRes = await appointmentService.getMyAppointments();
        if (apptRes.success) {
          setAppointments(apptRes.appointments || []);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }

      // 3. Fetch citizen applications
      try {
        const appRes = await applicationService.getMy();
        if (appRes.success) {
          setApplications(appRes.data || appRes.applications || []);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
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

    const interval = setInterval(fetchData, 10000);

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
          text:
            language === "ta"
              ? `செக்-இன் வெற்றிகரமாக முடிந்தது! உங்கள் டோக்கன் எண் ${res.token?.tokenDisplay || ""}.`
              : `Check-in successful! Your token number is ${res.token?.tokenDisplay || ""}.`,
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          (language === "ta"
            ? "செக்-இன் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
            : "Check-in failed. Please try again or visit reception."),
      });
    } finally {
      setCheckInLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Citizen Portal Dashboard..." />;
  }

  // Today's appointment helper
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayAppointment = appointments.find((a) => {
    if (!a.appointmentDate) return false;
    const aDateStr = new Date(a.appointmentDate).toISOString().split("T")[0];
    return aDateStr === todayDateStr && a.status !== "cancelled";
  });

  const latestApplication = applications.length > 0 ? applications[0] : null;

  return (
    <div className="space-y-8">
      {/* ==========================================
          TOP WELCOME & OFFICE BANNER (Requirement 15)
      ========================================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
            {language === "ta" ? "தமிழ்நாடு அரசு • குடிமக்கள் முகப்பு" : "Citizen Services Desk"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            {language === "ta"
              ? `வணக்கம், ${user?.fullName || "குடிமகன்"}`
              : `Welcome, ${user?.fullName || "Citizen"}`}
          </h1>
          {/* Selected Office Badge */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-[#0b3b60] bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200">
              <MapPin className="w-3.5 h-3.5 text-[#0b3b60]" />
              <span>{officeName}</span>
            </span>
            <span>•</span>
            <span className="text-slate-500">
              {selectedLocation?.taluk?.name || "Pollachi"},{" "}
              {selectedLocation?.district?.name || "Coimbatore"}
            </span>
            <button
              onClick={openLocationModal}
              className="text-xs text-[#0b3b60] font-bold underline hover:text-[#00809d] ml-1"
            >
              {language === "ta" ? "அலுவலகத்தை மாற்று" : "Change Office"}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#0b3b60]" : ""}`} />
            <span>{language === "ta" ? "புதுப்பி" : "Refresh"}</span>
          </button>

          <Link
            to="/citizen/take-token"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0b3b60] hover:bg-[#082a45] rounded-lg shadow-xs transition-colors"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === "ta" ? "புதிய டோக்கன்" : "Take Token"}</span>
          </Link>
        </div>
      </div>

      {/* Alert banner if any */}
      {message && (
        <div
          role="alert"
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
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==========================================
          4 KEY CARDS (Requirement 15)
          1. Today's Appointment
          2. Current Token
          3. Queue Position
          4. Application Status
      ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {language === "ta" ? "இன்றைய நியமனம்" : "Today's Appointment"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          {todayAppointment ? (
            <div>
              <div className="text-base font-bold text-slate-900 line-clamp-1">
                {tServiceName(todayAppointment.service?.name)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {todayAppointment.appointmentTime || "10:00 AM"} • {tDeptName(todayAppointment.department?.name)}
              </div>
              <div className="mt-2">
                <StatusBadge status={todayAppointment.status} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base font-bold text-slate-700">
                {language === "ta" ? "நியமனங்கள் இல்லை" : "No Appointments Today"}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {appointments.length > 0
                  ? `${appointments.length} total active bookings`
                  : "Schedule an office slot in advance"}
              </div>
              <div className="mt-2">
                <Link
                  to="/citizen/appointments"
                  className="text-xs font-bold text-[#0b3b60] hover:underline"
                >
                  Book Slot →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Current Token */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {language === "ta" ? "தற்போதைய டோக்கன்" : "Current Token"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0b3b60] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          {activeToken ? (
            <div>
              <div className="text-2xl font-black text-[#0b3b60] font-heading">
                {activeToken.tokenDisplay}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Token #{activeToken.tokenNumber} • {tServiceName(activeToken.service?.name)}
              </div>
              <div className="mt-2">
                <StatusBadge status={activeToken.status} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base font-bold text-slate-700">
                {language === "ta" ? "டோக்கன் இல்லை" : "No Active Token"}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Generate a walk-in queue pass
              </div>
              <div className="mt-2">
                <Link
                  to="/citizen/take-token"
                  className="text-xs font-bold text-[#0b3b60] hover:underline"
                >
                  Take Token →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Queue Position */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {language === "ta" ? "வரிசை நிலை" : "Queue Position"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {activeToken ? (
            <div>
              <div className="text-2xl font-black text-slate-900 font-heading">
                {activeToken.peopleAhead ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {language === "ta" ? "முன்னால் உள்ளவர்கள்" : "Persons ahead in line"}
              </div>
              <div className="text-xs font-semibold text-emerald-700 mt-1">
                ~{activeToken.estimatedWaitTime ?? 10} mins wait
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base font-bold text-slate-700">—</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Queue position updates upon token issue
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Application Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {language === "ta" ? "விண்ணப்ப நிலை" : "Application Status"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          {latestApplication ? (
            <div>
              <div className="text-xs font-mono font-bold text-slate-900 truncate">
                {latestApplication.applicationNumber || "TN-APP-001"}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                {latestApplication.serviceName || "Certificate Request"}
              </div>
              <div className="mt-2">
                <StatusBadge status={latestApplication.status || "SUBMITTED"} />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base font-bold text-slate-700">
                {language === "ta" ? "விண்ணப்பங்கள் இல்லை" : "No Applications"}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Track revenue and certificate files
              </div>
              <div className="mt-2">
                <Link to="/track" className="text-xs font-bold text-[#0b3b60] hover:underline">
                  Track File →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          QUICK ACTIONS (Requirement 15)
          [ Book Appointment ]
          [ Take Queue Token ]
          [ Track Application ]
          [ View Services ]
      ========================================== */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 font-heading">
          {language === "ta" ? "விரைவு சேவைகள்" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/citizen/appointments"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0b3b60]">
              {language === "ta" ? "நியமனம் முன்பதிவு" : "Book Appointment"}
            </span>
          </Link>

          <Link
            to="/citizen/take-token"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0b3b60]">
              {language === "ta" ? "வரிசை டோக்கன் பெறுக" : "Take Queue Token"}
            </span>
          </Link>

          <Link
            to="/track"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0b3b60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0b3b60]">
              {language === "ta" ? "விண்ணப்பத்தை கண்காணிக்க" : "Track Application"}
            </span>
          </Link>

          <Link
            to="/services"
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-[#0b3b60]">
              {language === "ta" ? "அரசு சேவைகள் பட்டியல்" : "View Services"}
            </span>
          </Link>
        </div>
      </div>

      {/* ==========================================
          RECENT ACTIVITY (Requirement 15)
          Real Appointments & Application Records
      ========================================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              {language === "ta" ? "சமீபத்திய செயல்பாடுகள்" : "Recent Activity"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "ta" ? "உங்கள் நேரடி பதிவுகள் மற்றும் நியமன நிலை" : "Your registered appointments and queue interactions"}
            </p>
          </div>
          <Link
            to="/citizen/appointments"
            className="text-xs font-bold text-[#0b3b60] hover:underline"
          >
            {language === "ta" ? "அனைத்தையும் பார்க்க" : "View All"}
          </Link>
        </div>

        {appointments.length === 0 && applications.length === 0 ? (
          <EmptyState
            title="No recent activity found"
            description="You have no upcoming appointments or active service requests at this office."
            actionText="Browse Government Services"
            actionLink="/services"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 4).map((appt) => (
              <div
                key={appt._id}
                className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {tServiceName(appt.service?.name)}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span>{tDeptName(appt.department?.name)}</span>
                    <span>•</span>
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString(
                        language === "ta" ? "ta-IN" : "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      {appt.appointmentTime || "10:00 AM"}
                    </span>
                  </div>
                </div>

                <div>
                  {(appt.status === "booked" || appt.status === "confirmed") && (
                    <button
                      onClick={() => handleCheckIn(appt._id)}
                      disabled={checkInLoading === appt._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0b3b60] hover:bg-[#082a45] disabled:opacity-50 shadow-2xs flex items-center gap-1.5 transition-colors"
                    >
                      {checkInLoading === appt._id ? (
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          token={activeToken}
          service={activeToken?.service}
          department={activeToken?.department}
        />
      )}
    </div>
  );
};

export default CitizenDashboard;
