import React from "react";
import { useLocation } from "../context/LocationContext";
import { MapPin, ChevronRight, Compass, Sparkles, Building2 } from "lucide-react";

const LocationHeader = ({ className = "" }) => {
  const {
    selectedLocation,
    isLocationSelected,
    breadcrumb,
    openLocationModal,
  } = useLocation();

  return (
    <div
      className={`bg-white/90 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
        <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
          <MapPin className="w-3.5 h-3.5" />
        </div>

        {isLocationSelected ? (
          <div className="flex items-center gap-1.5 flex-wrap font-medium text-slate-700">
            <span className="text-slate-900 font-semibold">
              {selectedLocation?.state?.name || "Tamil Nadu"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">
              {selectedLocation?.district?.name || "District"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">
              {selectedLocation?.taluk?.name || "Taluk"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-gov-700 font-bold bg-gov-50 px-2 py-0.5 rounded-md border border-gov-200">
              {selectedLocation?.office?.name || "Taluk Office"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-amber-700 font-semibold">
              Select your service location
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (Choose district & taluk office for localized services)
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openLocationModal}
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors border border-slate-300 hover:border-gov-600 hover:text-gov-700 hover:bg-gov-50 text-slate-700 bg-white shadow-2xs"
      >
        <Compass className="w-3.5 h-3.5 text-gov-600" />
        {isLocationSelected ? "Change Office" : "Select Location"}
      </button>
    </div>
  );
};

export default LocationHeader;
