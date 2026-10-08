import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import ProfileModal from "./ProfileModal";
import {
  Building2,
  Menu,
  X,
  MapPin,
  BookOpen,
  Search,
  Monitor,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

const getPageTitle = (pathname) => {
  if (pathname === "/") return "Smart e-Seva Portal";
  if (pathname === "/services") return "Government Services Directory";
  if (pathname === "/track") return "Track Application Status";
  if (pathname === "/notifications") return "Notification Center";
  if (pathname.startsWith("/display")) return "Public Screen Display";
  if (pathname === "/citizen") return "Citizen Services Dashboard";
  if (pathname === "/citizen/take-token") return "Walk-in Token Dispenser";
  if (pathname === "/citizen/apply") return "Apply Online for Services";
  if (pathname === "/citizen/applications") return "My Applications";
  if (pathname === "/citizen/appointments") return "My Appointments";
  if (pathname === "/citizen/queue") return "Live Taluk Queue Status";
  if (pathname.startsWith("/officer")) return "Officer Console Desk";
  if (pathname.startsWith("/admin")) return "State Administration Console";
  return "Tamil Nadu Government Services";
};

const Navbar = ({ onToggleMobileSidebar = () => {} }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();
  const { officeName, openLocationModal, isLocationSelected } = useGeoLocation();
  const navigate = useNavigate();
  const location = useLocation();

  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = getPageTitle(location.pathname);
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        {/* Top tricolor header accent */}
        <div className="h-1 w-full flex">
          <div className="w-1/3 bg-amber-500"></div>
          <div className="w-1/3 bg-slate-200"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section: Mobile hamburger + Page Title / Brand */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger button: Toggles sidebar drawer if logged in, or public menu if logged out */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onToggleMobileSidebar}
                  aria-label="Open sidebar navigation"
                  className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPublicMenuOpen(!publicMenuOpen)}
                  aria-label="Open navigation menu"
                  className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-hidden"
                >
                  {publicMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {/* Brand Logo (Visible on public pages or mobile) */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-700 to-indigo-900 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                {!isAuthenticated && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">
                      Tamil Nadu Govt
                    </span>
                    <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                      Smart e-Seva Portal
                    </h1>
                  </div>
                )}
              </Link>

              {/* Authenticated Page Title on Desktop */}
              {isAuthenticated && (
                <div className="hidden sm:block pl-2 border-l border-slate-200">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {pageTitle}
                  </h2>
                </div>
              )}
            </div>

            {/* Public Center Links (Only for unauthenticated public visitors) */}
            {!isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/services")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-gov-600" />
                  Services
                </Link>
                <Link
                  to="/track"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/track")
                      ? "bg-gov-50 text-gov-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Track Application
                </Link>
                <Link
                  to="/display"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive("/display")
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                  Public Queue
                </Link>
              </nav>
            )}

            {/* Right Section: Location Badge, Notification Bell, Language, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Location Badge */}
              <button
                type="button"
                onClick={openLocationModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200"
                title="Change Jurisdiction / Taluk Office"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline max-w-[130px] lg:max-w-[180px] truncate">
                  {officeName}
                </span>
                <span className="sm:hidden text-[11px] font-bold">Location</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Notification Bell (for authenticated users) */}
              {isAuthenticated && <NotificationBell />}

              {/* Global Language Switcher */}
              <LanguageSwitcher variant="compact" />

              {/* User Profile / Auth Actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                    title="User Profile & Settings"
                  >
                    <div className="w-8 h-8 rounded-full bg-gov-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1 leading-tight">
                        {user?.fullName}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 capitalize">
                        {user?.role === "citizen"
                          ? "Citizen"
                          : user?.role === "officer"
                          ? "Officer"
                          : "Admin"}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    aria-label="Logout"
                    className="hidden sm:flex items-center gap-1 p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-gov-700 hover:bg-gov-800 rounded-lg shadow-2xs transition-all"
                  >
                    Citizen Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Public Mobile Dropdown (Only for unauthenticated visitors) */}
        {!isAuthenticated && publicMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Services Directory
            </Link>
            <Link
              to="/track"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Track Application
            </Link>
            <Link
              to="/display"
              onClick={() => setPublicMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Public Queue Display
            </Link>
            <div className="pt-2 border-t border-slate-200 flex gap-2">
              <Link
                to="/login"
                onClick={() => setPublicMenuOpen(false)}
                className="w-1/2 text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setPublicMenuOpen(false)}
                className="w-1/2 text-center py-2 text-sm font-semibold text-white bg-gov-700 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
