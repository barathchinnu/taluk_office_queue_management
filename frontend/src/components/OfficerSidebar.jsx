import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation as useGeoLocation } from "../context/LocationContext";
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Calendar,
  FileCheck2,
  FileText,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MapPin,
} from "lucide-react";
import ProfileModal from "./ProfileModal";

const OfficerSidebar = ({
  mobileOpen = false,
  onCloseMobile = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
}) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const { openLocationModal, officeName } = useGeoLocation();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Close on Escape key
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
    if (path === "/officer" && routerLocation.pathname === "/officer") return true;
    if (path !== "/officer" && routerLocation.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      id: "officer_dash",
      label: language === "ta" ? "அலுவலர் முகப்பு" : "Officer Dashboard",
      icon: LayoutDashboard,
      to: "/officer",
    },
    {
      id: "officer_queue",
      label: language === "ta" ? "வரிசை நிலை" : "Current Queue",
      icon: Clock,
      to: "/officer/queue",
    },
    {
      id: "officer_counter",
      label: language === "ta" ? "என் கவுண்டர்" : "My Counter Desk",
      icon: Briefcase,
      to: "/officer",
    },
    {
      id: "officer_appts",
      label: language === "ta" ? "நியமனங்கள்" : "Appointments",
      icon: Calendar,
      to: "/officer",
    },
    {
      id: "officer_apps",
      label: language === "ta" ? "விண்ணப்பங்கள்" : "Applications",
      icon: FileText,
      to: "/officer",
    },
    {
      id: "officer_verification",
      label: language === "ta" ? "ஆவண சரிபார்ப்பு" : "Document Verification",
      icon: FileCheck2,
      to: "/officer",
    },
    {
      id: "officer_notifs",
      label: language === "ta" ? "அறிவிப்புகள்" : "Notifications",
      icon: Bell,
      to: "/notifications",
    },
    {
      id: "officer_profile",
      label: language === "ta" ? "சுயவிவரம்" : "Profile",
      icon: User,
      onClick: () => setShowProfileModal(true),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Officer Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#07243b] text-slate-100 flex flex-col justify-between border-r border-[#0d3b60] transition-all duration-300 shadow-xl ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label="Officer Console Navigation"
      >
        <div className="flex flex-col">
          {/* Tricolor Bar */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-[#FF9933]"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-[#138808]"></div>
          </div>

          {/* Officer Brand */}
          <div className="p-4 border-b border-[#0f436d] flex items-center justify-between">
            <Link
              to="/officer"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b3b60] to-[#00809d] text-amber-400 border border-amber-400/30 flex items-center justify-center font-black shrink-0 shadow-md">
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase block">
                    Tamil Nadu Government
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                    Officer Console
                  </h2>
                  <span className="text-[10px] text-slate-300 truncate block mt-0.5">
                    Taluk Desk Administration
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Office Jurisdiction */}
          {!collapsed && (
            <div className="px-4 py-2.5 bg-black/20 border-b border-[#0f436d]">
              <button
                type="button"
                onClick={openLocationModal}
                className="w-full flex items-center gap-2 text-left group p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="truncate flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Office Jurisdiction
                  </span>
                  <span className="text-xs font-semibold text-amber-300 group-hover:underline truncate block">
                    {officeName}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => {
              const active = item.to ? isActive(item.to) : false;
              const Icon = item.icon;

              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all text-left"
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#00809d] to-[#0b3b60] text-white shadow-md border-l-4 border-amber-400"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-300" : "text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User & Logout */}
        <div className="p-3 border-t border-[#0f436d] bg-black/20">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div className="truncate flex-1 pl-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.fullName || "Officer Desk"}
                </div>
                <div className="text-[10px] text-amber-300 uppercase font-semibold">
                  Duty Officer
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Logout from console"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </>
  );
};

export default OfficerSidebar;
