import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { departmentService, serviceService, tokenService } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import StatusBadge from "../../components/StatusBadge";
import {
  Building2,
  Ticket,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Printer,
  Sparkles,
} from "lucide-react";

const TakeToken = () => {
  const { language, t, tDeptName, tDeptDesc, tServiceName, tStatus } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    departmentService
      .getAll()
      .then((data) => {
        if (data.success) {
          setDepartments(data.departments);
          if (data.departments.length > 0) {
            handleSelectDepartment(data.departments[0]);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading departments:", err);
        setError("Failed to load departments. Please try again.");
      })
      .finally(() => setLoadingDepts(false));
  }, []);

  const handleSelectDepartment = async (dept) => {
    setSelectedDept(dept);
    setSelectedService(null);
    setError("");

    try {
      setLoadingServices(true);
      const data = await serviceService.getByDepartment(dept._id);
      if (data.success) {
        setServices(data.services);
        if (data.services.length > 0) {
          setSelectedService(data.services[0]);
        }
      }
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Failed to load services for this department");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!selectedDept || !selectedService) {
      setError("Please select both a department and a service");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      const res = await tokenService.generateToken(selectedDept._id, selectedService._id);

      if (res.success && res.token) {
        setGeneratedToken(res.token);
      }
    } catch (err) {
      console.error("Token generation error:", err);
      setError(
        err.response?.data?.message ||
          "Could not generate token. You might already have an active token for this department."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/citizen" className="hover:text-indigo-600 font-medium">
              {t("takeToken", "breadcrumbDesk")}
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{t("takeToken", "breadcrumbTake")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {t("takeToken", "pageTitle")}
          </h1>
          <p className="text-xs text-slate-500">
            {t("takeToken", "pageSubtitle")}
          </p>
        </div>

        <Link
          to="/citizen"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("takeToken", "backToDesk")}</span>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MODAL / TOKEN RECEIPT */}
      {generatedToken ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t("takeToken", "tokenIssuedSuccess")}
            </span>
            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 font-heading tracking-tight pt-2">
              {generatedToken.tokenDisplay}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Token #{generatedToken.tokenNumber} • {t("takeToken", "tokenQueueDate")}: {new Date().toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN")}
            </p>
          </div>

          {/* Details summary */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 max-w-md mx-auto text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{t("takeToken", "departmentLabel")}:</span>
              <span className="font-bold text-slate-900">{tDeptName(generatedToken.department?.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("takeToken", "serviceLabel")}:</span>
              <span className="font-bold text-slate-900">{tServiceName(generatedToken.service?.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("takeToken", "queueStatusLabel")}:</span>
              <StatusBadge status={generatedToken.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("takeToken", "avgServiceTimeLabel")}:</span>
              <span className="font-semibold text-slate-700">
                {generatedToken.service?.averageServiceTime || 10} {language === "ta" ? "நிமிடம்" : "mins"} / token
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              to="/citizen"
              className="px-6 py-3 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t("takeToken", "viewLivePosition")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t("takeToken", "printTokenSlip")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* STEP-BY-STEP SELECTION FORM */
        <div className="space-y-8">
          {/* Step 1: Department Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gov-700 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">{t("takeToken", "step1Title")}</h2>
            </div>

            {loadingDepts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {departments.map((dept) => {
                  const isSelected = selectedDept?._id === dept._id;
                  return (
                    <button
                      key={dept._id}
                      type="button"
                      onClick={() => handleSelectDepartment(dept)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-gov-700 bg-gov-50/50 shadow-xs ring-2 ring-gov-700/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {dept.code || "DEPT"}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{tDeptName(dept.name)}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {tDeptDesc(dept.name, dept.description)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Service Selection */}
          {selectedDept && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gov-700 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {t("takeToken", "step2Title")} {tDeptName(selectedDept.name)}
                </h2>
              </div>

              {loadingServices ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {language === "ta" ? "சேவைகள் எதுவும் இல்லை." : "No active services found under this department."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((svc) => {
                    const isSelected = selectedService?._id === svc._id;
                    return (
                      <button
                        key={svc._id}
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-600/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{tServiceName(svc.name)}</h4>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {svc.averageServiceTime || 10}m
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {svc.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Button */}
          {selectedDept && selectedService && (
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                  {t("takeToken", "step3Ready")}
                </span>
                <h3 className="text-xl font-bold">
                  {tServiceName(selectedService.name)} ({tDeptName(selectedDept.name)})
                </h3>
                <p className="text-xs text-slate-400">
                  {t("takeToken", "estTime")}: {selectedService.averageServiceTime || 10} {language === "ta" ? "நிமிடங்கள்" : "minutes"}
                </p>
              </div>

              <button
                onClick={handleGenerateToken}
                disabled={generating}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {generating ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>{t("takeToken", "issueBtn")}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TakeToken;
