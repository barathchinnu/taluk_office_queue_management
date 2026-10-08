import React from "react";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import { ChevronRight, MapPin } from "lucide-react";

const LocationBreadcrumb = ({ className = "" }) => {
  const { selectedLocation, isLocationSelected, openLocationModal } = useGeoLocation();

  if (!isLocationSelected) {
    return (
      <button
        onClick={openLocationModal}
        className={`flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-amber-500" />
        <span>Select Jurisdiction Location</span>
      </button>
    );
  }

  return (
    <nav
      aria-label="Location Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate ${className}`}
    >
      <span className="text-slate-800 font-semibold shrink-0">
        {selectedLocation?.state?.name || "Tamil Nadu"}
      </span>
      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="text-slate-800 font-semibold shrink-0">
        {selectedLocation?.district?.name || "District"}
      </span>
      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="text-slate-800 font-semibold shrink-0">
        {selectedLocation?.taluk?.name || "Taluk"}
      </span>
      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
      <button
        type="button"
        onClick={openLocationModal}
        title="Click to switch jurisdiction office"
        className="text-[#0b3b60] hover:text-[#00809d] font-bold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60 truncate transition-colors"
      >
        {selectedLocation?.office?.name || "Taluk Office"}
      </button>
    </nav>
  );
};

export default LocationBreadcrumb;
