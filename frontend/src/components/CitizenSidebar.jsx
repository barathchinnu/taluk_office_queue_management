import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import {
  Home,
  MapPin,
  Landmark,
  Building2,
  Ticket,
  Calendar,
  FileText,
  Bell,
  Search,
  Star,
  Settings,
  User,
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
  BarChart3,
  Compass,
  Building,
  CheckCircle2,
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

  // Navigation Items by Role
  const citizenNavItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      to: "/citizen",
    },
    {
      id: "location",
      label: "Select Location",
      icon: MapPin,
      onClick: openLocationModal,
      highlight: true,
    },
    {
      id: "services",
      label: "Government Services",
      icon: Landmark,
      to: "/services",
    },
    {
      id: "token",
      label: "My Token",
      icon: Ticket,
      to: "/citizen/take-token",
    },
    {
      id: "appointments",
      label: "My Appointments",
      icon: Calendar,
      to: "/citizen/appointments",
    },
    {
      id: "applications",
      label: "My Applications",
      icon: FileText,
      to: "/citizen/applications",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      to: "/notifications",
    },
    {
      id: "track",
      label: "Track Application",
      icon: Search,
      to: "/track",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: Star,
      onClick: () => setShowFeedbackModal(true),
    },
    {
      id: "profile",
      label: "Profile / Settings",
      icon: Settings,
      onClick: () => setShowProfileModal(true),
    },
  ];

  const officerNavItems = [
    {
      id: "officer_dash",
      label: "Dashboard",
      icon: Home,
      to: "/officer",
    },
    {
      id: "officer_location",
      label: "Office Jurisdiction",
      icon: MapPin,
      onClick: openLocationModal,
    },
    {
      id: "officer_counter",
      label: "My Counter Desk",
      icon: Briefcase,
      to: "/officer",
    },
    {
      id: "officer_queue",
      label: "Department Queue",
      icon: Clock,
      to: "/officer/queue",
    },
    {
      id: "officer_appts",
      label: "Appointments",
      icon: Calendar,
      to: "/officer",
    },
    {
      id: "officer_apps",
      label: "Applications & Docs",
      icon: FileText,
      to: "/officer",
    },
    {
      id: "officer_notifs",
      label: "Notifications",
      icon: Bell,
      to: "/notifications",
    },
    {
      id: "officer_profile",
      label: "Profile / Settings",
      icon: Settings,
      onClick: () => setShowProfileModal(true),
    },
  ];

  const adminNavItems = [
    {
      id: "admin_dash",
      label: "Dashboard",
      icon: Home,
      to: "/admin",
    },
    {
      id: "admin_locations",
      label: "38-District Hierarchy",
      icon: Compass,
      to: "/admin?tab=hierarchy",
    },
    {
      id: "admin_offices",
      label: "Government Offices",
      icon: Building2,
      to: "/admin?tab=offices",
    },
    {
      id: "admin_depts",
      label: "Departments",
      icon: Layers,
      to: "/admin?tab=depts",
    },
    {
      id: "admin_services",
      label: "Services Directory",
      icon: BookOpen,
      to: "/admin?tab=services",
    },
    {
      id: "admin_officers",
      label: "Officers & Staff",
      icon: Users,
      to: "/admin?tab=officers",
    },
    {
      id: "admin_counters",
      label: "Service Counters",
      icon: Monitor,
      to: "/admin?tab=counters",
    },
    {
      id: "admin_apps",
      label: "Citizen Applications",
      icon: FileText,
      to: "/admin?tab=applications",
    },
    {
      id: "admin_feedback",
      label: "Citizen Feedback",
      icon: Star,
      to: "/admin?tab=feedback",
    },
    {
      id: "admin_notifs",
      label: "Notifications",
      icon: Bell,
      to: "/notifications",
    },
    {
      id: "admin_profile",
      label: "Profile / Settings",
      icon: Settings,
      onClick: () => setShowProfileModal(true),
    },
  ];

  const navItems =
    role === "officer"
      ? officerNavItems
      : role === "admin"
      ? adminNavItems
      : citizenNavItems;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 shadow-xl ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Main Navigation Sidebar"
      >
        {/* Top: Header / Portal Brand */}
        <div className="flex flex-col">
          {/* Tricolor accent bar */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-amber-500"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-emerald-600"></div>
          </div>

          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link
              to={role === "citizen" ? "/citizen" : role === "officer" ? "/officer" : "/admin"}
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase block">
                    Tamil Nadu Govt
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                    Smart e-Seva Portal
                  </h2>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                    Taluk Service Platform
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
            <div className="px-4 py-2.5 bg-slate-850/60 border-b border-slate-800/80">
              <button
                type="button"
                onClick={openLocationModal}
                className="w-full flex items-center gap-2 text-left group p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="truncate flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Active Taluk Office
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
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 focus:outline-hidden"
          role="navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.to ? isActive(item.to) : false;

            const content = (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 relative group ${
                  active
                    ? "bg-gov-700/80 text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                {/* Left active indicator pill */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    active ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
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
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {isAuthenticated ? (
            <>
              <div
                onClick={() => setShowProfileModal(true)}
                className={`flex items-center gap-3 p-2 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
                title="View Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gov-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-600">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
                {!collapsed && (
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user?.fullName || "Citizen"}
                    </p>
                    <p className="text-[10px] text-amber-400 capitalize truncate">
                      {role === "citizen"
                        ? "Citizen User"
                        : role === "officer"
                        ? "Revenue Officer"
                        : "System Admin"}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-900/50 rounded-xl transition-colors ${
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
                className="w-full block py-2 text-center text-xs font-semibold text-white bg-gov-700 hover:bg-gov-600 rounded-xl transition-colors"
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
