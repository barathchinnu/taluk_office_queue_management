import React from "react";
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
} from "lucide-react";

const ProfileModal = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { officeName, breadcrumb } = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Tricolor Accent */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-amber-500"></div>
          <div className="w-1/3 bg-slate-100"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gov-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {user?.fullName || "Citizen User"}
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role === "citizen"
                  ? "Registered Citizen"
                  : user?.role === "officer"
                  ? "Government Officer"
                  : "System Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Account Information</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email || "No email"}</span>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-700">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="capitalize">Role: {user?.role || "Citizen"}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Active Jurisdiction
            </span>
            <div className="flex items-start gap-2 text-slate-700 text-xs">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{breadcrumb}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
