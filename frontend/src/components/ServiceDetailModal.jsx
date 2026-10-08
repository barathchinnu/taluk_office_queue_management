import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import {
  X,
  FileCheck2,
  Clock,
  Calendar,
  IndianRupee,
  MapPin,
  Lock,
  ArrowRight,
  Ticket,
  UserCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
} from "lucide-react";

/**
 * ServiceDetailModal
 * Displays comprehensive details for any selected Tamil Nadu Government Service:
 * - What are the required documents needed (checklist with verification status)
 * - Service duration, government fee, and resolution days
 * - Unauthenticated: "Login to Book Token" callout + direct login redirection
 * - Authenticated: Direct action buttons to Take Walk-in Token or Book Appointment
 */
const ServiceDetailModal = ({ service, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const { language, tServiceName, tDeptName } = useLanguage();
  const { officeName, selectedLocation } = useGeoLocation();
  const navigate = useNavigate();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!service) return null;

  const deptId =
    service.department?._id ||
    (typeof service.department === "string" ? service.department : "") ||
    "";
  const deptName = service.department?.name || "Taluk Administration";

  // Required documents array with fallback if empty
  const documents =
    Array.isArray(service.requiredDocuments) && service.requiredDocuments.length > 0
      ? service.requiredDocuments
      : [
          "Aadhaar Card (Original + Photocopy)",
          "Smart Family Ration Card / Proof of Residence",
          "Recent Passport Size Photographs (2 Nos)",
          "Self Declaration Affidavit / Duly Filled Application Form",
        ];

  // Duration in minutes
  const duration =
    service.averageServiceTime ||
    service.estimatedDuration ||
    10;

  // Government fee display
  const feeText =
    service.fee === 0 || service.fee === "0"
      ? language === "ta"
        ? "இலவசம் (₹0)"
        : "Free (₹0 Govt Fee)"
      : `₹${service.fee}`;

  // Expected resolution days
  const resolutionDays = service.expectedProcessingDays || 3;

  // Handle Login redirect
  const handleLoginToBookToken = () => {
    onClose();
    navigate("/login", {
      state: {
        returnTo: `/citizen/take-token?serviceId=${service._id}&deptId=${deptId}`,
        serviceName: service.name,
      },
    });
  };

  // Handle Register redirect
  const handleRegister = () => {
    onClose();
    navigate("/register");
  };

  // Handle Token redirect (Authenticated)
  const handleTakeToken = () => {
    onClose();
    navigate(`/citizen/take-token?serviceId=${service._id}&deptId=${deptId}`);
  };

  // Handle Appointment redirect (Authenticated)
  const handleBookAppointment = () => {
    onClose();
    navigate(`/citizen/appointments?book=true&serviceId=${service._id}&deptId=${deptId}`);
  };

  // Handle Apply Online redirect (Authenticated)
  const handleApplyOnline = () => {
    onClose();
    navigate(`/citizen/apply?serviceId=${service._id}&deptId=${deptId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==========================================
            MODAL HEADER (Official Tamil Nadu Gov Style)
        ========================================== */}
        <div className="bg-gradient-to-r from-[#0b3b60] via-[#0e4875] to-[#00809d] text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1.5 relative z-10 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-white/20">
                <Building2 className="w-3 h-3" />
                {tDeptName(deptName)}
              </span>
              {service.code && (
                <span className="text-[10px] font-mono bg-black/25 text-slate-200 px-2 py-0.5 rounded border border-white/10">
                  #{service.code}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {tServiceName(service.name)}
            </h2>

            {language === "both" && service.name && (
              <p className="text-xs text-amber-200/90 font-medium">
                {service.name}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-200 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {language === "ta" ? "அலுவலகம்:" : "Designated Office:"}{" "}
                <strong className="text-white font-semibold">{officeName}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==========================================
            MODAL SCROLLABLE BODY
        ========================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Service Description */}
          {service.description && (
            <div>
              <h4 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-1">
                {language === "ta" ? "சேவை விவரம்" : "Service Description"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {service.description}
              </p>
            </div>
          )}

          {/* Quick Metrics (Fee, Duration, Resolution Days) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-slate-500">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === "ta" ? "அரசுக் கட்டணம்" : "Govt Fee"}</span>
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 mt-1 block">
                {feeText}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-slate-500">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "ta" ? "கவுண்டர் நேரம்" : "Counter Time"}</span>
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 mt-1 block">
                ~{duration} {language === "ta" ? "நிமிடங்கள்" : "mins"}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === "ta" ? "வழங்கும் காலம்" : "Resolution"}</span>
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 mt-1 block">
                {resolutionDays} {language === "ta" ? "நாட்கள்" : "Days"}
              </span>
            </div>
          </div>

          {/* ==========================================
              PRIMARY SECTION: REQUIRED DOCUMENTS NEEDED
          ========================================== */}
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-emerald-500/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {language === "ta"
                      ? "தேவையான ஆவணங்கள் (Required Documents Needed)"
                      : "What are the Required Documents Needed?"}
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 mt-1 font-medium">
                  {language === "ta"
                    ? "கீழ்கண்ட அசல் ஆவணங்கள் மற்றும் சுய சான்றொப்பமிட்ட நகல்களுடன் வருகை தரவும்."
                    : "Please carry original documents and 1 set of self-attested photocopies to the counter."}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                {documents.length} {language === "ta" ? "ஆவணங்கள்" : "Documents"}
              </span>
            </div>

            {/* Checklist of required documents */}
            <div className="space-y-2 pt-1">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs hover:border-emerald-400 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    {doc}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {language === "ta"
                  ? "ஆவணங்கள் சரிபார்க்கப்பட்ட பின்னரே வட்டாட்சியர் அலுவலகத்தில் டோக்கன் அழைக்கப்படும்."
                  : "All submitted documents will be officially verified by the Taluk Duty Officer before service sanction."}
              </span>
            </div>
          </div>

          {/* ==========================================
              AUTHENTICATION GATE: LOGIN TO BOOK TOKEN
          ========================================== */}
          {!isAuthenticated ? (
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {language === "ta"
                      ? "டோக்கன் பெற உள்நுழையவும் (Login to Book Token)"
                      : "Login to Book Token / Appointment"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === "ta"
                      ? "இந்த அரசு சேவைக்கு டோக்கன் பெற அல்லது முன்பதிவு செய்ய உங்கள் குடிமக்கள் கணக்கில் உள்நுழைய வேண்டும்."
                      : "You must log in to your Citizen account to generate an official in-person queue token or book an appointment slot."}
                  </p>
                </div>
              </div>

              {/* Login & Register Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleLoginToBookToken}
                  className="w-full py-3 px-4 rounded-xl bg-[#0b3b60] hover:bg-[#07243b] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>{language === "ta" ? "உள்நுழைந்து டோக்கன் பெற" : "Login to Book Token"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleRegister}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#0b3b60]" />
                  <span>{language === "ta" ? "புதிய பயனர் பதிவு" : "New Citizen? Register"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged in state */
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === "ta" ? "குடிமகன் அமர்வு செயலில் உள்ளது:" : "Citizen Session Active:"}{" "}
                  <strong className="text-slate-900 font-bold">
                    {user?.name || user?.email || user?.mobile || "Citizen"}
                  </strong>
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {language === "ta"
                  ? "நீங்கள் உள்நுழைந்துள்ளீர்கள். டோக்கன் பெற அல்லது முன்பதிவு செய்ய கீழே உள்ள பொத்தான்களைப் பயன்படுத்தவும்."
                  : "You are logged in. Choose how you would like to proceed with this service:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={handleTakeToken}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{language === "ta" ? "நேரடி டோக்கன்" : "Take Token"}</span>
                </button>

                <button
                  onClick={handleBookAppointment}
                  className="py-2.5 px-3 rounded-xl bg-[#0b3b60] hover:bg-[#07243b] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>{language === "ta" ? "முன்பதிவு" : "Appointment"}</span>
                </button>

                <button
                  onClick={handleApplyOnline}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#0b3b60]" />
                  <span>{language === "ta" ? "இணைய விண்ணப்பம்" : "Apply Online"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            MODAL FOOTER
        ========================================== */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Government of Tamil Nadu • Citizen Charter
          </span>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors ml-auto cursor-pointer"
          >
            {language === "ta" ? "மூடுக" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;
