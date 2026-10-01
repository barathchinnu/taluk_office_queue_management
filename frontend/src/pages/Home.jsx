import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { departmentService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import {
  Building2,
  Ticket,
  Calendar,
  Monitor,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, tDeptName, tDeptDesc, language } = useLanguage();

  useEffect(() => {
    departmentService
      .getAll()
      .then((data) => {
        if (data.success) {
          setDepartments(data.departments);
        }
      })
      .catch((err) => console.error("Error fetching departments:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gov-700 via-gov-600 to-indigo-950 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("home", "badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
            {t("home", "heroTitlePrefix")}{" "}
            <span className="text-amber-400">{t("home", "heroDignified")}</span>{" "}
            {t("home", "heroTitleSuffix")}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-light leading-relaxed">
            {t("home", "heroSubtitle")}
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/citizen/take-token"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Ticket className="w-4 h-4" />
              {t("home", "btnGenerate")}
            </Link>

            <Link
              to="/citizen/appointments"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/25 transition-all duration-200"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              {t("home", "btnBook")}
            </Link>

            <Link
              to="/display"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-200 font-semibold text-sm border border-slate-700 transition-all duration-200"
            >
              <Monitor className="w-4 h-4 text-indigo-400" />
              {t("home", "btnDisplay")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {t("home", "howItWorksTitle")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t("home", "howItWorksSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t("home", "step1Title")}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("home", "step1Desc")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t("home", "step2Title")}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("home", "step2Desc")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t("home", "step3Title")}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("home", "step3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Available Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              {t("home", "deptSectionTitle")}
            </h2>
            <p className="text-sm text-slate-500">{t("home", "deptSectionSubtitle")}</p>
          </div>
          <Link
            to="/citizen/take-token"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>{t("home", "viewAllServices")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200/60 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-gov-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {language === "ta" ? "குறியீடு" : "CODE"}: {dept.code || "DEPT"}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{tDeptName(dept.name)}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tDeptDesc(dept.name, dept.description)}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("home", "counterActive")}
                  </span>
                  <Link
                    to={`/display/${dept._id}`}
                    className="font-semibold text-slate-700 hover:text-slate-950"
                  >
                    {t("home", "viewQueue")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Staff & Admin Access Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("home", "staffBannerTitle")}</h3>
              <p className="text-xs text-slate-400">
                {t("home", "staffBannerDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              {t("home", "staffLoginBtn")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
