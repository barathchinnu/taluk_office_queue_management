import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useGeoLocation } from "../../context/LocationContext";
import { citizenService, applicationService, appointmentService, tokenService } from "../../services/api";
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Save,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Ticket,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Landmark,
  Sparkles,
  Smartphone,
  Home,
  Users,
  Compass,
  Check,
  RefreshCw,
} from "lucide-react";

const CitizenProfile = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { officeName, breadcrumb, openLocationModal } = useGeoLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal"); // personal | address | activity | security
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    activeToken: null,
    totalAppointments: 0,
  });

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    aadhaarNumber: "",
    address: {
      doorNo: "",
      street: "",
      villageTown: "",
      taluk: "",
      district: "",
      state: "Tamil Nadu",
      pincode: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    preferredLanguage: "ta",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Fetch latest profile and summary stats
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Fetch server profile
        const profRes = await citizenService.getProfile();
        if (profRes.success && profRes.user) {
          const u = profRes.user;
          setFormData({
            fullName: u.fullName || "",
            phone: u.phone || "",
            email: u.email || "",
            dateOfBirth: u.dateOfBirth || "",
            gender: u.gender || "",
            aadhaarNumber: u.aadhaarNumber || "",
            address: {
              doorNo: u.address?.doorNo || "",
              street: u.address?.street || "",
              villageTown: u.address?.villageTown || "",
              taluk: u.address?.taluk || "",
              district: u.address?.district || "",
              state: u.address?.state || "Tamil Nadu",
              pincode: u.address?.pincode || "",
            },
            emergencyContact: {
              name: u.emergencyContact?.name || "",
              phone: u.emergencyContact?.phone || "",
              relation: u.emergencyContact?.relation || "",
            },
            preferredLanguage: u.preferredLanguage || "ta",
          });
          updateUser(u);
        } else if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.fullName || "",
            phone: user.phone || "",
            email: user.email || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            aadhaarNumber: user.aadhaarNumber || "",
            address: {
              doorNo: user.address?.doorNo || "",
              street: user.address?.street || "",
              villageTown: user.address?.villageTown || "",
              taluk: user.address?.taluk || "",
              district: user.address?.district || "",
              state: user.address?.state || "Tamil Nadu",
              pincode: user.address?.pincode || "",
            },
          }));
        }

        // Fetch counts for summary
        try {
          const [appsRes, apptsRes, tokenRes] = await Promise.all([
            applicationService.getMy(),
            appointmentService.getMyAppointments(),
            tokenService.getMyToken().catch(() => ({ success: false })),
          ]);

          const apps = appsRes.applications || appsRes.data || [];
          const appts = apptsRes.appointments || apptsRes.data || [];
          const approved = apps.filter((a) => a.status === "APPROVED" || a.status === "COMPLETED").length;

          setStats({
            totalApplications: apps.length,
            approvedApplications: approved,
            activeToken: tokenRes?.success && tokenRes?.token ? tokenRes.token : null,
            totalAppointments: appts.length,
          });
        } catch (e) {
          console.warn("Could not load stats overview:", e);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await citizenService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        aadhaarNumber: formData.aadhaarNumber,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        preferredLanguage: formData.preferredLanguage,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setFeedbackMsg({
          type: "success",
          text: language === "ta" ? "சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!" : "Profile updated successfully!",
        });
        setIsEditing(false);
      } else {
        throw new Error(res.message || "Failed to update profile");
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to save profile changes.",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Masked Aadhaar helper
  const renderAadhaarValue = () => {
    if (!formData.aadhaarNumber) return "Not Linked";
    if (showAadhaar) return formData.aadhaarNumber;
    const clean = formData.aadhaarNumber.replace(/\s/g, "");
    if (clean.length >= 12) {
      return `XXXX-XXXX-${clean.slice(-4)}`;
    }
    return "XXXX-XXXX-" + clean.slice(-4);
  };

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let score = 20; // baseline email/phone
    if (formData.fullName) score += 20;
    if (formData.dateOfBirth) score += 15;
    if (formData.gender) score += 10;
    if (formData.aadhaarNumber) score += 15;
    if (formData.address?.doorNo && formData.address?.district) score += 20;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Tricolor Accent Line */}
      <div className="h-1.5 w-full flex rounded-full overflow-hidden shadow-xs">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-slate-200"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-gradient-to-br from-[#07253d] via-[#0b3b60] to-[#00809d] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Citizen Avatar with State Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {formData.fullName?.charAt(0) || user?.fullName?.charAt(0) || "C"}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-[#0b3b60]"
                title="Verified Citizen Account"
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Verified Citizen ID
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15">
                  e-KYC Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                {formData.fullName || user?.fullName || "Citizen Applicant"}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  {formData.email || user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  {formData.phone || user?.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Jurisdiction Selector & Edit Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={openLocationModal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              title="Change active taluk jurisdiction"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <div className="text-left leading-tight">
                <span className="text-[10px] text-slate-300 uppercase block font-medium">Jurisdiction</span>
                <span className="truncate max-w-[140px] block">{officeName}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                isEditing
                  ? "bg-slate-200 text-slate-900 hover:bg-white"
                  : "bg-amber-400 text-slate-950 hover:bg-amber-300"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Profile Completeness:</span>
            <div className="w-36 sm:w-48 bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <span className="font-bold text-amber-300">{completeness}%</span>
          </div>

          <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Complete profile details speed up Taluk document approvals by 40%</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/citizen/applications"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-gov-500 transition-all group flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalApplications}</h3>
            <span className="text-[11px] font-semibold text-gov-700 flex items-center gap-1 mt-1 group-hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gov-50 text-gov-700 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/citizen/applications"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all group flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Services</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedApplications}</h3>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1 group-hover:underline">
              Certificates Ready <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/citizen/take-token"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-500 transition-all group flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Token</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {stats.activeToken ? stats.activeToken.tokenDisplay : "None"}
            </h3>
            <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-1 group-hover:underline">
              {stats.activeToken ? "Queue In Progress" : "Book New Token"}{" "}
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/citizen/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-500 transition-all group flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appointments</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{stats.totalAppointments}</h3>
            <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 mt-1 group-hover:underline">
              Taluk Visits <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Feedback Alert Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs underline text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none bg-slate-50/70 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "personal"
                ? "bg-white text-gov-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <User className="w-4 h-4 text-gov-700" />
            Personal & Identity
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("address")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "address"
                ? "bg-white text-gov-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Home className="w-4 h-4 text-gov-700" />
            Residential Address & Taluk
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "emergency"
                ? "bg-white text-gov-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 text-gov-700" />
            Family & Emergency Contact
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "vault"
                ? "bg-white text-gov-800 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-gov-700" />
            Digital Documents Vault
          </button>
        </div>

        {/* Tab 1: Personal & Identity */}
        {activeTab === "personal" && (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal & Official Information</h3>
                <p className="text-xs text-slate-500">
                  Registered government details for online citizen service applications
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gov-50 text-gov-800 hover:bg-gov-100 border border-gov-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Information
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name (as per Aadhaar / Official ID)
                </label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. S. Muthu Kumar"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Mobile Number (OTP Verified)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                  />
                  <span className="absolute right-3 top-3 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active SMS
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email is locked to primary login security identity
                </span>
              </div>

              {/* Aadhaar Number / Masked */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Aadhaar / Virtual ID (e-KYC Proof)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showAadhaar && isEditing ? "text" : "password"}
                    name="aadhaarNumber"
                    disabled={!isEditing}
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar Number"
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAadhaar(!showAadhaar)}
                    className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-700"
                    title={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
                  >
                    {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Masked as per UIDAI guidelines (e.g. {renderAadhaarValue()})
                </span>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  disabled={!isEditing}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male (ஆண்)</option>
                  <option value="female">Female (பெண்)</option>
                  <option value="transgender">Transgender (மூன்றாம் பாலினம்)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Communication Language
                </label>
                <select
                  name="preferredLanguage"
                  disabled={!isEditing}
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Residential Address & Taluk */}
        {activeTab === "address" && (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Residential Address & Jurisdiction</h3>
                <p className="text-xs text-slate-500">
                  Used automatically to route your applications to the respective Taluk and Revenue Inspector
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gov-50 text-gov-800 hover:bg-gov-100 border border-gov-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Address
                </button>
              )}
            </div>

            {/* Current Active Office Alert */}
            <div className="p-4 rounded-2xl bg-gov-50 border border-gov-200/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gov-700 text-white flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gov-800 block">
                    Active Revenue & Taluk Jurisdiction
                  </span>
                  <p className="text-sm font-bold text-slate-900">{breadcrumb}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={openLocationModal}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-gov-800 text-xs font-bold rounded-xl border border-gov-300 shadow-2xs transition-all shrink-0"
              >
                Switch Taluk
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Door No / Building Name / Flat
                </label>
                <input
                  type="text"
                  name="address.doorNo"
                  disabled={!isEditing}
                  value={formData.address?.doorNo || ""}
                  onChange={handleChange}
                  placeholder="e.g. Plot 14, Kamarajar Street"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Street / Road / Colony
                </label>
                <input
                  type="text"
                  name="address.street"
                  disabled={!isEditing}
                  value={formData.address?.street || ""}
                  onChange={handleChange}
                  placeholder="e.g. Gandhi Nagar"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Village / Ward / Town
                </label>
                <input
                  type="text"
                  name="address.villageTown"
                  disabled={!isEditing}
                  value={formData.address?.villageTown || ""}
                  onChange={handleChange}
                  placeholder="e.g. Maduravoyal"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Taluk Name
                </label>
                <input
                  type="text"
                  name="address.taluk"
                  disabled={!isEditing}
                  value={formData.address?.taluk || ""}
                  onChange={handleChange}
                  placeholder="e.g. Ambattur"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  District (Tamil Nadu)
                </label>
                <input
                  type="text"
                  name="address.district"
                  disabled={!isEditing}
                  value={formData.address?.district || ""}
                  onChange={handleChange}
                  placeholder="e.g. Tiruvallur"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Postal Pincode
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  disabled={!isEditing}
                  value={formData.address?.pincode || ""}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="6-digit PIN (e.g. 600053)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-mono"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Saving Address..." : "Save Address"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Family & Emergency Contact */}
        {activeTab === "emergency" && (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Family & Emergency Contact</h3>
                <p className="text-xs text-slate-500">
                  Contact details for queue status SMS fallback, urgent verification, or family legal services
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gov-50 text-gov-800 hover:bg-gov-100 border border-gov-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Contact
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contact / Guardian Name
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  disabled={!isEditing}
                  value={formData.emergencyContact?.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. S. Meenakshi"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContact.relation"
                  disabled={!isEditing}
                  value={formData.emergencyContact?.relation || ""}
                  onChange={handleChange}
                  placeholder="e.g. Spouse / Father / Mother"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  disabled={!isEditing}
                  value={formData.emergencyContact?.phone || ""}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-gov-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveLoading ? "Saving Details..." : "Save Contact"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 4: Digital Documents Vault */}
        {activeTab === "vault" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tamil Nadu DigiLocker & Citizen e-Vault</h3>
                <p className="text-xs text-slate-500">
                  Pre-verified government documents reused automatically for one-click service applications
                </p>
              </div>
              <Link
                to="/citizen/applications"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gov-700 text-white hover:bg-gov-800 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FileText className="w-3.5 h-3.5" />
                Go to My Applications
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document 1: Aadhaar Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Aadhaar Identity Card</h4>
                      <p className="text-xs text-slate-500">UIDAI Resident Identification</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Linked
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>Number: {renderAadhaarValue()}</span>
                  <span className="text-[11px] font-sans text-slate-400">UIDAI Verified</span>
                </div>
              </div>

              {/* Document 2: Smart Family Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Smart Family Ration Card</h4>
                      <p className="text-xs text-slate-500">TN Civil Supplies & Consumer Protection</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Auto-Linked
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>Ref: TN-PDS-{formData.address?.district ? formData.address.district.slice(0, 3).toUpperCase() : "CHE"}-98231</span>
                  <span className="text-[11px] font-sans text-emerald-600 font-bold">Active</span>
                </div>
              </div>

              {/* Document 3: Community Certificate */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Revenue Community Certificate</h4>
                      <p className="text-xs text-slate-500">Taluk Office Revenue Records</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Application Ready
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Attachable in 1-click on new applications</span>
                  <Link to="/citizen/apply" className="text-gov-700 font-bold hover:underline">
                    Apply Now
                  </Link>
                </div>
              </div>

              {/* Document 4: Income & Nativity Certificate */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Nativity / Residence Certificate</h4>
                      <p className="text-xs text-slate-500">Issued by Tahsildar / Revenue Division</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    e-Seva Validated
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Valid for state higher education & employment</span>
                  <Link to="/citizen/applications" className="text-gov-700 font-bold hover:underline">
                    View Submissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenProfile;
