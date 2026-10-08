import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { serviceCatalogService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import {
  Search,
  BookOpen,
  Clock,
  FileCheck2,
  Calendar,
  Ticket,
  IndianRupee,
  Building,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Filter,
  MapPin,
  Compass,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";

const ServiceCatalog = () => {
  const { isAuthenticated } = useAuth();
  const { selectedOfficeId, officeName, openLocationModal, selectedLocation } = useGeoLocation();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Service for Modal Preview
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const catRes = await serviceCatalogService.getAll({
          office: selectedOfficeId || undefined,
        });

        if (catRes.success) {
          setServices(catRes.data || []);
          const deptsMap = {};
          (catRes.data || []).forEach((s) => {
            if (s.department && s.department._id) {
              deptsMap[s.department._id] = s.department;
            }
          });
          setDepartments(Object.values(deptsMap));
        }
      } catch (err) {
        console.error("Failed to load service catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedOfficeId]);

  const filteredServices = services.filter((s) => {
    const matchesDept =
      selectedDept === "all" || s.department?._id === selectedDept;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleAction = (type, service) => {
    const deptId = service.department?._id || service.department || "";
    if (type === "apply") {
      navigate(
        isAuthenticated
          ? `/citizen/apply?serviceId=${service._id}&deptId=${deptId}`
          : "/login"
      );
    } else if (type === "appointment") {
      navigate(
        isAuthenticated
          ? `/citizen/appointments?book=true&serviceId=${service._id}&deptId=${deptId}`
          : "/login"
      );
    } else if (type === "token") {
      navigate(
        isAuthenticated
          ? `/citizen/take-token?serviceId=${service._id}&deptId=${deptId}`
          : "/login"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gov-800 via-indigo-900 to-gov-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <BookOpen className="w-4 h-4" />
              Tamil Nadu Citizen Charter & Service Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Taluk Office & Government Services Catalog
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Serving citizens across all 38 Districts & 317 Taluk Offices in Tamil Nadu. Browse revenue certificates, patta transfers, social welfare schemes, and municipal desk services.
            </p>

            {/* Location Indicator & Change Banner */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-300">Stationed Office:</span>
                <span className="font-bold text-amber-300">{officeName}</span>
                <span className="text-slate-400">({selectedLocation.taluk || "Tamil Nadu"})</span>
              </div>
              <button
                onClick={openLocationModal}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                Switch Taluk
              </button>
            </div>

            {/* Quick search input */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search service name (e.g. Income Certificate, Community, Patta)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-2xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/20 transition-all text-sm"
                />
              </div>
              <Link
                to="/track"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-2xl transition-all shadow-md text-center flex items-center justify-center gap-2 shrink-0"
              >
                Track Status
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Building className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">Filter by Department:</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDept === "all"
                  ? "bg-gov-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Departments ({services.length})
            </button>
            {departments.map((dept) => {
              const count = services.filter((s) => s.department?._id === dept._id).length;
              return (
                <button
                  key={dept._id}
                  onClick={() => setSelectedDept(dept._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDept === dept._id
                      ? "bg-gov-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {dept.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-700 mx-auto"></div>
            <p className="mt-4 font-semibold text-slate-600">Loading catalog services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search query or department filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-gov-400 cursor-pointer"
                onClick={() => setSelectedServiceModal(service)}
              >
                <div className="p-6 space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gov-700 bg-gov-50 px-2.5 py-1 rounded-lg border border-gov-200">
                        {service.department?.name || "General Desk"}
                      </span>
                      {service.code && (
                        <span className="ml-2 text-[11px] font-mono text-slate-400">
                          #{service.code}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {service.fee === 0 ? "Free" : `₹${service.fee}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-gov-800 transition-colors flex items-center justify-between">
                      <span>{service.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gov-700 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {service.description || "Official taluk administration citizen service."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{service.estimatedDuration || 15} mins counter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{service.expectedProcessingDays || 7} work days</span>
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-gov-600" />
                      Required Documents:
                    </h4>
                    {service.requiredDocuments && service.requiredDocuments.length > 0 ? (
                      <ul className="space-y-1">
                        {service.requiredDocuments.slice(0, 3).map((doc, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-600 flex items-center gap-1.5 truncate"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span className="truncate">{doc}</span>
                          </li>
                        ))}
                        {service.requiredDocuments.length > 3 && (
                          <li className="text-[11px] font-semibold text-gov-600">
                            +{service.requiredDocuments.length - 3} more documents
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Valid Aadhaar Card / ID Proof
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Quick Actions */}
                <div
                  className="p-3 bg-slate-50/90 border-t border-slate-100 grid grid-cols-3 gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleAction("apply", service)}
                    className="py-2 px-2 bg-gov-700 hover:bg-gov-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                    title="Apply Online with Documents"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>

                  <button
                    onClick={() => handleAction("appointment", service)}
                    className="py-2 px-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                    title="Book Appointment Slot"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>

                  <button
                    onClick={() => handleAction("token", service)}
                    className="py-2 px-2 bg-white hover:bg-slate-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                    title="Take Walk-in Queue Token"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-600" />
                    <span>Token</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SERVICE DETAIL & ACTION MODAL */}
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-gov-900 via-indigo-950 to-gov-800 text-white flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-white/10">
                    {selectedServiceModal.department?.name || "Government Department"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {selectedServiceModal.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{officeName}</span>
                    <span>•</span>
                    <span>Code: {selectedServiceModal.code || "SRV"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Service Overview
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedServiceModal.description ||
                      "Official government service offered at the Taluk Office headquarters. Citizens can apply online with digital verification or visit the physical counter."}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 block">Govt Fee</span>
                    <span className="text-base font-extrabold text-slate-900 flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      {selectedServiceModal.fee === 0 ? "Free" : `₹${selectedServiceModal.fee}`}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 block">Counter Time</span>
                    <span className="text-base font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      {selectedServiceModal.estimatedDuration || 15} mins
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-500 block">Resolution</span>
                    <span className="text-base font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {selectedServiceModal.expectedProcessingDays || 7} days
                    </span>
                  </div>
                </div>

                {/* Required Documents Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gov-700" />
                    Mandatory Documents & Eligibility Checklist
                  </h4>
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                    {selectedServiceModal.requiredDocuments && selectedServiceModal.requiredDocuments.length > 0 ? (
                      selectedServiceModal.requiredDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{doc}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-2 text-xs text-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">Valid Aadhaar Card / Government Photo Identity Proof</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Office Location Confirmation */}
                <div className="p-3.5 rounded-2xl bg-gov-50 border border-gov-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gov-700 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{officeName}</span>
                      <p className="text-slate-500 text-[11px]">
                        {selectedLocation.district} District, Tamil Nadu
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedServiceModal(null);
                      openLocationModal();
                    }}
                    className="text-gov-700 font-bold hover:underline"
                  >
                    Change Office
                  </button>
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>

                <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <button
                    onClick={() => {
                      const s = selectedServiceModal;
                      setSelectedServiceModal(null);
                      handleAction("token", s);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Ticket className="w-4 h-4" />
                    Walk-in Token
                  </button>

                  <button
                    onClick={() => {
                      const s = selectedServiceModal;
                      setSelectedServiceModal(null);
                      handleAction("appointment", s);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </button>

                  <button
                    onClick={() => {
                      const s = selectedServiceModal;
                      setSelectedServiceModal(null);
                      handleAction("apply", s);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    Apply Online
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalog;
