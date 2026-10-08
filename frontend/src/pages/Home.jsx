import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { departmentService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import {
  Landmark,
  Search,
  Ticket,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  FileText,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  FileCheck,
  Sparkles,
  Award,
} from "lucide-react";

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, tDeptName, tDeptDesc, language } = useLanguage();
  const { officeName, selectedLocation, openLocationModal } = useGeoLocation();

  useEffect(() => {
    departmentService
      .getAll()
      .then((data) => {
        if (data.success) {
          setDepartments(data.departments || data.data || []);
        } else {
          setError("Unable to load departments list.");
        }
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setError("Unable to load government departments. Please check connectivity.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Standard Tamil Nadu Government Service Categories (Requirement 10)
  const serviceCategories = [
    {
      id: "revenue",
      icon: "🏛",
      titleEn: "Revenue Services",
      titleTa: "வருவாய்த்துறை சேவைகள்",
      descEn: "Patta, Chitta, Legal Heir, Income & Community Certificates",
      descTa: "பட்டா, சிட்டா, வாரிசு, வருமானம் மற்றும் சாதி சான்றிதழ்கள்",
      query: "Revenue",
    },
    {
      id: "aadhaar",
      icon: "🪪",
      titleEn: "Aadhaar Services",
      titleTa: "ஆதார் சேவைகள்",
      descEn: "Biometric updates, Mobile linking, Mandatory demographic updates",
      descTa: "கைரேகை புதுப்பித்தல், மொபைல் எண் இணைப்பு, முகவரி திருத்தம்",
      query: "Aadhaar",
    },
    {
      id: "certificates",
      icon: "📄",
      titleEn: "Certificate Services",
      titleTa: "சான்றிதழ் சேவைகள்",
      descEn: "Birth, Death, Nativity, First Graduate & Residence Proof",
      descTa: "பிறப்பு, இறப்பு, இருப்பிடம், முதல் பட்டதாரி சான்றிதழ்கள்",
      query: "Certificate",
    },
    {
      id: "property",
      icon: "🏠",
      titleEn: "Land & Property",
      titleTa: "நிலம் மற்றும் சொத்து",
      descEn: "Encumbrance (EC), Land classification, Registration verification",
      descTa: "வில்லங்க சான்று, நில வகைப்பாடு, பதிவு சரிபார்ப்பு",
      query: "Land",
    },
    {
      id: "welfare",
      icon: "👨‍👩‍👧",
      titleEn: "Social Welfare",
      titleTa: "சமூக நல திட்டங்கள்",
      descEn: "Old age pension (OAP), Widow welfare, Disability pensions",
      descTa: "முதியோர் ஓய்வூதியம், விதவை உதவித்தொகை, மாற்றுத்திறனாளி உதவி",
      query: "Welfare",
    },
    {
      id: "agriculture",
      icon: "🌾",
      titleEn: "Agriculture",
      titleTa: "வேளாண்மை",
      descEn: "Farmer schemes, Crop subsidy, Soil health token",
      descTa: "விவசாயிகள் உதவி நிதி, பயிர் காப்பீடு, உழவர் பாதுகாப்பு",
      query: "Agriculture",
    },
    {
      id: "health",
      icon: "🏥",
      titleEn: "Government Health",
      titleTa: "அரசு மருத்துவ சேவைகள்",
      descEn: "CMCHIS Health insurance, Immunization, Disability card",
      descTa: "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்",
      query: "Health",
    },
    {
      id: "education",
      icon: "🎓",
      titleEn: "Education Services",
      titleTa: "கல்வி சேவைகள்",
      descEn: "Student scholarships, Free laptop verification, Fee concessions",
      descTa: "கல்வி உதவித்தொகை, இலவச மடிக்கணினி, கல்விக் கட்டண சலுகை",
      query: "Education",
    },
  ];

  // 5-Step Government Workflow (Requirement 10)
  const howItWorksSteps = [
    {
      step: 1,
      titleEn: "Select Location",
      titleTa: "இருப்பிடத்தை தேர்வு செய்க",
      descEn: "Choose your Tamil Nadu District and Taluk Office for jurisdictional services.",
      descTa: "உங்கள் மாவட்டம் மற்றும் வட்டாட்சியர் அலுவலகத்தை தேர்வு செய்யவும்.",
    },
    {
      step: 2,
      titleEn: "Select Government Service",
      titleTa: "அரசு சேவையைத் தேர்வு செய்க",
      descEn: "Browse the official service directory or search for certificates and schemes.",
      descTa: "தேவையான வருவாய் அல்லது அரசு சேவையை பட்டியலிலிருந்து தேர்வு செய்யவும்.",
    },
    {
      step: 3,
      titleEn: "Book Appointment / Take Token",
      titleTa: "நியமனம் / வரிசை டோக்கன் பெறுக",
      descEn: "Schedule a convenient appointment slot or generate an instant walk-in token.",
      descTa: "நேரடி டோக்கன் பெறவும் அல்லது வசதியான நேரத்தில் முன்பதிவு செய்யவும்.",
    },
    {
      step: 4,
      titleEn: "Track Your Queue",
      titleTa: "வரிசை நிலையை கண்காணிக்க",
      descEn: "Monitor live serving counters, token announcements, and waiting times in real-time.",
      descTa: "நேரலை கவுண்டர் நிலை, டோக்கன் அழைப்பு மற்றும் காத்திருப்பு நேரத்தை பார்க்கவும்.",
    },
    {
      step: 5,
      titleEn: "Complete Your Service",
      titleTa: "சேவையை நிறைவு செய்க",
      descEn: "Visit the designated desk or receive your digital certificate acknowledgement.",
      descTa: "குறிப்பிட்ட கவுண்டரில் ஆவணங்களை வழங்கி சேவையை நிறைவு செய்யவும்.",
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* ==========================================
          HERO SECTION (Requirement 10)
      ========================================== */}
      <section className="bg-gradient-to-r from-[#0b3b60] via-[#0e4875] to-[#00809d] text-white rounded-2xl shadow-lg overflow-hidden border border-[#082a45]">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16 text-center space-y-6">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            <Landmark className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === "ta"
                ? "தமிழ்நாடு அரசு அதிகாரப்பூர்வ இணைய சேவை முறைமை"
                : "Government of Tamil Nadu • Smart Public Queue System"}
            </span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading leading-tight max-w-4xl mx-auto">
            {language === "ta"
              ? "அரசு சேவைகளை எளிதாக பெறுங்கள்"
              : "Access Government Services Easily"}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
            {language === "ta"
              ? "முன்பதிவு செய்யுங்கள், வரிசை டோக்கன்களைப் பெறுங்கள், விண்ணப்பங்களை நிகழ்நேரத்தில் கண்காணித்து அரசு சேவைகளைப் பெறுங்கள்."
              : "Book appointments, take queue tokens, track applications and receive real-time service updates across all 38 districts of Tamil Nadu."}
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Link
              to="/services"
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-colors"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>
                {language === "ta" ? "அரசு சேவையைத் தேடுங்கள்" : "Find a Government Service"}
              </span>
            </Link>

            <Link
              to="/track"
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/30 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>
                {language === "ta" ? "விண்ணப்பத்தை கண்காணிக்க" : "Track Application"}
              </span>
            </Link>

            <Link
              to="/citizen/take-token"
              className="flex items-center gap-2 px-5 py-3.5 rounded-lg bg-[#07243b]/70 hover:bg-[#07243b] text-slate-100 font-semibold text-sm border border-white/20 transition-colors"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>{language === "ta" ? "நேரடி டோக்கன்" : "Take Token"}</span>
            </Link>
          </div>
        </div>

        {/* Selected Office Status Strip */}
        <div className="bg-black/25 border-t border-white/10 px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === "ta" ? "தற்போதைய வட்டாட்சியர் அலுவலகம்:" : "Active Jurisdictional Office:"}
              </span>
              <strong className="text-white font-bold">{officeName}</strong>
              <span className="text-slate-400 hidden sm:inline">
                ({selectedLocation?.district?.name || "Coimbatore"})
              </span>
            </div>

            <button
              onClick={openLocationModal}
              className="text-amber-300 hover:text-amber-200 font-bold underline transition-colors"
            >
              {language === "ta" ? "அலுவலகத்தை மாற்று" : "Switch Taluk Office"}
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          HOW IT WORKS (5 STEPS) (Requirement 10)
      ========================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
            {language === "ta" ? "சேவை நடைமுறை" : "Citizen Guide"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            {language === "ta" ? "சேவை எவ்வாறு செயல்படுகிறது?" : "How It Works"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {language === "ta"
              ? "5 எளிய படிகளில் உங்கள் அரசு பணிகளை தாமதமின்றி முடித்துக் கொள்ளலாம்."
              : "5 simple steps to access seamless citizen services without waiting in long queues."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {howItWorksSteps.map((step) => (
            <div
              key={step.step}
              className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow relative space-y-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-[#0b3b60] text-amber-300 font-extrabold text-sm flex items-center justify-center shadow-xs">
                {step.step}
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {language === "ta" ? step.titleTa : step.titleEn}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === "ta" ? step.descTa : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SERVICE CATEGORIES (Requirement 10)
      ========================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
              {language === "ta" ? "சேவை வகைகள்" : "Service Directory"}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              {language === "ta" ? "அரசு சேவை பிரிவுகள்" : "Government Service Categories"}
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs sm:text-sm font-bold text-[#0b3b60] hover:text-[#00809d] flex items-center gap-1 group"
          >
            <span>{language === "ta" ? "அனைத்து சேவைகளையும் பார்க்க" : "View Complete Catalog"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?search=${encodeURIComponent(cat.query)}`}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="text-2xl mb-1">{cat.icon}</div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0b3b60] transition-colors">
                  {language === "ta" ? cat.titleTa : cat.titleEn}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {language === "ta" ? cat.descTa : cat.descEn}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#0b3b60] font-semibold">
                <span>{language === "ta" ? "விவரங்கள்" : "Explore Services"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==========================================
          REAL BACKEND DEPARTMENTS LIST
      ========================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
              {language === "ta" ? "அலுவலக துறைகள்" : "Taluk Operational Wings"}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              {language === "ta" ? "செயல்பாட்டு துறைகள்" : "Active Government Departments"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "ta"
                ? `${officeName} அலுவலகத்தின் நேரடி சேவை பிரிவுகள்`
                : `Currently active operational desks at ${officeName}`}
            </p>
          </div>
          <Link
            to="/citizen/take-token"
            className="text-xs sm:text-sm font-bold text-[#0b3b60] hover:text-[#00809d] flex items-center gap-1"
          >
            <span>{language === "ta" ? "டோக்கன் எடுக்க" : "Take Token"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading government departments..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : departments.length === 0 ? (
          <EmptyState
            title="No departments available"
            description="No active departments configured for this jurisdictional office."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-[#0b3b60] hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#0b3b60] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {dept.code || "DEPT"}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {tDeptName(dept.name)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {tDeptDesc(dept.name, dept.description)}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active</span>
                  </span>
                  <Link
                    to={`/display/${dept._id}`}
                    className="font-bold text-[#0b3b60] hover:underline text-[11px]"
                  >
                    Live Queue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          OFFICIAL ASSISTANCE & HELPDESK BANNER
      ========================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#07243b] rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#0d3b60]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {language === "ta"
                  ? "அரசு அலுவலர் அல்லது நிர்வாகியாக உள்நுழைகிறீர்களா?"
                  : "Are you a Government Duty Officer or Administrator?"}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === "ta"
                  ? "கவுண்டர் மேலாண்மை, வரிசை அழைப்பு மற்றும் ஆவண சரிபார்ப்பு பணியகம்."
                  : "Access counter call controls, token verification, and 38-district state administration."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-white text-[#0b3b60] font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              {language === "ta" ? "அலுவலர் உள்நுழைவு" : "Staff Console Login"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
