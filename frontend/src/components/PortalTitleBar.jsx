import React from "react";
import { Link } from "react-router-dom";
import { Landmark, MapPin } from "lucide-react";
import { useLocation as useGeoLocation } from "../context/LocationContext";

const PortalTitleBar = ({ subtitle = "Government Services, Appointments & Queue Management", showLocation = true }) => {
  const { officeName, selectedLocation, openLocationModal } = useGeoLocation();

  return (
    <div className="bg-gradient-to-r from-[#0b3b60] via-[#0f4b7a] to-[#00809d] text-white py-2.5 px-4 sm:px-6 lg:px-8 border-y border-[#082a45] shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="text-base">🏛</span>
          <span className="text-sm font-extrabold uppercase tracking-wider text-amber-300 font-heading">
            Smart Government Service Portal
          </span>
          <span className="text-white/40 hidden md:inline">|</span>
          <span className="text-slate-200 hidden md:inline text-[11px] font-normal">
            {subtitle}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/display"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] shadow-xs transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>📺 Live Queue Screen</span>
          </Link>

          {showLocation && (
            <button
              onClick={openLocationModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/20 transition-colors"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{officeName || "Pollachi Taluk Office"}</span>
              <span className="text-amber-300 font-bold underline ml-0.5">Switch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalTitleBar;
