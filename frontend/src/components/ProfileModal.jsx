import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocation } from "../context/LocationContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Building2,
  X,
  CheckCircle2,
  Calendar,
  LogOut,
  FileText,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
} from "lucide-react";

const ProfileModal = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { officeName, breadcrumb, openLocationModal } = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigateToProfile = () => {
    onClose();
    navigate("/citizen/profile");
  };

  const handleNavigateToApplications = () => {
    onClose();
    navigate("/citizen/applications");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Tricolor Accent */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-slate-100"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-br from-slate-50 to-slate-100/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gov-700 to-gov-900 text-amber-300 flex items-center justify-center font-black text-lg shadow-sm border border-white">
              {user?.fullName?.charAt(0) || "C"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {user?.fullName || "Citizen User"}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                {user?.role === "citizen"
                  ? "Registered Citizen Account"
                  : user?.role === "officer"
                  ? "Designated Duty Officer"
                  : "State Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* Account Info Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[10px]">Verified Credentials</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> e-KYC Validated
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 text-xs">
              <Mail className="w-4 h-4 text-gov-700 shrink-0" />
              <span className="truncate font-medium">{user?.email || "No email"}</span>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-2.5 text-slate-700 text-xs">
                <Phone className="w-4 h-4 text-gov-700 shrink-0" />
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Active Jurisdiction Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Active Jurisdiction
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openLocationModal();
                }}
                className="text-[11px] font-bold text-gov-700 hover:underline"
              >
                Change
              </button>
            </div>
            <div className="flex items-start gap-2 text-slate-800 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{breadcrumb}</span>
            </div>
          </div>

          {/* Direct Profile & Application Jump Links */}
          {user?.role === "citizen" && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="p-3 bg-gov-50 hover:bg-gov-100 border border-gov-200/80 rounded-2xl text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <User className="w-4 h-4 text-gov-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-gov-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs font-bold text-gov-900 mt-1.5">Full Profile</p>
                <span className="text-[10px] text-slate-500">Edit info & address</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToApplications}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1.5">Applications</p>
                <span className="text-[10px] text-slate-500">Track & get e-slips</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
