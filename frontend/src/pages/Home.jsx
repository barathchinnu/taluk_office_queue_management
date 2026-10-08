import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { departmentService, serviceCatalogService } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ServiceDetailModal from "../components/ServiceDetailModal";
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
  FileCheck2,
  IndianRupee,
  Lock,
  ChevronRight,
  Filter,
} from "lucide-react";

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, tDeptName, tDeptDesc, tServiceName, language } = useLanguage();
  const { officeName, selectedLocation, openLocationModal } = useGeoLocation();

  // State for Service Detail Modal & Filter
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [searchServiceQuery, setSearchServiceQuery] = useState("");

  // Load departments
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

  // Load services for required documents lookup & token booking
  useEffect(() => {
    serviceCatalogService
      .getAll()
      .then((res) => {
        if (res.success) {
          setServices(res.data || res.services || []);
        }
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
      })
      .finally(() => setServicesLoading(false));
  }, []);

  // Fallback standard services if offline or seeding in progress
  const defaultServices = [
    {
      _id: "6ab6b0dd02be36a5838574c4",
      name: "Income Certificate",
      code: "REV_INC",
      department: { name: "Revenue", code: "REVE" },
      description: "Application and processing of income certificate for education & government schemes.",
      fee: 60,
      averageServiceTime: 10,
      expectedProcessingDays: 3,
      requiredDocuments: [
        "Aadhaar Card",
        "Salary Certificate / Pay Slip",
        "Ration Card",
        "Self Declaration Affidavit",
      ],
    },
    {
      _id: "6abc8db436ed18df0c477667",
      name: "Patta Related Service",
      code: "REV_PATTA",
      department: { name: "Revenue", code: "REVE" },
      description: "Patta transfer, sub-division, name correction, and chitta extract from the Taluk Office.",
      fee: 0,
      averageServiceTime: 15,
      expectedProcessingDays: 15,
      requiredDocuments: [
        "Sale Deed / Registered Document",
        "Previous Patta Copy",
        "EC (Encumbrance Certificate)",
        "Aadhaar Card",
      ],
    },
    {
      _id: "6abc8db436ed18df0c47766d",
      name: "Community Certificate",
      code: "CERT_COMM",
      department: { name: "Revenue", code: "REVE" },
      description: "Statutory community certificate verifying BC / MBC / SC / ST category.",
      fee: 60,
      averageServiceTime: 10,
      expectedProcessingDays: 7,
      requiredDocuments: [
        "Father / Mother Community Certificate",
        "School Transfer Certificate (TC)",
        "Ration Card",
        "Aadhaar Card",
      ],
    },
    {
      _id: "6abc8db436ed18df0c47766e",
      name: "Nativity Certificate",
      code: "CERT_NAT",
      department: { name: "Revenue", code: "REVE" },
      description: "Official certificate establishing continuous residence and nativity in Tamil Nadu.",
      fee: 60,
      averageServiceTime: 10,
      expectedProcessingDays: 7,
      requiredDocuments: [
        "Birth Certificate",
        "Parent Proof of Residence (5+ years)",
        "Aadhaar Card",
        "Ration Card",
      ],
    },
    {
      _id: "6abc8db436ed18df0c477672",
      name: "Aadhaar Update",
      code: "UID_UPDATE",
      department: { name: "Aadhaar Kendra", code: "UIDAI" },
      description: "Biometric and demographic updates, mobile number linking, and address updates.",
      fee: 50,
      averageServiceTime: 12,
      expectedProcessingDays: 5,
      requiredDocuments: [
        "Existing Aadhaar Card Copy",
        "Valid Supporting Document for Updated Field",
        "Active Mobile for OTP",
      ],
    },
    {
      _id: "6abc8db436ed18df0c47766c",
      name: "Old Age Pension Scheme",
      code: "WEL_OAP",
      department: { name: "Social Welfare", code: "WELF" },
      description: "Monthly financial pension assistance for senior citizens (60+ years) below poverty line.",
      fee: 0,
      averageServiceTime: 15,
      expectedProcessingDays: 14,
      requiredDocuments: [
        "Age Proof (Aadhaar / Voter ID - 60+ Years)",
        "Income Certificate (Below Poverty Line)",
        "Bank Passbook Copy",
      ],
    },
    {
      _id: "6abc8db436ed18df0c47766f",
      name: "Residence Certificate",
      code: "CERT_RES",
      department: { name: "Revenue", code: "REVE" },
      description: "Official residential proof issued by the Revenue Inspector and Tahsildar.",
      fee: 60,
      averageServiceTime: 10,
      expectedProcessingDays: 3,
      requiredDocuments: [
        "EB Electricity Bill / Water Bill",
        "Rental Agreement / Property Tax Receipt",
        "Aadhaar Card",
      ],
    },
    {
      _id: "6abc8db436ed18df0c47766b",
      name: "Disability Welfare Assistance",
      code: "WEL_DIS",
      department: { name: "Social Welfare", code: "WELF" },
      description: "Disability pension allowance and medical equipment assistance.",
      fee: 0,
      averageServiceTime: 15,
      expectedProcessingDays: 10,
      requiredDocuments: [
        "Medical Board Disability Certificate (40%+)",
        "Aadhaar Card",
        "Bank Account Details",
        "Passport Size Photos",
      ],
    },
  ];

  const allAvailableServices = services.length > 0 ? services : defaultServices;

  // Filter services by category and search
  const filteredServices = allAvailableServices.filter((s) => {
    const q = searchServiceQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedCategoryTab === "all") return true;
    if (selectedCategoryTab === "Revenue") {
      return (
        s.department?.name?.toLowerCase().includes("revenue") ||
        s.code?.startsWith("REV") ||
        s.name?.toLowerCase().includes("patta") ||
        s.name?.toLowerCase().includes("income")
      );
    }
    if (selectedCategoryTab === "Aadhaar") {
      return (
        s.department?.name?.toLowerCase().includes("aadhaar") ||
        s.code?.startsWith("UID") ||
        s.name?.toLowerCase().includes("aadhaar")
      );
    }
    if (selectedCategoryTab === "Certificate") {
      return (
        s.code?.startsWith("CERT") ||
        s.name?.toLowerCase().includes("certificate")
      );
    }
    if (selectedCategoryTab === "Welfare") {
      return (
        s.department?.name?.toLowerCase().includes("welfare") ||
        s.code?.startsWith("WEL") ||
        s.name?.toLowerCase().includes("pension") ||
        s.name?.toLowerCase().includes("disability")
      );
    }
    if (selectedCategoryTab === "Land") {
      return (
        s.name?.toLowerCase().includes("patta") ||
        s.name?.toLowerCase().includes("land")
      );
    }
    return true;
  });

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

  // Handler when clicking a category card: scroll to services & filter tab
  const handleCategoryClick = (query) => {
    setSelectedCategoryTab(query);
    const element = document.getElementById("services-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
              : "Book appointments, take queue tokens, track applications and check required documents across all 38 districts of Tamil Nadu."}
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <a
              href="#services-section"
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>
                {language === "ta" ? "அரசு சேவைகளைத் தேடுங்கள்" : "Browse Services & Documents"}
              </span>
            </a>

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
              className="text-amber-300 hover:text-amber-200 font-bold underline transition-colors cursor-pointer"
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
          SERVICE CATEGORIES
      ========================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#0b3b60]">
              {language === "ta" ? "சேவை பிரிவுகள்" : "Service Directory"}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              {language === "ta" ? "அரசு சேவை பிரிவுகள்" : "Government Service Categories"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "ta"
                ? "சேவையை கிளிக் செய்து தேவையான ஆவணங்களைப் பார்க்கவும்"
                : "Click any category to filter services and view required documents"}
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs sm:text-sm font-bold text-[#0b3b60] hover:text-[#00809d] flex items-center gap-1 group"
          >
            <span>{language === "ta" ? "முழு பட்டியலைக் காண்க" : "View Complete Catalog"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.query)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-md transition-all group flex flex-col justify-between text-left cursor-pointer"
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
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#0b3b60] font-semibold w-full">
                <span>{language === "ta" ? "ஆவணங்களை காண்க" : "View Services & Docs"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          POPULAR GOVERNMENT SERVICES — DIRECT CLICK TO VIEW REQUIRED DOCUMENTS
      ========================================================================= */}
      <section id="services-section" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === "ta" ? "தேவையான ஆவணங்கள் சரிபார்ப்பு" : "Document Requirements & Token Portal"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-heading">
                {language === "ta"
                  ? "அரசு சேவைகள் — தேவையான ஆவணங்கள்"
                  : "Government Services & Required Documents"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                {language === "ta"
                  ? "எந்தவொரு சேவையை கிளிக் செய்தாலும் அதற்குத் தேவையான அசல் மற்றும் நகல் ஆவணங்களைப் பார்த்து, உள்நுழைந்து டோக்கன் பெறலாம்."
                  : "Click any service to view the mandatory documents needed before visiting the Taluk Office counter and book your token."}
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={language === "ta" ? "சேவை பெயர் தேட..." : "Search service (e.g. Income, Patta)..."}
                value={searchServiceQuery}
                onChange={(e) => setSearchServiceQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0b3b60] transition-all"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-600 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {language === "ta" ? "பிரிவு:" : "Filter:"}
            </span>
            {[
              { id: "all", labelEn: "All Services", labelTa: "அனைத்தும்" },
              { id: "Revenue", labelEn: "Revenue (வருவாய்)", labelTa: "வருவாய்த்துறை" },
              { id: "Aadhaar", labelEn: "Aadhaar (ஆதார்)", labelTa: "ஆதார் மையம்" },
              { id: "Certificate", labelEn: "Certificates", labelTa: "சான்றிதழ்கள்" },
              { id: "Land", labelEn: "Land & Patta", labelTa: "நிலம் / பட்டா" },
              { id: "Welfare", labelEn: "Welfare & Pension", labelTa: "சமூக நலன்" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategoryTab === tab.id
                    ? "bg-[#0b3b60] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {language === "ta" ? tab.labelTa : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-2">
            {filteredServices.map((service) => {
              const docCount = service.requiredDocuments?.length || 4;
              const feeDisplay =
                service.fee === 0 || service.fee === "0"
                  ? language === "ta"
                    ? "இலவசம்"
                    : "Free"
                  : `₹${service.fee}`;

              return (
                <div
                  key={service._id}
                  onClick={() => setSelectedServiceModal(service)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#0b3b60] hover:shadow-lg transition-all p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b3b60] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {service.department?.name || "General Desk"}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {feeDisplay}
                      </span>
                    </div>

                    {/* Service Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0b3b60] transition-colors leading-snug">
                        {tServiceName(service.name)}
                      </h3>
                      {language === "both" && service.name && (
                        <p className="text-xs text-slate-500 font-medium">
                          {service.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {service.description || "Official government service offered at the Taluk Office."}
                      </p>
                    </div>

                    {/* Prominent Required Documents Preview Box */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{language === "ta" ? "தேவையான ஆவணங்கள்:" : "Required Documents:"}</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold">
                          {docCount} {language === "ta" ? "ஆவணங்கள்" : "Docs"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 truncate font-medium">
                        {service.requiredDocuments && service.requiredDocuments.length > 0
                          ? service.requiredDocuments.slice(0, 2).join(", ") +
                            (service.requiredDocuments.length > 2
                              ? ` (+${service.requiredDocuments.length - 2} more)`
                              : "")
                          : "Aadhaar Card, Ration Card, ID Proof"}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      ~{service.averageServiceTime || 10} mins
                    </span>
                    <button
                      type="button"
                      className="font-bold text-[#0b3b60] group-hover:text-[#00809d] flex items-center gap-1"
                    >
                      <span>{language === "ta" ? "ஆவணங்கள் & டோக்கன்" : "View Documents & Book"}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No services match your search query.</p>
              <button
                onClick={() => {
                  setSearchServiceQuery("");
                  setSelectedCategoryTab("all");
                }}
                className="mt-2 text-xs font-bold text-[#0b3b60] underline"
              >
                Reset Filters
              </button>
            </div>
          )}
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

      {/* =========================================================================
          GLOBAL SERVICE DETAIL & REQUIRED DOCUMENTS MODAL (AUTH GATED)
      ========================================================================= */}
      {selectedServiceModal && (
        <ServiceDetailModal
          service={selectedServiceModal}
          onClose={() => setSelectedServiceModal(null)}
        />
      )}
    </div>
  );
};

export default Home;
