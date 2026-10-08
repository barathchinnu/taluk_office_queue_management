import React from "react";
import { Link } from "react-router-dom";
import { Landmark, Shield, Phone, Mail, Clock, HelpCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const GovernmentFooter = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-[#0b2841] text-slate-300 border-t border-slate-700 text-xs mt-auto">
      {/* Upper Navigation Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Portal Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-bold text-sm tracking-tight block">
                  Smart Government Services
                </span>
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                  Government of Tamil Nadu Project
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified digital access for 38 districts & 317 taluk offices across Tamil Nadu. Online certificate applications, token dispensing, appointment scheduling, and live queue tracking.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Standard 256-Bit SSL Secured Platform</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-700">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link to="/services" className="hover:text-amber-400 transition-colors">
                  Revenue Services Catalog
                </Link>
              </li>
              <li>
                <Link to="/citizen/take-token" className="hover:text-amber-400 transition-colors">
                  Generate Walk-in Token
                </Link>
              </li>
              <li>
                <Link to="/citizen/appointments" className="hover:text-amber-400 transition-colors">
                  Book Counter Appointment
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link to="/display" className="hover:text-amber-400 transition-colors">
                  Public Waiting Hall Screen
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Taluk Office Hours & Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-700">
              Operating Schedule
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Working Days: Monday – Friday</span>
              </li>
              <li className="text-[11px] text-slate-400 pl-5">
                Counter Hours: 09:30 AM to 05:30 PM
              </li>
              <li className="text-[11px] text-slate-400 pl-5">
                Token Dispensing: 09:30 AM to 04:30 PM
              </li>
              <li className="text-[11px] text-slate-400 pl-5">
                Lunch Intermission: 01:30 PM to 02:00 PM
              </li>
            </ul>
          </div>

          {/* Col 4: Help Desk & Contact */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-700">
              Citizen Helpline
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Toll-Free Helpline: 1800-425-1333</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Support: eseva.support@tn.gov.in</span>
              </li>
              <li className="text-[11px] text-slate-400 pt-1">
                State Secretariat, Fort St. George, Chennai 600009
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Academic Disclaimer Notice */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/20 max-w-2xl mx-auto">
            Notice: This application is a smart government queue management platform developed for demonstration & academic purposes.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] text-slate-400 pt-2">
            <span>© {new Date().getFullYear()} Smart Government Service Portal. All rights reserved.</span>
            <span>•</span>
            <Link to="/services" className="hover:text-white">Services</Link>
            <span>•</span>
            <Link to="/track" className="hover:text-white">Track Application</Link>
            <span>•</span>
            <Link to="/display" className="hover:text-white">Public Screen</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GovernmentFooter;
