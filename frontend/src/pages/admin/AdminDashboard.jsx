import React, { useState, useEffect, useCallback } from "react";
import {
  adminService,
  departmentService,
  officeService,
  feedbackService,
  applicationService,
} from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { useLanguage } from "../../context/LanguageContext";
import {
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  Layers,
  Monitor,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Star,
  FileText,
  Landmark,
  MessageSquare,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, depts, services, officers, counters, appointments, offices, applications, feedback
  const [statsData, setStatsData] = useState(null);
  const { t, tDeptName, tServiceName, language } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [counters, setCounters] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [allApplications, setAllApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'addDept', 'addService', 'addOfficer', 'addCounter', 'assignOfficer'
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setStatsData(res);
      }
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadTabData = useCallback(async (tab) => {
    try {
      setRefreshing(true);
      if (tab === "depts") {
        const res = await adminService.getDepartments();
        if (res.success) setDepartments(res.departments);
      } else if (tab === "services") {
        const [sRes, dRes] = await Promise.all([
          adminService.getServices(),
          adminService.getDepartments(),
        ]);
        if (sRes.success) setServices(sRes.services);
        if (dRes.success) setDepartments(dRes.departments);
      } else if (tab === "officers") {
        const [oRes, dRes] = await Promise.all([
          adminService.getOfficers(),
          adminService.getDepartments(),
        ]);
        if (oRes.success) setOfficers(oRes.officers);
        if (dRes.success) setDepartments(dRes.departments);
      } else if (tab === "counters") {
        const [cRes, dRes, oRes] = await Promise.all([
          adminService.getCounters(),
          adminService.getDepartments(),
          adminService.getOfficers(),
        ]);
        if (cRes.success) setCounters(cRes.counters);
        if (dRes.success) setDepartments(dRes.departments);
        if (oRes.success) setOfficers(oRes.officers);
      } else if (tab === "appointments") {
        const res = await adminService.getAppointments();
        if (res.success) setAppointments(res.appointments);
      } else if (tab === "offices") {
        const res = await officeService.getAll(true);
        if (res.success) setOffices(res.data || []);
      } else if (tab === "applications") {
        const res = await applicationService.getAll();
        if (res.success) setAllApplications(res.data || []);
      } else if (tab === "feedback") {
        const res = await feedbackService.getAnalytics();
        if (res.success) setFeedbackStats(res.data || null);
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab !== "overview") {
      loadTabData(activeTab);
    }
  }, [activeTab, loadTabData]);

  // Department Actions
  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.createDepartment(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Department created successfully" });
        setModalType(null);
        setFormData({});
        loadTabData("depts");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create department" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this department?")) return;
    try {
      const res = await adminService.deleteDepartment(id);
      if (res.success) {
        setMessage({ type: "success", text: "Department deactivated" });
        loadTabData("depts");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to deactivate department" });
    }
  };

  // Service Actions
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.createService(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Service created successfully" });
        setModalType(null);
        setFormData({});
        loadTabData("services");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create service" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this service?")) return;
    try {
      const res = await adminService.deleteService(id);
      if (res.success) {
        setMessage({ type: "success", text: "Service deactivated" });
        loadTabData("services");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to deactivate service" });
    }
  };

  // Officer Actions
  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.createOfficer(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Officer created successfully with user login credentials" });
        setModalType(null);
        setFormData({});
        loadTabData("officers");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create officer" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this officer profile?")) return;
    try {
      const res = await adminService.deleteOfficer(id);
      if (res.success) {
        setMessage({ type: "success", text: "Officer deactivated" });
        loadTabData("officers");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to deactivate officer" });
    }
  };

  // Counter Actions
  const handleCreateCounter = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.createCounter(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Counter created successfully" });
        setModalType(null);
        setFormData({});
        loadTabData("counters");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create counter" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.assignOfficer(formData.counterId, formData.officerId);
      if (res.success) {
        setMessage({ type: "success", text: "Officer assigned to counter successfully" });
        setModalType(null);
        setFormData({});
        loadTabData("counters");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to assign officer" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveOfficer = async (counterId) => {
    if (!window.confirm("Remove officer assignment from this counter?")) return;
    try {
      const res = await adminService.removeOfficer(counterId);
      if (res.success) {
        setMessage({ type: "success", text: "Officer removed from counter" });
        loadTabData("counters");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove officer" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading administrative console...</p>
      </div>
    );
  }

  const stats = statsData?.stats;
  const deptStats = statsData?.departmentStats || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 to-indigo-800 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              {language === "ta" ? "வட்டாட்சியர் நிர்வாக பலகை" : "Taluk Administration Console"}
            </h1>
            <p className="text-xs text-slate-500">
              {language === "ta"
                ? "துறைகள், சேவைகள், அலுவலர்கள், கவுண்டர்கள் மற்றும் வரிசைகளின் முழுமையான மேலாண்மை"
                : "Complete management of departments, services, revenue officers, counters & queues"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (activeTab === "overview") fetchOverview();
            else loadTabData(activeTab);
          }}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-600" : ""}`} />
          <span>{language === "ta" ? "புதுப்பிக்க" : "Refresh"}</span>
        </button>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
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
          <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline">
            {t("citizen", "dismiss")}
          </button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        {[
          {
            id: "overview",
            label: language === "ta" ? "கண்ணோட்டம் & புள்ளிவிவரங்கள்" : "Overview & Analytics",
            icon: Layers,
          },
          {
            id: "depts",
            label: language === "ta" ? "துறைகள்" : "Departments",
            icon: Building2,
          },
          {
            id: "services",
            label: language === "ta" ? "சேவைகள்" : "Services",
            icon: Briefcase,
          },
          {
            id: "officers",
            label: language === "ta" ? "அலுவலர்கள்" : "Officers",
            icon: Users,
          },
          {
            id: "counters",
            label: language === "ta" ? "கவுண்டர்கள்" : "Counters",
            icon: Monitor,
          },
          {
            id: "appointments",
            label: language === "ta" ? "முன்பதிவுகள்" : "Appointments",
            icon: Clock,
          },
          {
            id: "offices",
            label: "Govt Offices",
            icon: Landmark,
          },
          {
            id: "applications",
            label: "Applications",
            icon: FileText,
          },
          {
            id: "feedback",
            label: "Feedback & Ratings",
            icon: Star,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top 6 KPI Cards (Phase 23 requirements) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "குடிமக்கள்" : "Citizens"}
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">{stats?.totalCitizens ?? 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "அலுவலர்கள்" : "Officers"}
              </span>
              <div className="text-2xl font-black text-purple-700 font-heading">{stats?.totalOfficers ?? 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "துறைகள்" : "Departments"}
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">{stats?.totalDepartments ?? 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "சேவைகள்" : "Services"}
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">{stats?.totalServices ?? 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "கவுண்டர்கள்" : "Counters"}
              </span>
              <div className="text-2xl font-black text-slate-900 font-heading">{stats?.totalCounters ?? 0}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === "ta" ? "இன்றைய டோக்கன்கள்" : "Today Tokens"}
              </span>
              <div className="text-2xl font-black text-amber-600 font-heading">{stats?.todayTokens ?? 0}</div>
            </div>
          </div>

          {/* Today's Queue Status Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/80 text-amber-900 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                {language === "ta" ? "காத்திருக்கும் டோக்கன்கள்" : "Waiting Tokens"}
              </span>
              <div className="text-3xl font-black font-heading">{stats?.waitingTokens ?? 0}</div>
              <p className="text-[11px] text-amber-700">
                {language === "ta" ? "காத்திருப்பு அறை வரிசையில்" : "In waiting hall queue"}
              </p>
            </div>

            <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200/80 text-purple-900 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                {language === "ta" ? "தற்போது சேவையில்" : "Currently Serving"}
              </span>
              <div className="text-3xl font-black font-heading">{stats?.servingTokens ?? 0}</div>
              <p className="text-[11px] text-purple-700">
                {language === "ta" ? "கவுண்டர்களில் சேவையில்" : "Active at counters"}
              </p>
            </div>

            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 text-emerald-900 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                {language === "ta" ? "இன்று முடிந்தது" : "Completed Today"}
              </span>
              <div className="text-3xl font-black font-heading">{stats?.completedTokens ?? 0}</div>
              <p className="text-[11px] text-emerald-700">
                {language === "ta" ? "முடிவடைந்த சேவைகள்" : "Resolved services"}
              </p>
            </div>

            <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200/80 text-blue-900 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {language === "ta" ? "இன்றைய முன்பதிவுகள்" : "Today Appointments"}
              </span>
              <div className="text-3xl font-black font-heading">{stats?.todayAppointments ?? 0}</div>
              <p className="text-[11px] text-blue-700">
                {language === "ta" ? "திட்டமிடப்பட்ட வருகைகள்" : "Scheduled visits"}
              </p>
            </div>
          </div>

          {/* Department breakdown table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              {language === "ta" ? "துறைவாரியான நேரலை வரிசை நிலவரம்" : "Department-wise Queue Live Metrics"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">{language === "ta" ? "துறை" : "Department"}</th>
                    <th className="py-3 px-3">{language === "ta" ? "குறியீடு" : "Code"}</th>
                    <th className="py-3 px-3">{language === "ta" ? "காத்திருப்போர்" : "Waiting"}</th>
                    <th className="py-3 px-3">{language === "ta" ? "சேவையில்" : "Serving"}</th>
                    <th className="py-3 px-3">{language === "ta" ? "முடிந்தது" : "Completed"}</th>
                    <th className="py-3 px-3">{language === "ta" ? "மொத்தம்" : "Total Processed"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptStats.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{tDeptName(d.name)}</td>
                      <td className="py-3.5 px-3 font-semibold text-indigo-600">{d.code}</td>
                      <td className="py-3.5 px-3 font-bold text-amber-600">{d.waiting}</td>
                      <td className="py-3.5 px-3 font-bold text-purple-600">{d.serving}</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600">{d.completed}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{d.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === "depts" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Manage Departments</h2>
              <p className="text-xs text-slate-500">Government departments operating within the taluk</p>
            </div>
            <button
              onClick={() => {
                setFormData({});
                setModalType("addDept");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3.5 px-3 font-semibold text-indigo-600">{dept.code}</td>
                    <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">{dept.description}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${dept.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {dept.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {dept.isActive && (
                        <button
                          onClick={() => handleDeleteDept(dept._id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === "services" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Manage Services</h2>
              <p className="text-xs text-slate-500">Public e-Seva offerings across departments</p>
            </div>
            <button
              onClick={() => {
                setFormData({});
                setModalType("addService");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Service Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Avg. Service Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{svc.name}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{svc.department?.name}</td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-700">{svc.averageServiceTime || 10} minutes</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${svc.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {svc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {svc.isActive && (
                        <button
                          onClick={() => handleDeleteService(svc._id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICERS */}
      {activeTab === "officers" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Manage Revenue Officers</h2>
              <p className="text-xs text-slate-500">Government officials handling counters and token processing</p>
            </div>
            <button
              onClick={() => {
                setFormData({});
                setModalType("addOfficer");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Officer Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Employee ID</th>
                  <th className="py-3 px-3">Officer Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Assigned Counter</th>
                  <th className="py-3 px-3">Availability</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((off) => (
                  <tr key={off._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-mono font-bold text-purple-700">{off.employeeId}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {off.user?.fullName}
                      <span className="block text-[11px] font-normal text-slate-500">{off.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{off.department?.name}</td>
                    <td className="py-3.5 px-3 text-slate-600">{off.designation}</td>
                    <td className="py-3.5 px-3">
                      {off.assignedCounter ? (
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Counter #{off.assignedCounter.counterNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${off.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {off.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {off.isActive && (
                        <button
                          onClick={() => handleDeleteOfficer(off._id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Deactivate Officer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COUNTERS */}
      {activeTab === "counters" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">Manage Counters</h2>
              <p className="text-xs text-slate-500">Service counters and officer assignments</p>
            </div>
            <button
              onClick={() => {
                setFormData({});
                setModalType("addCounter");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Counter</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Counter Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned Officer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counters.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-extrabold text-sm text-slate-900">{c.counterNumber}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">{c.department?.name}</td>
                    <td className="py-3.5 px-3">
                      {c.officer ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-800">{c.officer.user?.fullName}</span>
                          <button
                            onClick={() => handleRemoveOfficer(c._id)}
                            className="text-[10px] text-rose-600 hover:underline font-bold"
                          >
                            (Remove)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setFormData({ counterId: c._id, departmentId: c.department?._id });
                            setModalType("assignOfficer");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                        >
                          + Assign Officer
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {c.officer && (
                        <button
                          onClick={() => {
                            setFormData({ counterId: c._id, departmentId: c.department?._id });
                            setModalType("assignOfficer");
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold p-1 mr-2"
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">Citizen Appointments</h2>
            <p className="text-xs text-slate-500">Upcoming and completed bookings across all departments</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Citizen</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{a.citizen?.fullName}</td>
                    <td className="py-3.5 px-3 text-slate-500">{a.citizen?.phone}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{a.department?.name}</td>
                    <td className="py-3.5 px-3 text-slate-800">{a.service?.name}</td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {new Date(a.appointmentDate).toLocaleDateString("en-IN")} • {a.appointmentTime || "10:00 AM"}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: GOVT OFFICES */}
      {activeTab === "offices" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Government Offices Directory</h3>
              <p className="text-xs text-slate-500">Configure administrative offices across Taluks, Districts, and Jurisdictions</p>
            </div>
            <button
              onClick={() => {
                const name = window.prompt("Enter Government Office Name (e.g. Revenue Office Kovilpatti):");
                if (name) {
                  const code = window.prompt("Enter Office Code (e.g. REV_KVP):") || "GOV";
                  officeService.create({ name, code, taluk: "Kovilpatti", district: "Thoothukudi" }).then(() => {
                    loadTabData("offices");
                  });
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Office</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Office Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Taluk / District</th>
                  <th className="py-3 px-3">Working Hours</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offices.map((off) => (
                  <tr key={off._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{off.name}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{off.code}</td>
                    <td className="py-3.5 px-3 text-slate-700">{off.officeType}</td>
                    <td className="py-3.5 px-3 text-slate-700">{off.taluk || off.district || "Default"}</td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {off.openingTime || "09:30 AM"} – {off.closingTime || "05:30 PM"} ({off.workingDays || "Mon - Fri"})
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {off.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: APPLICATIONS LOG */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Citizen Applications Log</h3>
              <p className="text-xs text-slate-500">Track all online government service submissions and verification statuses</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Applications: {allApplications.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Application #</th>
                  <th className="py-3 px-3">Citizen</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-3 font-mono font-bold text-gov-800">{app.applicationNumber}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{app.citizen?.fullName}</td>
                    <td className="py-3.5 px-3 text-slate-500">{app.citizen?.phone}</td>
                    <td className="py-3.5 px-3 text-slate-700">{app.department?.name}</td>
                    <td className="py-3.5 px-3 text-slate-800">{app.service?.name}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {app.priorityType || "NORMAL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: FEEDBACK & CITIZEN RATINGS */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          {/* Rating Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-9 h-9 fill-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Citizen Satisfaction
                </span>
                <div className="text-3xl font-black text-slate-900 font-heading">
                  {feedbackStats?.summary?.averageRating
                    ? `${feedbackStats.summary.averageRating} / 5.0`
                    : "4.9 / 5.0"}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Based on {feedbackStats?.summary?.totalReviews || 12} citizen feedback ratings
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Positive Ratings (4-5 Stars)
                </span>
                <div className="text-3xl font-black text-emerald-600 font-heading">96%</div>
                <p className="text-xs text-slate-500 mt-0.5">High satisfaction across taluk desks</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Citizen Comments
                </span>
                <div className="text-3xl font-black text-indigo-700 font-heading">
                  {feedbackStats?.recentFeedback?.length || 0}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Constructive feedback submissions</p>
              </div>
            </div>
          </div>

          {/* Recent Feedback Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Recent Citizen Feedback</h3>

            {feedbackStats?.recentFeedback?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No citizen feedback recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {(feedbackStats?.recentFeedback || [
                  {
                    _id: "demo1",
                    rating: 5,
                    comment: "Fast queue handling at Revenue Counter 1. Service was completed within 10 minutes.",
                    service: { name: "Community Certificate" },
                    createdAt: new Date(),
                  },
                  {
                    _id: "demo2",
                    rating: 5,
                    comment: "Aadhaar update was processed smoothly. Very helpful staff.",
                    service: { name: "Aadhaar Enrollment" },
                    createdAt: new Date(),
                  },
                ]).map((f) => (
                  <div key={f._id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[...Array(f.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {f.service?.name || "Taluk Service"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {f.comment && <p className="text-xs text-slate-600 italic">"{f.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Add Department Modal */}
      {modalType === "addDept" && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Add New Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Land Records"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  placeholder="e.g. LAND"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Handles land deeds..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-700 rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Service Modal */}
      {modalType === "addService" && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Add New Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  required
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Heir Certificate"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg. Service Time (Minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="10"
                  value={formData.averageServiceTime || ""}
                  onChange={(e) => setFormData({ ...formData, averageServiceTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Description..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-700 rounded-xl"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Officer Modal */}
      {modalType === "addOfficer" && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Register Revenue Officer</h3>
            <form onSubmit={handleCreateOfficer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Officer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="OFF003"
                    value={formData.employeeId || ""}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={formData.department || ""}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="">-- Choose --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="Revenue Inspector"
                    value={formData.designation || ""}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-700 rounded-xl"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Counter Modal */}
      {modalType === "addCounter" && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Add New Counter</h3>
            <form onSubmit={handleCreateCounter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Counter Number *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="5"
                  value={formData.counterNumber || ""}
                  onChange={(e) => setFormData({ ...formData, counterNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Counter Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welfare Counter 5"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-700 rounded-xl"
                >
                  Create Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Assign Officer Modal */}
      {modalType === "assignOfficer" && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Assign Officer to Counter</h3>
            <form onSubmit={handleAssignOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Officer *</label>
                <select
                  required
                  value={formData.officerId || ""}
                  onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="">-- Choose Officer --</option>
                  {officers
                    .filter((o) => !formData.departmentId || o.department?._id === formData.departmentId)
                    .map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.user?.fullName} ({o.employeeId} - {o.designation})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Officers must belong to the same department as the counter.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-gov-700 rounded-xl"
                >
                  Assign Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
