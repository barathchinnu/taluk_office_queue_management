import React, { useState, useEffect } from "react";
import { useLocation as useLocationContext } from "../context/LocationContext";
import { locationService, officeService } from "../services/api";
import {
  MapPin,
  Building2,
  Check,
  X,
  Compass,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";

const LocationSelectorModal = () => {
  const {
    isLocationModalOpen,
    closeLocationModal,
    selectedLocation,
    selectLocation,
  } = useLocationContext();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [offices, setOffices] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedTalukId, setSelectedTalukId] = useState("");
  const [selectedOfficeId, setSelectedOfficeId] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [selectedOfficeDetail, setSelectedOfficeDetail] = useState(null);

  // Load States on mount
  useEffect(() => {
    if (!isLocationModalOpen) return;

    const loadStates = async () => {
      try {
        const res = await locationService.getStates();
        if (res.success && res.data) {
          setStates(res.data);
          const tnState = res.data.find((s) => s.code === "TN") || res.data[0];
          if (tnState) {
            setSelectedStateId(tnState._id);
          }
        }
      } catch (err) {
        console.error("Error loading states:", err);
      }
    };

    loadStates();
  }, [isLocationModalOpen]);

  // Load Districts when state changes
  useEffect(() => {
    if (!selectedStateId) return;

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const res = await locationService.getDistricts(selectedStateId);
        if (res.success && res.data) {
          setDistricts(res.data);
          // Auto-select previously selected or first
          if (selectedLocation?.district?._id) {
            const found = res.data.find((d) => d._id === selectedLocation.district._id);
            if (found) {
              setSelectedDistrictId(found._id);
              return;
            }
          }
          if (res.data.length > 0) {
            // Default to Coimbatore if available
            const cbe = res.data.find((d) => d.name.toLowerCase() === "coimbatore") || res.data[0];
            setSelectedDistrictId(cbe._id);
          }
        }
      } catch (err) {
        console.error("Error loading districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedStateId, selectedLocation]);

  // Load Taluks when district changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setTaluks([]);
      return;
    }

    const loadTaluks = async () => {
      try {
        setLoadingTaluks(true);
        const res = await locationService.getTaluks(selectedDistrictId);
        if (res.success && res.data) {
          setTaluks(res.data);
          if (selectedLocation?.taluk?._id) {
            const found = res.data.find((t) => t._id === selectedLocation.taluk._id);
            if (found) {
              setSelectedTalukId(found._id);
              return;
            }
          }
          if (res.data.length > 0) {
            // Default to Pollachi if available
            const pol = res.data.find((t) => t.name.toLowerCase() === "pollachi") || res.data[0];
            setSelectedTalukId(pol._id);
          }
        }
      } catch (err) {
        console.error("Error loading taluks:", err);
      } finally {
        setLoadingTaluks(false);
      }
    };

    loadTaluks();
  }, [selectedDistrictId, selectedLocation]);

  // Load Offices when taluk changes
  useEffect(() => {
    if (!selectedTalukId) {
      setOffices([]);
      setSelectedOfficeDetail(null);
      return;
    }

    const loadOffices = async () => {
      try {
        setLoadingOffices(true);
        const res = await locationService.getOfficesByTaluk(selectedTalukId);
        if (res.success && res.data) {
          setOffices(res.data);
          if (res.data.length > 0) {
            setSelectedOfficeId(res.data[0]._id);
            setSelectedOfficeDetail(res.data[0]);
          } else {
            setSelectedOfficeId("");
            setSelectedOfficeDetail(null);
          }
        }
      } catch (err) {
        console.error("Error loading offices:", err);
      } finally {
        setLoadingOffices(false);
      }
    };

    loadOffices();
  }, [selectedTalukId]);

  // Update selected office details when office dropdown changes
  const handleOfficeChange = (e) => {
    const offId = e.target.value;
    setSelectedOfficeId(offId);
    const found = offices.find((o) => o._id === offId);
    setSelectedOfficeDetail(found || null);
  };

  const handleConfirmLocation = () => {
    if (!selectedOfficeDetail) return;

    const stateObj = states.find((s) => s._id === selectedStateId) || {
      name: selectedOfficeDetail.state || "Tamil Nadu",
      code: "TN",
    };
    const distObj = districts.find((d) => d._id === selectedDistrictId) || {
      name: selectedOfficeDetail.district || "Coimbatore",
      code: "CBE",
    };
    const talukObj = taluks.find((t) => t._id === selectedTalukId) || {
      name: selectedOfficeDetail.taluk || "Pollachi",
      code: "POL",
    };

    selectLocation({
      state: stateObj,
      district: distObj,
      taluk: talukObj,
      office: selectedOfficeDetail,
    });

    closeLocationModal();
  };

  // Quick switch demo buttons for rapid evaluation
  const handleQuickSwitch = async (talukName) => {
    try {
      setLoadingOffices(true);
      const res = await officeService.getAll();
      if (res.success && res.data) {
        const found = res.data.find(
          (o) =>
            o.taluk?.toLowerCase() === talukName.toLowerCase() ||
            o.name?.toLowerCase().includes(talukName.toLowerCase())
        );
        if (found) {
          selectLocation({
            state: { name: found.state || "Tamil Nadu", code: "TN" },
            district: { name: found.district || "District", code: "DIST" },
            taluk: { name: found.taluk || talukName, code: "TAL" },
            office: found,
          });
          closeLocationModal();
        }
      }
    } catch (err) {
      console.error("Quick switch error:", err);
    } finally {
      setLoadingOffices(false);
    }
  };

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Tricolor Bar */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-amber-500"></div>
          <div className="w-1/3 bg-slate-100"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gov-700 text-amber-400 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Select Government Service Location
              </h2>
              <p className="text-xs text-slate-500">
                Tamil Nadu Statewide Taluk & Administrative Jurisdiction
              </p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Popular Taluk Offices
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Quick switch</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "Pollachi", dist: "Coimbatore" },
                { name: "Harur", dist: "Dharmapuri" },
                { name: "Salem", dist: "Salem" },
                { name: "Mylapore", dist: "Chennai" },
              ].map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleQuickSwitch(loc.name)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    selectedLocation?.taluk?.name?.toLowerCase() === loc.name.toLowerCase()
                      ? "border-gov-600 bg-gov-50/70 text-gov-800 font-semibold ring-1 ring-gov-600"
                      : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{loc.name}</p>
                  <p className="text-[10px] text-slate-500">{loc.dist}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Geographic Hierarchy Selection
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. State Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. State
                </label>
                <select
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
                >
                  {states.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. District {loadingDistricts && <span className="text-gov-600 text-xs">...</span>}
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  disabled={loadingDistricts || districts.length === 0}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-600 focus:outline-hidden disabled:bg-slate-100"
                >
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Taluk Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Taluk {loadingTaluks && <span className="text-gov-600 text-xs">...</span>}
                </label>
                <select
                  value={selectedTalukId}
                  onChange={(e) => setSelectedTalukId(e.target.value)}
                  disabled={loadingTaluks || taluks.length === 0}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-600 focus:outline-hidden disabled:bg-slate-100"
                >
                  {taluks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Government Office Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Government Office {loadingOffices && <span className="text-gov-600 text-xs">...</span>}
                </label>
                <select
                  value={selectedOfficeId}
                  onChange={handleOfficeChange}
                  disabled={loadingOffices || offices.length === 0}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-600 focus:outline-hidden disabled:bg-slate-100"
                >
                  {offices.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Office Details Card */}
          {selectedOfficeDetail && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Jurisdiction
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Code: {selectedOfficeDetail.code}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {selectedOfficeDetail.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {selectedOfficeDetail.address || `${selectedOfficeDetail.taluk}, ${selectedOfficeDetail.district}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedOfficeDetail.openingTime || "09:30 AM"} - {selectedOfficeDetail.closingTime || "05:30 PM"}
                  </span>
                </div>
                {selectedOfficeDetail.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOfficeDetail.contactPhone}</span>
                  </div>
                )}
                {selectedOfficeDetail.email && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{selectedOfficeDetail.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={closeLocationModal}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!selectedOfficeDetail}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Set Active Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectorModal;
