import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { applicationService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import StatusBadge from "../components/StatusBadge";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Ticket,
  Building,
  Calendar,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Landmark,
  FileCheck,
} from "lucide-react";

// Requirement 21: Application Stepper Steps
const APP_STEPS = [
  { key: "SUBMITTED", labelEn: "Application Submitted", labelTa: "விண்ணப்பம் சமர்ப்பிக்கப்பட்டது" },
  { key: "DOCUMENT_VERIFICATION", labelEn: "Document Verification", labelTa: "ஆவண சரிபார்ப்பு" },
  { key: "OFFICER_REVIEW", labelEn: "Officer Review", labelTa: "அலுவலர் மறுஆய்வு" },
  { key: "APPROVED", labelEn: "Approved", labelTa: "ஒப்புதல் அளிக்கப்பட்டது" },
  { key: "COMPLETED", labelEn: "Completed", labelTa: "நிறைவு செய்யப்பட்டது" },
];

const TrackStatus = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const { officeName } = useGeoLocation();

  const handleSearch = async (searchTerm) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) {
      setError(
        language === "ta"
          ? "தயவுசெய்து சரியான விண்ணப்ப எண் அல்லது டோக்கன் எண்ணை உள்ளிடவும்."
          : "Please enter a valid Application Number or Token Code."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await applicationService.track(q);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || "No government record found matching this reference code.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Record not found. Please verify your reference number (e.g. TN-POL-REV-2026-000123)."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, [queryParam]);

  const getStepStatus = (currentStatus, stepKey) => {
    if (currentStatus === "REJECTED") {
      return stepKey === "OFFICER_REVIEW" ? "error" : "pending";
    }

    const order = [
      "DRAFT",
      "SUBMITTED",
      "DOCUMENT_VERIFICATION",
      "OFFICER_REVIEW",
      "ADDITIONAL_INFO_REQUIRED",
      "APPROVED",
      "COMPLETED",
    ];

    const curIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (curIndex >= stepIndex) return "completed";
    if (curIndex === stepIndex - 1) return "current";
    return "pending";
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Government Title Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0b3b60] text-xs font-extrabold uppercase tracking-wider border border-blue-200">
          <Landmark className="w-3.5 h-3.5" />
          <span>
            {language === "ta"
              ? "தமிழ்நாடு அரசு • விண்ணப்ப கண்காணிப்பு பணியகம்"
              : "Tamil Nadu Government • Application Tracking Portal"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {language === "ta"
            ? "அரசு விண்ணப்பம் மற்றும் டோக்கன் கண்காணிப்பு"
            : "Track Government Application or Token"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          {language === "ta"
            ? "உங்கள் விண்ணப்ப எண் மூலம் தற்போதைய அதிகாரப்பூர்வ நிலையை நிகழ்நேரத்தில் தெரிந்து கொள்ளலாம்."
            : "Enter your reference number (e.g. TN-POL-REV-2026-000123) or queue token number to verify real-time status."}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. TN-POL-REV-2026-000123 or REV001"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] text-sm font-medium transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0b3b60] hover:bg-[#082a45] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{language === "ta" ? "கண்காணிக்க" : "Track Status"}</span>
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Quick samples:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("REV001");
              handleSearch("REV001");
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-xs border border-slate-200"
          >
            REV001
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("APP-2026");
              handleSearch("APP-2026");
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-xs border border-slate-200"
          >
            APP-2026-Demo
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-xs sm:text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Result Display */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  result.type === "application"
                    ? "bg-blue-50 text-[#0b3b60] border border-blue-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {result.type === "application" ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <Ticket className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  {result.type === "application"
                    ? "Government Service Application"
                    : "Queue Token Ticket"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {result.data?.applicationNumber || result.data?.tokenDisplay}
                </h2>
              </div>
            </div>

            <StatusBadge status={result.data?.status || "SUBMITTED"} />
          </div>

          {/* Stepper Timeline for Applications (Requirement 21) */}
          {result.type === "application" && (
            <div className="py-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 font-heading">
                {language === "ta" ? "விண்ணப்ப செயல்முறை படிகள்" : "Application Progress Steps"}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {APP_STEPS.map((step, idx) => {
                  const status = getStepStatus(result.data?.status, step.key);
                  const isCompleted = status === "completed";
                  const isCurrent = status === "current";
                  const isError = status === "error";

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? "border-[#0b3b60] bg-blue-50/80 shadow-2xs"
                          : isCompleted
                          ? "border-emerald-200 bg-emerald-50/50"
                          : isError
                          ? "border-rose-200 bg-rose-50/50"
                          : "border-slate-200 bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-[#0b3b60] text-white ring-2 ring-blue-300"
                            : isError
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? "✓" : isError ? "✕" : idx + 1}
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {language === "ta" ? step.labelTa : step.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rejection Alert if Rejected (Requirement 21) */}
          {result.data?.status === "REJECTED" && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Application Rejected by Reviewing Officer</span>
              </div>
              <p>
                Reason:{" "}
                <strong>
                  {result.data?.rejectionReason || "Required documentation or eligibility criteria not met."}
                </strong>
              </p>
            </div>
          )}

          {/* Details Grid (Requirement 26 Privacy Compliant: No personal PII) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-slate-400">Department</span>
              <p className="font-bold text-slate-900 text-sm">
                {result.data?.department?.name || "Revenue & Disaster Management"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-400">Government Jurisdiction</span>
              <p className="font-bold text-[#0b3b60] text-sm">
                {result.data?.office?.name ||
                  (result.data?.taluk
                    ? `${result.data.taluk} Taluk Office`
                    : `${officeName || "Pollachi Taluk Office"}`)}
                {result.data?.district ? ` (${result.data.district})` : ""}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-400">Service Name</span>
              <p className="font-bold text-slate-900">
                {result.data?.service?.name || "Certificate / Scheme Verification"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-400">Applicant Status</span>
              <p className="font-bold text-slate-800">
                Verified Citizen (Confidential Record)
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-400">Last Official Update</span>
              <p className="font-medium text-slate-700">
                {new Date(result.data?.updatedAt || result.data?.createdAt).toLocaleString()}
              </p>
            </div>

            {result.type === "token" && result.data?.counter && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-400">Assigned Counter Desk</span>
                <p className="font-bold text-[#0b3b60]">
                  {result.data?.counter?.name} (#{result.data?.counter?.counterNumber})
                </p>
              </div>
            )}
          </div>

          {/* Next Recommended Citizen Action */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1 text-xs">
            <h4 className="font-bold text-[#0b3b60] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0b3b60]" />
              Official Processing Advice:
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {result.data?.status === "DOCUMENT_VERIFICATION"
                ? "Your submitted documents are undergoing verification at the jurisdictional taluk desk."
                : result.data?.status === "APPROVED"
                ? "Your request has been approved! The digital certificate / acknowledgement is ready."
                : result.data?.status === "REJECTED"
                ? "Please submit a new request with updated documents or visit the taluk grievance desk."
                : result.type === "token" && result.data?.status === "called"
                ? `Your token has been called! Please proceed immediately to ${result.data?.counter?.name || "your counter"}.`
                : "Keep your application tracking ID for future inquiry. Notification updates will be sent via SMS."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackStatus;
