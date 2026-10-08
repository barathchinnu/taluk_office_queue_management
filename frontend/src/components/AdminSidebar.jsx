import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Compass,
  Building2,
  Layers,
  BookOpen,
  Users,
  Monitor,
  Calendar,
  Ticket,
  FileText,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import ProfileModal from "./ProfileModal";

const AdminSidebar = ({
  mobileOpen = false,
  onCloseMobile = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
}) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
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

  const navItems = [
    {
      id: "admin_dash",
      label: language === "ta" ? "நிர்வாக முகப்பு" : "Dashboard",
      icon: LayoutDashboard,
      to: "/admin",
    },
    {
      id: "admin_locations",
      label: language === "ta" ? "38-மாவட்ட படிநிலை" : "38-District Hierarchy",
      icon: Compass,
      to: "/admin?tab=hierarchy",
    },
    {
      id: "admin_offices",
      label: language === "ta" ? "வட்டாட்சியர் அலுவலகங்கள்" : "Government Offices",
      icon: Building2,
      to: "/admin?tab=offices",
    },
    {
      id: "admin_depts",
      label: language === "ta" ? "துறைகள்" : "Departments",
      icon: Layers,
      to: "/admin?tab=depts",
    },
    {
      id: "admin_services",
      label: language === "ta" ? "சேவை அடைவு" : "Services Directory",
      icon: BookOpen,
      to: "/admin?tab=services",
    },
    {
      id: "admin_officers",
      label: language === "ta" ? "அலுவலர்கள்" : "Officers & Staff",
      icon: Users,
      to: "/admin?tab=officers",
    },
    {
      id: "admin_counters",
      label: language === "ta" ? "கவுண்டர்கள்" : "Service Counters",
      icon: Monitor,
      to: "/admin?tab=counters",
    },
    {
      id: "admin_appointments",
      label: language === "ta" ? "நியமனங்கள்" : "Appointments",
      icon: Calendar,
      to: "/admin?tab=appointments",
    },
    {
      id: "admin_applications",
      label: language === "ta" ? "விண்ணப்பங்கள்" : "Citizen Applications",
      icon: FileText,
      to: "/admin?tab=applications",
    },
    {
      id: "admin_feedback",
      label: language === "ta" ? "கருத்துகள்" : "Citizen Feedback",
      icon: Star,
      to: "/admin?tab=feedback",
    },
    {
      id: "admin_settings",
      label: language === "ta" ? "அமைப்புகள்" : "Settings",
      icon: Settings,
      onClick: () => setShowProfileModal(true),
    },
  ];

  const searchParams = new URLSearchParams(routerLocation.search);
  const currentTab = searchParams.get("tab") || "overview";

  const isItemActive = (item) => {
    if (!item.to) return false;
    if (item.to.includes("tab=")) {
      const itemTab = item.to.split("tab=")[1];
      return routerLocation.pathname === "/admin" && currentTab === itemTab;
    }
    return routerLocation.pathname === "/admin" && !routerLocation.search;
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#061e31] text-slate-100 flex flex-col justify-between border-r border-[#0d3b60] transition-all duration-300 shadow-xl ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label="Admin Control Console Navigation"
      >
        <div className="flex flex-col">
          {/* Tricolor Bar */}
          <div className="h-1 w-full flex">
            <div className="w-1/3 bg-[#FF9933]"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-[#138808]"></div>
          </div>

          {/* Admin Header */}
          <div className="p-4 border-b border-[#0e3b62] flex items-center justify-between">
            <Link
              to="/admin"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase block">
                    Tamil Nadu Government
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                    State Administration
                  </h2>
                  <span className="text-[10px] text-slate-300 truncate block mt-0.5">
                    38-District Central Control
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

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all text-left"
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
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
        <div className="p-3 border-t border-[#0e3b62] bg-black/20">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div className="truncate flex-1 pl-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.fullName || "System Administrator"}
                </div>
                <div className="text-[10px] text-amber-300 uppercase font-semibold">
                  State Central Admin
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

export default AdminSidebar;
