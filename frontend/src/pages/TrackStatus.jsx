import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { applicationService } from "../services/api";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Ticket,
  Building,
  User,
  Calendar,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const APP_STEPS = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "DOCUMENT_VERIFICATION", label: "Verification" },
  { key: "OFFICER_REVIEW", label: "Officer Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "COMPLETED", label: "Completed" },
];

const TrackStatus = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (searchTerm) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) {
      setError("Please enter a valid Application Number or Token Number.");
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
        setError(res.message || "No record found matching this query.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Record not found. Please double-check your application number or token code."
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-100 text-gov-800 text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            Public Service Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Government Application or Token
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Real-time status tracking for Revenue certificates, Welfare schemes, and Taluk office queue tokens.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-4 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Enter Application No. (APP-2026-...) or Token Code (e.g. REV001)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-600 focus:border-transparent font-medium text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gov-700 hover:bg-gov-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Track Now
            </button>
          </form>

          {/* Quick Examples */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Quick search:</span>
            <button
              type="button"
              onClick={() => {
                setQuery("REV001");
                handleSearch("REV001");
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono"
            >
              REV001
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("APP-2026");
                handleSearch("APP-2026");
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono"
            >
              APP-2026-Demo
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results */}
        {result && (
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-8">
            {/* Type Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                    result.type === "application"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {result.type === "application" ? (
                    <FileText className="w-7 h-7" />
                  ) : (
                    <Ticket className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    {result.type === "application"
                      ? "Official Service Application"
                      : "Live Taluk Queue Token"}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 font-mono">
                    {result.data?.applicationNumber || result.data?.tokenDisplay}
                  </h2>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.data?.status === "COMPLETED" || result.data?.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : result.data?.status === "REJECTED" || result.data?.status === "CANCELLED"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {result.data?.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Stepper if Application */}
            {result.type === "application" && (
              <div className="py-4">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-100 z-0"></div>
                  {APP_STEPS.map((step, idx) => {
                    const status = getStepStatus(result.data?.status, step.key);
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            status === "completed"
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-50"
                              : status === "current"
                              ? "bg-gov-700 text-white shadow-md ring-4 ring-gov-50 animate-pulse"
                              : status === "error"
                              ? "bg-rose-600 text-white shadow-md ring-4 ring-rose-50"
                              : "bg-white text-slate-400 border-2 border-slate-200"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : status === "error" ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 mt-2 text-center">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Department</span>
                <p className="text-sm font-bold text-slate-800">
                  {result.data?.department?.name || "General Administration"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Service</span>
                <p className="text-sm font-bold text-slate-800">
                  {result.data?.service?.name || "Taluk Service"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Citizen</span>
                <p className="text-sm font-bold text-slate-800">
                  {result.data?.citizen?.fullName || "Citizen"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Last Updated</span>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(result.data?.updatedAt || result.data?.createdAt).toLocaleString()}
                </p>
              </div>

              {result.type === "token" && result.data?.counter && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Assigned Counter</span>
                  <p className="text-sm font-bold text-gov-700">
                    {result.data?.counter?.name} (#{result.data?.counter?.counterNumber})
                  </p>
                </div>
              )}

              {result.data?.expectedCompletionDate && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">
                    Expected Completion
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(result.data?.expectedCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Officer Remarks or Next Action */}
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                Next Recommended Citizen Action:
              </h4>
              <p className="text-sm text-indigo-800">
                {result.data?.status === "DOCUMENT_VERIFICATION"
                  ? "Your application is currently undergoing document scrutiny by the taluk desk. You will be notified once verified."
                  : result.data?.status === "APPROVED"
                  ? "Your application has been approved by the Taluk Officer! Certificate is ready for dispatch/collection."
                  : result.data?.status === "REJECTED"
                  ? `Application was rejected. Reason: ${result.data?.rejectionReason || "Criteria not met"}`
                  : result.type === "token" && result.data?.status === "called"
                  ? `Please proceed immediately to ${result.data?.counter?.name || "your assigned counter"}.`
                  : "Keep your application tracking ID for reference. You will receive updates via SMS and Citizen Portal."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackStatus;
