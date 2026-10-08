import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import ProfileModal from "./ProfileModal";
import LocationBreadcrumb from "./LocationBreadcrumb";
import PortalTitleBar from "./PortalTitleBar";
import {
  Menu,
  X,
  MapPin,
  BookOpen,
  Search,
  Monitor,
  User,
  LogOut,
  Landmark,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const getPageTitle = (pathname) => {
  if (pathname === "/") return "Smart Government Services";
  if (pathname === "/services") return "Government Services Directory";
  if (pathname === "/track") return "Track Application Status";
  if (pathname === "/notifications") return "Notification Center";
  if (pathname.startsWith("/display")) return "Public Screen Display";
  if (pathname === "/citizen") return "Citizen Portal Dashboard";
  if (pathname === "/citizen/take-token") return "Take Queue Token";
  if (pathname === "/citizen/apply") return "Apply Online for Services";
  if (pathname === "/citizen/applications") return "My Applications";
  if (pathname === "/citizen/appointments") return "My Appointments";
  if (pathname === "/citizen/queue") return "Live Queue Status";
  if (pathname.startsWith("/officer")) return "Officer Console Desk";
  if (pathname.startsWith("/admin")) return "State Administration Console";
  return "Smart Government Service Portal";
};

const Navbar = ({ onToggleMobileSidebar = () => {} }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();
  const { officeName, openLocationModal } = useGeoLocation();
  const navigate = useNavigate();
  const location = useLocation();

  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = getPageTitle(location.pathname);
  const isActive = (path) => location.pathname === path;

  // ==========================================
  // AUTHENTICATED TOP BAR (Requirement 13)
  // Left: ☰ Sidebar toggle, Page title, Breadcrumb
  // Right: 🔔 Notification Bell, Language Selector, Profile Avatar, Citizen Name
  // ==========================================
  if (isAuthenticated) {
    return (
      <>
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
          {/* Top Tricolor Accent */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-[#FF9933]"></div>
            <div className="w-1/3 bg-slate-100"></div>
            <div className="w-1/3 bg-[#138808]"></div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-3">
              {/* Left: ☰ toggle, Page Title, Breadcrumb */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onToggleMobileSidebar}
                  aria-label="Toggle navigation drawer"
                  className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
                >
                  <Menu className="w-5 h-5 text-[#0b3b60]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-heading truncate">
                      {pageTitle}
                    </h1>
                  </div>
                  {/* Location Breadcrumb always visible */}
                  <div className="hidden sm:block mt-0.5">
                    <LocationBreadcrumb />
                  </div>
                </div>
              </div>

              {/* Right: Notification Bell, Language Selector, Profile Avatar, Citizen Name */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <NotificationBell />

                <LanguageSwitcher variant="compact" />

                {/* Citizen Avatar & Name */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                    title="User Profile & Settings"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0b3b60] to-[#00809d] text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs border border-amber-400/40">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1 leading-tight">
                        {user?.fullName || "Citizen"}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {user?.role === "citizen"
                          ? "Citizen"
                          : user?.role === "officer"
                          ? "Duty Officer"
                          : "Administrator"}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Breadcrumb (shown underneath on small screens) */}
            <div className="sm:hidden mt-2 pt-2 border-t border-slate-100">
              <LocationBreadcrumb />
            </div>
          </div>
        </header>

        {showProfileModal && (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onLogout={handleLogout}
          />
        )}
      </>
    );
  }

  // ==========================================
  // PUBLIC GOVERNMENT HEADER (Requirement 5 & 32)
  // Top: Government Branding Header
  // Second: Blue/Cyan Portal Title Bar
  // ==========================================
  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Tricolor Top Line */}
        <div className="h-1 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-slate-100"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Main Branding Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Government Emblem & Identity */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPublicMenuOpen(!publicMenuOpen)}
                aria-label="Toggle Public Menu"
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
              >
                {publicMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center gap-3 group">
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
                    Citizen Portal • Appointments & Queue Management
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Language, Help, Login */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Selected Office Badge */}
              <button
                type="button"
                onClick={openLocationModal}
                title="Select or switch office jurisdiction"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0b3b60]" />
                <span className="max-w-[150px] truncate">{officeName}</span>
                <span className="text-[10px] text-[#0b3b60] font-bold uppercase underline ml-0.5">
                  Change
                </span>
              </button>

              <LanguageSwitcher variant="compact" />

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#0b3b60]" />
                <span>Help</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#0b3b60] border border-[#0b3b60]/40 hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0b3b60] hover:bg-[#082a45] shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Public Mobile Dropdown */}
        {publicMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Government Services
            </Link>
            <Link
              to="/track"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Track Application
            </Link>
            <Link
              to="/display"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Public Queue Display
            </Link>
            <div className="pt-2 border-t border-slate-200 flex gap-2">
              <Link
                to="/login"
                onClick={() => setPublicMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold text-[#0b3b60] border border-slate-300 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setPublicMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold text-white bg-[#0b3b60] rounded-lg"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Portal Title Bar */}
        <PortalTitleBar />
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0b3b60]" />
                Citizen Portal Helpdesk
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>Smart Government Service Portal</strong> enables citizens across Tamil Nadu to book appointments, generate queue tokens, and track government applications online.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <div className="font-bold text-slate-800">Support Helplines:</div>
                <div>Toll Free: 1800-425-1333 (TN e-Seva)</div>
                <div>Queue Assistance: 1100 (Citizen Care)</div>
                <div>Operating Hours: 09:30 AM - 05:30 PM (Mon - Sat)</div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Note: This platform is a demonstration project for academic and development purposes.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#0b3b60] hover:bg-[#082a45] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
