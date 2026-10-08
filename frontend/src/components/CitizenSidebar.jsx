import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import {
  LayoutDashboard,
  MapPin,
  Landmark,
  Ticket,
  Calendar,
  FileText,
  Bell,
  Search,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Users,
  Clock,
  Layers,
  BookOpen,
  Monitor,
  Compass,
} from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import ProfileModal from "./ProfileModal";

const CitizenSidebar = ({
  mobileOpen = false,
  onCloseMobile = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();
  const { openLocationModal, breadcrumb, officeName } = useGeoLocation();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Requirement 14: Escape key closes sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/citizen" && routerLocation.pathname === "/citizen") return true;
    if (path === "/" && routerLocation.pathname === "/") return true;
    if (path !== "/" && path !== "/citizen" && routerLocation.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const role = user?.role || "citizen";

  // Requirement 12: Citizen Sidebar Items
  const citizenNavItems = [
    {
      id: "dashboard",
      label: language === "ta" ? "முகப்பு" : "Dashboard",
      icon: LayoutDashboard,
      to: "/citizen",
    },
    {
      id: "location",
      label: language === "ta" ? "இருப்பிடத்தை தேர்வு செய்க" : "Select Location",
      icon: MapPin,
      onClick: openLocationModal,
      highlight: true,
    },
    {
      id: "services",
      label: language === "ta" ? "அரசு சேவைகள்" : "Government Services",
      icon: Landmark,
      to: "/services",
    },
    {
      id: "token",
      label: language === "ta" ? "என் டோக்கன்" : "My Token",
      icon: Ticket,
      to: "/citizen/take-token",
    },
    {
      id: "appointments",
      label: language === "ta" ? "என் நியமனங்கள்" : "My Appointments",
      icon: Calendar,
      to: "/citizen/appointments",
    },
    {
      id: "applications",
      label: language === "ta" ? "என் விண்ணப்பங்கள்" : "My Applications",
      icon: FileText,
      to: "/citizen/applications",
    },
    {
      id: "notifications",
      label: language === "ta" ? "அறிவிப்புகள்" : "Notifications",
      icon: Bell,
      to: "/notifications",
    },
    {
      id: "track",
      label: language === "ta" ? "விண்ணப்பத்தை கண்காணிக்க" : "Track Application",
      icon: Search,
      to: "/track",
    },
    {
      id: "feedback",
      label: language === "ta" ? "கருத்து தெரிவிக்க" : "Feedback",
      icon: Star,
      onClick: () => setShowFeedbackModal(true),
    },
    {
      id: "profile",
      label: language === "ta" ? "சுயவிவரம் / அமைப்புகள்" : "Profile / Settings",
      icon: Settings,
      onClick: () => setShowProfileModal(true),
    },
  ];

  const navItems = citizenNavItems;

  return (
    <>
      {/* Mobile Backdrop Overlay - Clicking outside closes sidebar */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#07253d] text-slate-100 flex flex-col justify-between border-r border-[#0d3b60] transition-all duration-300 shadow-xl ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Main Citizen Navigation Sidebar"
      >
        {/* Top: Header / Portal Brand */}
        <div className="flex flex-col">
          {/* Tricolor accent bar */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-[#FF9933]"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-[#138808]"></div>
          </div>

          <div className="p-4 border-b border-[#0d3b60] flex items-center justify-between">
            <Link
              to="/citizen"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b3b60] to-[#00809d] border border-amber-400/40 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase block">
                    Tamil Nadu Government
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                    Smart Government
                  </h2>
                  <span className="text-[10px] text-slate-300 truncate block mt-0.5">
                    Citizen Service Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Location Badge (when expanded) */}
          {!collapsed && (
            <div className="px-4 py-2.5 bg-black/20 border-b border-[#0d3b60]">
              <button
                type="button"
                onClick={openLocationModal}
                className="w-full flex items-center gap-2 text-left group p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="truncate flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Selected Taluk Office
                  </span>
                  <span className="text-xs font-semibold text-amber-300 group-hover:underline truncate block">
                    {officeName}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Middle: Navigation Items */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1 focus:outline-hidden"
          role="navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.to ? isActive(item.to) : false;

            const content = (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 relative group ${
                  active
                    ? "bg-gradient-to-r from-[#00809d] to-[#0b3b60] text-white font-bold shadow-sm border-l-4 border-amber-400"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                    active ? "text-amber-300" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />

                {!collapsed && (
                  <span className="truncate leading-none">{item.label}</span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50 pointer-events-none">
                    <span className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-950 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    onCloseMobile();
                  }}
                  className="w-full text-left"
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={onCloseMobile}
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User Profile Card & Logout */}
        <div className="p-3 border-t border-[#0d3b60] bg-black/20 space-y-2">
          {isAuthenticated ? (
            <>
              <div
                onClick={() => setShowProfileModal(true)}
                className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
                title="View Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 border border-amber-300">
                  {user?.fullName?.charAt(0) || "C"}
                </div>
                {!collapsed && (
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user?.fullName || "Citizen"}
                    </p>
                    <p className="text-[10px] text-amber-300 uppercase font-semibold">
                      Citizen Account
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-900/40 rounded-xl transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </>
          ) : (
            <div className={`space-y-1.5 ${collapsed ? "text-center" : ""}`}>
              <Link
                to="/login"
                onClick={onCloseMobile}
                className="w-full block py-2 text-center text-xs font-bold text-white bg-[#0b3b60] hover:bg-[#082a45] rounded-xl transition-colors"
              >
                {collapsed ? "In" : "Sign In"}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default CitizenSidebar;
