import React, { useState, useEffect } from "react";
import {
  adminService,
  locationService,
  officeService,
  departmentService,
} from "../../services/api";
import {
  MapPin,
  Building2,
  Landmark,
  Layers,
  Users,
  Ticket,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  Monitor,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const StatewideHierarchyView = () => {
  const [hierarchyOverview, setHierarchyOverview] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Selection states for cascading drill-down
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedTalukId, setSelectedTalukId] = useState("");
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("all");

  // Office details state
  const [officeDetails, setOfficeDetails] = useState(null);
  const [queueData, setQueueData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingTaluks, setLoadingTaluks] = useState(false);
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");

  // 1. Initial Load: Hierarchy Overview & 38 Districts
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [overviewRes, distRes, deptRes] = await Promise.all([
          adminService.getHierarchyOverview().catch(() => ({})),
          locationService.getDistricts("TN").catch(() => ({})),
          departmentService.getAll().catch(() => ({})),
        ]);

        if (overviewRes.success) {
          setHierarchyOverview(overviewRes.counts);
        }

        const distList = distRes.data || distRes.districts || [];
        setDistricts(distList);

        const deptList = deptRes.departments || deptRes.data || [];
        setDepartments(deptList);

        // Preselect Coimbatore or first district for instant demonstration
        if (distList.length > 0) {
          const cbe = distList.find(
            (d) => d.name.toLowerCase() === "coimbatore"
          ) || distList[0];
          handleSelectDistrict(cbe._id, cbe);
        }
      } catch (err) {
        console.error("Hierarchy init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 2. When District changes -> fetch Taluks
  const handleSelectDistrict = async (distId, districtObj = null) => {
    setSelectedDistrictId(distId);
    setSelectedTalukId("");
    setSelectedOfficeId("");
    setOfficeDetails(null);
    setQueueData(null);

    if (!distId) {
      setTaluks([]);
      return;
    }

    try {
      setLoadingTaluks(true);
      const res = await locationService.getTaluks(distId);
      const talukList = res.data || res.taluks || [];
      setTaluks(talukList);

      // Auto-select Pollachi if Coimbatore, or first taluk
      if (talukList.length > 0) {
        const pol = talukList.find(
          (t) => t.name.toLowerCase() === "pollachi"
        ) || talukList[0];
        handleSelectTaluk(pol._id, pol);
      }
    } catch (err) {
      console.error("Failed to load taluks:", err);
    } finally {
      setLoadingTaluks(false);
    }
  };

  // 3. When Taluk changes -> fetch Taluk Office & Office Details
  const handleSelectTaluk = async (talukId, talukObj = null) => {
    setSelectedTalukId(talukId);
    setSelectedOfficeId("");
    setOfficeDetails(null);
    setQueueData(null);

    if (!talukId) return;

    try {
      setLoadingOffice(true);
      const offRes = await locationService.getOfficesByTaluk(talukId);
      const offList = offRes.data || offRes.offices || [];
      setOffices(offList);

      if (offList.length > 0) {
        const office = offList[0];
        setSelectedOfficeId(office._id);
        loadOfficeDrillDown(office._id, selectedDeptId);
      }
    } catch (err) {
      console.error("Failed to load taluk office:", err);
    } finally {
      setLoadingOffice(false);
    }
  };

  // 4. Load full office metrics & drill-down queue
  const loadOfficeDrillDown = async (officeId, deptId = "all") => {
    if (!officeId) return;
    try {
      setLoadingOffice(true);
      const params = { officeId };
      if (deptId && deptId !== "all") {
        params.departmentId = deptId;
      }

      const res = await adminService.getHierarchyDrillDown(params);
      if (res.success) {
        if (res.level === "queue") {
          setQueueData(res);
        } else {
          setOfficeDetails(res);
          setQueueData(null);
        }
      }
    } catch (err) {
      console.error("Failed to load office drill-down:", err);
    } finally {
      setLoadingOffice(false);
    }
  };

  const handleDeptFilterChange = (deptId) => {
    setSelectedDeptId(deptId);
    if (selectedOfficeId) {
      loadOfficeDrillDown(selectedOfficeId, deptId);
    }
  };

  const currentDistrict = districts.find((d) => d._id === selectedDistrictId);
  const currentTaluk = taluks.find((t) => t._id === selectedTalukId);
  const currentOffice = offices.find((o) => o._id === selectedOfficeId);

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. STATEWIDE METRIC KPI BANNER */}
      <div className="bg-gradient-to-r from-gov-900 via-indigo-950 to-gov-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 mb-2">
              <Landmark className="w-3.5 h-3.5" />
              Tamil Nadu State Administration Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Complete Statewide Hierarchy & Queue Dashboard
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Data-driven administrative governance across all 38 Revenue Districts and 317 Taluk Offices.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedOfficeId) loadOfficeDrillDown(selectedOfficeId, selectedDeptId);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 self-start md:self-auto border border-white/20 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>

        {/* 8 Official Statewide Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-6">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              State
            </span>
            <span className="text-lg font-black text-amber-300 mt-1 block">TN</span>
            <span className="text-[10px] text-slate-400">Tamil Nadu</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Districts
            </span>
            <span className="text-lg font-black text-white mt-1 block">
              {hierarchyOverview?.districts || 38}
            </span>
            <span className="text-[10px] text-emerald-400">100% Active</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Taluks
            </span>
            <span className="text-lg font-black text-white mt-1 block">
              {hierarchyOverview?.taluks || 317}
            </span>
            <span className="text-[10px] text-emerald-400">Authoritative</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Taluk Offices
            </span>
            <span className="text-lg font-black text-white mt-1 block">
              {hierarchyOverview?.offices || 317}
            </span>
            <span className="text-[10px] text-emerald-400">1 per Taluk</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Departments
            </span>
            <span className="text-lg font-black text-white mt-1 block">
              {hierarchyOverview?.departments || departments.length || 4}
            </span>
            <span className="text-[10px] text-slate-400">Administered</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Officers
            </span>
            <span className="text-lg font-black text-white mt-1 block">
              {hierarchyOverview?.officers || 0}
            </span>
            <span className="text-[10px] text-slate-400">Stationed</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Applications
            </span>
            <span className="text-lg font-black text-amber-300 mt-1 block">
              {hierarchyOverview?.applications || 0}
            </span>
            <span className="text-[10px] text-slate-400">Statewide</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Today's Tokens
            </span>
            <span className="text-lg font-black text-indigo-300 mt-1 block">
              {hierarchyOverview?.todayTokens || 0}
            </span>
            <span className="text-[10px] text-slate-400">Live Queues</span>
          </div>
        </div>
      </div>

      {/* 2. CASCADING LOCATION SELECTOR (Step 1 -> Step 2 -> Step 3 -> Step 4) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-gov-700" />
          <span>Cascading Hierarchy Drill-Down Explorer:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1: State */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Step 1: State
            </label>
            <div className="px-3.5 py-2.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Tamil Nadu (TN)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Official
              </span>
            </div>
          </div>

          {/* Step 2: District */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Step 2: District ({districts.length})</span>
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => {
                const distObj = districts.find((d) => d._id === e.target.value);
                handleSelectDistrict(e.target.value, distObj);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-gov-700 bg-white"
            >
              <option value="">-- Select District (All 38) --</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Taluk */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Step 3: Taluk ({taluks.length})</span>
              {loadingTaluks && (
                <span className="text-[10px] text-gov-700 animate-pulse">Loading...</span>
              )}
            </label>
            <select
              value={selectedTalukId}
              onChange={(e) => {
                const talukObj = taluks.find((t) => t._id === e.target.value);
                handleSelectTaluk(e.target.value, talukObj);
              }}
              disabled={!selectedDistrictId || taluks.length === 0}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-gov-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {selectedDistrictId ? "-- Select Taluk --" : "First choose a District"}
              </option>
              {taluks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Taluk Office */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Step 4: Government Office
            </label>
            <select
              value={selectedOfficeId}
              onChange={(e) => {
                setSelectedOfficeId(e.target.value);
                loadOfficeDrillDown(e.target.value, selectedDeptId);
              }}
              disabled={!selectedTalukId || offices.length === 0}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-gov-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {selectedTalukId ? "-- Select Office --" : "First choose a Taluk"}
              </option>
              {offices.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Active Hierarchy Breadcrumb */}
        {currentDistrict && currentTaluk && currentOffice && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Selected Drill-Down:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
              Tamil Nadu
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 font-bold text-indigo-700">
              {currentDistrict.name} District
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-emerald-700">
              {currentTaluk.name} Taluk
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded-md bg-amber-50 font-bold text-amber-800">
              {currentOffice.name}
            </span>
          </div>
        )}
      </div>

      {/* 3. DRILL-DOWN OFFICE INSPECTION BOARD */}
      {selectedOfficeId && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Office Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gov-700 bg-gov-100 px-2 py-0.5 rounded-md">
                  Official Taluk Office
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Code: {currentOffice?.code || "TN-HQ"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {currentOffice?.name}
              </h3>
              <p className="text-xs text-slate-600">
                Jurisdiction: {currentTaluk?.name} Taluk, {currentDistrict?.name} District, Tamil Nadu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">Timings</span>
                <span className="text-xs font-bold text-slate-800">09:30 AM – 05:30 PM</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">Office Queue Status</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Active & Isolated
                </span>
              </div>
            </div>
          </div>

          {/* Department Queue Filter for this Office */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Department for Live Queue Isolation:
              </span>
              <span className="text-xs text-slate-500">
                Showing queue scoped to {currentOffice?.name}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDeptFilterChange("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDeptId === "all"
                    ? "bg-gov-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d._id}
                  onClick={() => handleDeptFilterChange(d._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDeptId === d._id
                      ? "bg-gov-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Office Resources Overview */}
          {loadingOffice ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-700 mx-auto"></div>
              <p className="mt-3 text-xs text-slate-500">Loading office hierarchy metrics...</p>
            </div>
          ) : queueData ? (
            /* Queue Specific Drill-Down View */
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-gov-700" />
                  Live Counter Queue: {queueData.department?.name} Department
                </h4>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {queueData.queue?.length || 0} Tokens Active
                </span>
              </div>

              {queueData.queue?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No active tokens in queue today for this department at {currentOffice?.name}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Token</th>
                        <th className="p-3">Citizen</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Queue Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queueData.queue.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold font-mono text-gov-800">
                            {t.tokenDisplay}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {t.citizen?.fullName || "Citizen"}
                          </td>
                          <td className="p-3 text-slate-600">{t.service?.name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                t.status === "serving"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : t.status === "called"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(t.queueDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Office Resources Cards (Counters, Officers, Summary) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Stationed Counters */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-gov-700" />
                    Stationed Counters
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                    {officeDetails?.counters?.length || 0}
                  </span>
                </div>
                {officeDetails?.counters?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No physical counters assigned yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {officeDetails?.counters?.map((c) => (
                      <div
                        key={c._id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">
                          Counter {c.counterNumber} ({c.name})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          {c.department?.name || "Dept"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stationed Officers */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-700" />
                    Stationed Officers
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                    {officeDetails?.officers?.length || 0}
                  </span>
                </div>
                {officeDetails?.officers?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No dedicated officers stationed yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {officeDetails?.officers?.map((o) => (
                      <div
                        key={o._id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {o.user?.fullName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {o.designation} ({o.employeeId})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700">
                          {o.department?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Office Metrics */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Office Workflow Stats
                </span>

                <div className="space-y-2 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Total Applications:</span>
                    <span className="font-extrabold text-slate-900">
                      {officeDetails?.activeAppsCount || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Tokens Issued Today:</span>
                    <span className="font-extrabold text-slate-900">
                      {officeDetails?.todayTokensCount || 0}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Service Catalog:</span>
                    <span className="font-extrabold text-slate-900">
                      {officeDetails?.services?.length || 0} Services
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatewideHierarchyView;
