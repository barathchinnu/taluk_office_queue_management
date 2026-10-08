import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Building2,
  Menu,
  X,
  Search,
  HelpCircle,
  User,
  LogOut,
  MapPin,
  ChevronDown,
  Landmark,
  Shield,
  FileText,
  Calendar,
  Ticket,
} from "lucide-react";

const GovernmentHeader = ({ onToggleMobileSidebar = () => {} }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const { officeName, openLocationModal } = useGeoLocation();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Tricolor Accent Line */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white border-y border-slate-200"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Main Official Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Government Logo & Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                aria-label="Toggle Navigation Sidebar"
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              {/* Government Emblem Symbol Placeholder */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#0b3b60] to-[#052137] border-2 border-amber-500/40 p-1.5 flex items-center justify-center text-amber-400 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
              </div>

              <div>
                <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#0b3b60] flex items-center gap-1.5 leading-tight">
                  <span>Tamil Nadu Government</span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:inline text-amber-700 font-semibold">தமிழ்நாடு அரசு</span>
                </div>
                <div className="text-sm sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  Smart Government Services
                </div>
                <div className="text-[10px] text-slate-500 hidden sm:block">
                  Citizen Portal • Appointments & Queue Administration
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Quick Utility Links & Language */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Active Stationed Location Chip */}
            <button
              onClick={openLocationModal}
              title="Click to switch jurisdiction taluk office"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-gov-700" />
              <span className="max-w-[140px] truncate">{officeName}</span>
              <span className="text-[10px] text-gov-700 font-bold uppercase underline ml-0.5">
                Change
              </span>
            </button>

            {/* Language Switcher */}
            <div className="border-r border-slate-200 pr-2 sm:pr-4">
              <LanguageSwitcher />
            </div>

            {/* Help / Track shortcut */}
            <Link
              to="/track"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-gov-700 py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Track</span>
            </Link>

            {/* Auth CTA or User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === "admin" ? "/admin" : user?.role === "officer" ? "/officer" : "/citizen"}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gov-50 hover:bg-gov-100 border border-gov-200 text-gov-900 text-xs font-bold transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center text-[11px] font-bold">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="hidden md:flex px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blue / Cyan Portal Title Bar */}
      <div className="bg-gradient-to-r from-[#0b3b60] via-[#0f4b7a] to-[#00809d] text-white py-2 px-4 sm:px-6 lg:px-8 border-t border-b border-[#082a45]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white/95">
            <span className="text-base leading-none">🏛</span>
            <span className="uppercase tracking-wider font-extrabold text-amber-300">
              Smart Government Service Portal
            </span>
            <span className="text-white/60 hidden md:inline">|</span>
            <span className="text-slate-200 hidden md:inline font-normal text-[11px]">
              Tamil Nadu Unified e-Governance & Queue Token Desk
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-white/90">
            <Link
              to="/services"
              className="hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Services Catalog
            </Link>
            <span>•</span>
            <Link
              to={isAuthenticated ? "/citizen/appointments" : "/login"}
              className="hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              Book Slot
            </Link>
            <span>•</span>
            <Link
              to="/display"
              className="hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Ticket className="w-3 h-3" />
              Live Screen
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovernmentHeader;
