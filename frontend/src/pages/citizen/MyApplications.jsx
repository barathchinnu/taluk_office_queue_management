import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applicationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useGeoLocation } from "../../context/LocationContext";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Upload,
  Calendar,
  Building2,
  Search,
  Filter,
  Printer,
  Copy,
  Check,
  Eye,
  X,
  RefreshCw,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Download,
  QrCode,
  Sparkles,
  Info,
  MapPin,
  FolderOpen,
} from "lucide-react";

// Stage definition for 4-step progress stepper
const getProgressStep = (status) => {
  switch (status) {
    case "SUBMITTED":
      return 1;
    case "DOCUMENT_VERIFICATION":
      return 2;
    case "OFFICER_REVIEW":
    case "ADDITIONAL_INFO_REQUIRED":
      return 3;
    case "APPROVED":
    case "COMPLETED":
      return 4;
    case "REJECTED":
    case "CANCELLED":
      return -1;
    default:
      return 1;
  }
};

const getStatusBadgeConfig = (status) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-500",
        label: "Approved & Ready",
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50 text-rose-800 border-rose-200",
        dot: "bg-rose-500",
        label: "Rejected",
      };
    case "CANCELLED":
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-300",
        dot: "bg-slate-400",
        label: "Cancelled",
      };
    case "ADDITIONAL_INFO_REQUIRED":
      return {
        bg: "bg-amber-50 text-amber-900 border-amber-300 animate-pulse",
        dot: "bg-amber-500",
        label: "Action Needed: Docs Required",
      };
    case "OFFICER_REVIEW":
      return {
        bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
        dot: "bg-indigo-500",
        label: "Officer Review",
      };
    case "DOCUMENT_VERIFICATION":
      return {
        bg: "bg-blue-50 text-blue-800 border-blue-200",
        dot: "bg-blue-500",
        label: "Document Verification",
      };
    case "SUBMITTED":
    default:
      return {
        bg: "bg-sky-50 text-sky-800 border-sky-200",
        dot: "bg-sky-500",
        label: "Application Submitted",
      };
  }
};

const MyApplications = () => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const { officeName, breadcrumb } = useGeoLocation();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | IN_PROGRESS | ACTION_REQUIRED | APPROVED | REJECTED
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST | OLDEST | SLA

  // Modals
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [selectedAppForSlip, setSelectedAppForSlip] = useState(null);
  const [uploadModalApp, setUploadModalApp] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("Identity Proof (Aadhaar / Voter ID)");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedAppId, setCopiedAppId] = useState(null);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const res = await applicationService.getMy();
      if (res && res.success) {
        // Handle both res.applications and res.data
        const apps = res.applications || res.data || [];
        setApplications(apps);
      } else if (Array.isArray(res)) {
        setApplications(res);
      }
    } catch (err) {
      console.error("Failed to load citizen applications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [isAuthenticated]);

  const copyToClipboard = (text, appId) => {
    navigator.clipboard.writeText(text);
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const handleUploadAdditionalDoc = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !uploadModalApp) return;

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      // Send both field names for maximum middleware compatibility
      formData.append("document", fileToUpload);
      formData.append("file", fileToUpload);
      formData.append("documentType", uploadDocType);

      await applicationService.uploadDocument(uploadModalApp._id, formData);
      setUploadModalApp(null);
      setFileToUpload(null);
      fetchApplications();
    } catch (err) {
      console.error("Failed to upload additional document:", err);
      setUploadError(
        err.response?.data?.message || "Failed to upload document. Please ensure file is PDF/JPG/PNG under 10MB."
      );
    } finally {
      setUploading(false);
    }
  };

  // Stats Counters
  const stats = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter((a) =>
      ["SUBMITTED", "DOCUMENT_VERIFICATION", "OFFICER_REVIEW"].includes(a.status)
    ).length;
    const actionRequired = applications.filter(
      (a) => a.status === "ADDITIONAL_INFO_REQUIRED"
    ).length;
    const approved = applications.filter((a) =>
      ["APPROVED", "COMPLETED"].includes(a.status)
    ).length;
    const rejected = applications.filter((a) =>
      ["REJECTED", "CANCELLED"].includes(a.status)
    ).length;

    return { total, inReview, actionRequired, approved, rejected };
  }, [applications]);

  // Unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const depts = new Set();
    applications.forEach((a) => {
      if (a.department?.name) depts.add(a.department.name);
    });
    return Array.from(depts);
  }, [applications]);

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status Filter
        if (statusFilter === "IN_PROGRESS") {
          if (!["SUBMITTED", "DOCUMENT_VERIFICATION", "OFFICER_REVIEW"].includes(app.status))
            return false;
        } else if (statusFilter === "ACTION_REQUIRED") {
          if (app.status !== "ADDITIONAL_INFO_REQUIRED") return false;
        } else if (statusFilter === "APPROVED") {
          if (!["APPROVED", "COMPLETED"].includes(app.status)) return false;
        } else if (statusFilter === "REJECTED") {
          if (!["REJECTED", "CANCELLED"].includes(app.status)) return false;
        }

        // Department Filter
        if (selectedDept !== "ALL" && app.department?.name !== selectedDept) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchAppNum = app.applicationNumber?.toLowerCase().includes(q);
          const matchService = app.service?.name?.toLowerCase().includes(q);
          const matchDept = app.department?.name?.toLowerCase().includes(q);
          const matchTaluk = app.taluk?.toLowerCase().includes(q) || app.office?.name?.toLowerCase().includes(q);
          const matchRemarks = app.remarks?.toLowerCase().includes(q);
          return matchAppNum || matchService || matchDept || matchTaluk || matchRemarks;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "OLDEST") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "SLA") {
          const dateA = a.expectedCompletionDate ? new Date(a.expectedCompletionDate) : new Date(8640000000000000);
          const dateB = b.expectedCompletionDate ? new Date(b.expectedCompletionDate) : new Date(8640000000000000);
          return dateA - dateB;
        }
        return 0;
      });
  }, [applications, statusFilter, selectedDept, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Tricolor Accent Line */}
      <div className="h-1.5 w-full flex rounded-full overflow-hidden shadow-xs">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-slate-200"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gov-700 to-gov-900 text-white flex items-center justify-center shrink-0 shadow-md border border-white/20">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gov-100 text-gov-800">
                Tamil Nadu Citizen Services
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium">e-Governance Tracking Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Government Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time tracking, document verification updates, and official digital acknowledgement slips
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchApplications}
            disabled={refreshing}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
            title="Refresh application status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-gov-700" : ""}`} />
          </button>

          <Link
            to="/citizen/profile"
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-slate-200 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-gov-700" />
            Citizen Profile
          </Link>

          <Link
            to="/citizen/apply"
            className="px-5 py-3 bg-gov-700 hover:bg-gov-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            New Application
          </Link>
        </div>
      </div>

      {/* Stats Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "ALL"
              ? "bg-gov-50 border-gov-500 shadow-xs ring-2 ring-gov-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            All Applications
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "IN_PROGRESS"
              ? "bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Under Review
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black text-blue-800">{stats.inReview}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Action Required */}
        <button
          type="button"
          onClick={() => setStatusFilter("ACTION_REQUIRED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "ACTION_REQUIRED"
              ? "bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Action Required
            </span>
            {stats.actionRequired > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black text-amber-700">{stats.actionRequired}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Approved */}
        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "APPROVED"
              ? "bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Approved & Ready
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black text-emerald-700">{stats.approved}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Rejected */}
        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "REJECTED"
              ? "bg-rose-50 border-rose-500 shadow-xs ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Rejected
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black text-rose-700">{stats.rejected}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Search, Filter Tabs & Sort Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Application Number (e.g. TN-AMB-REV-...), Service Name, Department, Taluk..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-gov-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department & Sort Filter Selectors */}
          <div className="flex items-center gap-3 shrink-0">
            {departmentOptions.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-gov-500"
              >
                <option value="ALL">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-gov-500"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="SLA">SLA Deadline First</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {[
            { id: "ALL", label: "All Submissions" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "ACTION_REQUIRED", label: "Action Required" },
            { id: "APPROVED", label: "Approved / Issued" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-gov-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto font-medium pl-2">
            Showing {filteredApplications.length} of {applications.length}
          </span>
        </div>
      </div>

      {/* Content Applications List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gov-200 border-t-gov-700 mx-auto"></div>
          <h3 className="text-base font-bold text-slate-800">Retrieving Government Applications...</h3>
          <p className="text-xs text-slate-400">Connecting to Tamil Nadu e-Governance database</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {searchQuery || statusFilter !== "ALL"
              ? "No Matching Applications Found"
              : "No Government Applications Submitted Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Try resetting your search query or switching the status filter tab to view other applications."
              : "Apply online for Community, Income, Nativity certificates, Patta transfers, and more to bypass Taluk physical queues!"}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {searchQuery || statusFilter !== "ALL" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setSelectedDept("ALL");
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            ) : (
              <Link
                to="/citizen/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                Apply for New Service
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const badge = getStatusBadgeConfig(app.status);
            const currentStep = getProgressStep(app.status);

            return (
              <div
                key={app._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Top Card Row: Application #, Priority, Status Badge, SLA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Copyable Application Number */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs font-black text-gov-800">
                      <span>{app.applicationNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(app.applicationNumber, app._id)}
                        className="text-slate-400 hover:text-gov-700 transition-colors p-0.5"
                        title="Copy Application Number"
                      >
                        {copiedAppId === app._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>

                    {/* Priority Type */}
                    {app.priorityType && app.priorityType !== "NORMAL" && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {app.priorityType.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  {/* Submission date & SLA completion */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Applied: <strong>{new Date(app.createdAt).toLocaleDateString()}</strong>
                    </span>
                    {app.expectedCompletionDate && (
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        SLA Due:{" "}
                        <strong className="text-slate-900">
                          {new Date(app.expectedCompletionDate).toLocaleDateString()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Service Name, Taluk Office, Department */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                      {app.service?.name || "Government Revenue Service"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Jurisdiction Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-gov-800 bg-gov-50/80 border border-gov-200/80 px-3 py-1 rounded-xl">
                        <Landmark className="w-3.5 h-3.5 text-gov-700 shrink-0" />
                        <span className="font-bold">
                          {app.office?.name ||
                            (app.taluk ? `${app.taluk} Taluk Office` : "Taluk Administrative Office")}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-medium">
                          {app.district ? `${app.district} District` : "Tamil Nadu"}
                        </span>
                      </div>

                      {/* Department */}
                      <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-medium">
                        Dept: <strong>{app.department?.name || "Revenue & Disaster Management"}</strong>
                      </span>

                      {/* Fee Badge if any */}
                      {app.service?.fee !== undefined && (
                        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-medium">
                          Fee: <strong>{app.service.fee === 0 ? "Free Service" : `₹${app.service.fee}`}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button Group */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedAppForDetails(app)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      Details
                    </button>

                    <Link
                      to={`/track?q=${app.applicationNumber}`}
                      className="px-3.5 py-2 bg-gov-50 hover:bg-gov-100 text-gov-800 text-xs font-bold rounded-xl border border-gov-200 transition-all flex items-center gap-1.5"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gov-700" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedAppForSlip(app)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
                      title="Download or Print Official Government Acknowledgement Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      e-Slip
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadModalApp(app)}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Attach Proof
                    </button>
                  </div>
                </div>

                {/* 4-Stage Visual Workflow Stepper (Unless rejected) */}
                {app.status !== "REJECTED" && app.status !== "CANCELLED" ? (
                  <div className="pt-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Workflow Stage: {currentStep} of 4</span>
                        <span className="text-gov-700 font-extrabold">
                          {currentStep === 1
                            ? "1. Received at Front Desk"
                            : currentStep === 2
                            ? "2. Scrutiny & Document Check"
                            : currentStep === 3
                            ? "3. Officer Review / Field Inquiry"
                            : "4. Approved & Digital Certificate Issued"}
                        </span>
                      </div>

                      {/* Stepper Progress Bar */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {[
                          { step: 1, title: "Submitted" },
                          { step: 2, title: "Doc Verification" },
                          { step: 3, title: "Officer Review" },
                          { step: 4, title: "Approved" },
                        ].map((s) => {
                          const isDone = currentStep > s.step;
                          const isCurrent = currentStep === s.step;

                          return (
                            <div key={s.step} className="space-y-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isDone
                                    ? "bg-emerald-500"
                                    : isCurrent
                                    ? "bg-gov-700 animate-pulse"
                                    : "bg-slate-200"
                                }`}
                              ></div>
                              <span
                                className={`text-[10px] font-bold block truncate ${
                                  isCurrent
                                    ? "text-gov-800"
                                    : isDone
                                    ? "text-emerald-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {s.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Application Closed / Rejected</strong>
                      <span>
                        {app.rejectionReason ||
                          app.remarks ||
                          "Documentation criteria could not be verified by the designated Revenue Inspector."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Officer Remarks Banner (If action required or remarks present) */}
                {app.remarks && app.status !== "REJECTED" && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      app.status === "ADDITIONAL_INFO_REQUIRED"
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <Info
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        app.status === "ADDITIONAL_INFO_REQUIRED"
                          ? "text-amber-600"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="flex-1">
                      <strong className="font-bold block">
                        {app.status === "ADDITIONAL_INFO_REQUIRED"
                          ? "Action Required from Citizen:"
                          : "Officer Status Note:"}
                      </strong>
                      <p className="mt-0.5 text-xs">{app.remarks}</p>
                    </div>
                    {app.status === "ADDITIONAL_INFO_REQUIRED" && (
                      <button
                        type="button"
                        onClick={() => setUploadModalApp(app)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs shrink-0 shadow-xs"
                      >
                        Upload Now
                      </button>
                    )}
                  </div>
                )}

                {/* Uploaded Documents List */}
                {app.documents && app.documents.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">Attached Proofs:</span>
                    {app.documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                      >
                        <FileText className="w-3 h-3 text-gov-700" />
                        <span>{doc.documentType || "Supporting Document"}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                            doc.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.verificationStatus === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.verificationStatus || "PENDING"}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL 1: APPLICATION DETAILED VIEW & TIMELINE
         ======================================================== */}
      {selectedAppForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gov-800 bg-gov-100 px-2.5 py-0.5 rounded-full">
                  Application Dossier
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedAppForDetails.applicationNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppForDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service & Office Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block">
                  Service Requested
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedAppForDetails.service?.name || "Revenue Service"}
                </p>
                <p className="text-slate-600">
                  Dept: {selectedAppForDetails.department?.name || "Revenue"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block">
                  Jurisdiction Taluk Office
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedAppForDetails.office?.name ||
                    `${selectedAppForDetails.taluk || "Taluk"} Office`}
                </p>
                <p className="text-slate-600">
                  District: {selectedAppForDetails.district || "Tamil Nadu"}
                </p>
              </div>
            </div>

            {/* Applicant Details */}
            <div className="p-4 rounded-2xl bg-gov-50/70 border border-gov-200 space-y-2 text-xs">
              <span className="text-gov-800 uppercase font-black tracking-wider text-[10px] block">
                Applicant Information
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Name:</span>
                  <strong>{selectedAppForDetails.applicantName || user?.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Phone:</span>
                  <strong>{selectedAppForDetails.applicantPhone || user?.phone || "Registered"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Email:</span>
                  <strong className="truncate block">
                    {selectedAppForDetails.applicantEmail || user?.email}
                  </strong>
                </div>
              </div>
              {selectedAppForDetails.applicantAddress && (
                <div className="pt-1 text-slate-700">
                  <span className="text-slate-500 text-[11px] block">Address:</span>
                  <span>{selectedAppForDetails.applicantAddress}</span>
                </div>
              )}
            </div>

            {/* Document Checklist in this application */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Supporting Verification Documents
              </h4>
              {selectedAppForDetails.documents && selectedAppForDetails.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedAppForDetails.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-gov-700" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.documentType}</p>
                          <span className="text-[10px] text-slate-400">
                            Uploaded on {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          doc.verificationStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.verificationStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.verificationStatus || "PENDING"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No supporting files attached yet.</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAppForSlip(selectedAppForDetails);
                  setSelectedAppForDetails(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gov-50 text-gov-800 hover:bg-gov-100 border border-gov-200 flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                View Printable Acknowledgement
              </button>

              <button
                type="button"
                onClick={() => setSelectedAppForDetails(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: PRINTABLE OFFICIAL GOVERNMENT ACKNOWLEDGEMENT SLIP
         ======================================================== */}
      {selectedAppForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-300 p-6 sm:p-8 space-y-6 print:m-0 print:p-4 print:shadow-none">
            {/* Action Bar (Hidden when printed) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-black uppercase text-gov-800 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-gov-700" />
                Official e-Governance Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAppForSlip(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 bg-white text-slate-900">
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  GOVERNMENT OF TAMIL NADU • தமிழ்நாடு அரசு
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
                  REVENUE & DISASTER MANAGEMENT DEPARTMENT
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  CITIZEN SERVICE APPLICATION ACKNOWLEDGEMENT SLIP (விண்ணப்ப ஏற்புச் சீட்டு)
                </p>
              </div>

              {/* Barcode & Reference Row */}
              <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-300 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Application Reference No
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    {selectedAppForSlip.applicationNumber}
                  </span>
                </div>
                <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>

              {/* Table Meta */}
              <div className="text-xs space-y-2.5 divide-y divide-slate-200">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Applicant Full Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAppForSlip.applicantName || user?.fullName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Service Requested:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAppForSlip.service?.name}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Administrative Office:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAppForSlip.office?.name || `${selectedAppForSlip.taluk || "Taluk"} Office`}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Jurisdiction District:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAppForSlip.district || "Tamil Nadu"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Submission Timestamp:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {new Date(selectedAppForSlip.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Statutory SLA Target Date:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedAppForSlip.expectedCompletionDate
                      ? new Date(selectedAppForSlip.expectedCompletionDate).toLocaleDateString()
                      : "Within 3 Business Days"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Portal Application Status:</span>
                  <span className="font-bold uppercase tracking-wider text-slate-900">
                    {selectedAppForSlip.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Fee Received:</span>
                  <span className="font-bold text-slate-900">
                    {selectedAppForSlip.service?.fee ? `₹${selectedAppForSlip.service.fee}.00` : "₹0.00 (Exempted)"}
                  </span>
                </div>
              </div>

              {/* Disclaimer & Digital Seal */}
              <div className="pt-4 border-t-2 border-slate-800 text-[10px] text-slate-500 space-y-1 text-center">
                <p>
                  * This is a digitally signed computer-generated acknowledgement under Section 6 of IT Act 2000.
                </p>
                <p>
                  Track progress anytime at: <strong>https://tne-seva.tn.gov.in/track</strong> or scan QR code.
                </p>
                <div className="pt-3 font-mono font-bold text-slate-700 uppercase tracking-widest text-[9px]">
                  DIGITALLY CERTIFIED BY TALUK REVENUE e-SYSTEMS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: UPLOAD ADDITIONAL SUPPORTING DOCUMENT
         ======================================================== */}
      {uploadModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gov-100 text-gov-800 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Attach Supporting Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Uploading supporting proof for application{" "}
              <strong className="text-gov-800">{uploadModalApp.applicationNumber}</strong>
            </p>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadAdditionalDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Document Category
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-gov-500 focus:outline-hidden"
                >
                  <option value="Aadhaar Card (e-KYC Proof)">Aadhaar Card (e-KYC Proof)</option>
                  <option value="Smart Family Ration Card">Smart Family Ration Card</option>
                  <option value="Salary Slip / Income Certificate">Salary Slip / Income Certificate</option>
                  <option value="Land Patta / Chitta Copy">Land Patta / Chitta Copy</option>
                  <option value="Self Declaration / Legal Heir Affidavit">
                    Self Declaration / Legal Heir Affidavit
                  </option>
                  <option value="Birth / Community Certificate">Birth / Community Certificate</option>
                  <option value="Other Official Proof">Other Official Proof</option>
                </select>
              </div>

              {/* Drag & Drop File Input */}
              <div className="border-2 border-dashed border-slate-200 hover:border-gov-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-gov-700 mx-auto" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-gov-700">Choose file</span> or drag & drop here
                </div>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gov-100 file:text-gov-800 hover:file:bg-gov-200 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Accepted: PDF, PNG, JPG (Max 10MB)</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !fileToUpload}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Document</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
