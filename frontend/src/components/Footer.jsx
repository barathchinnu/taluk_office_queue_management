import React from "react";
import { Building2, Phone, Mail, Clock, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Government Identity */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                Taluk Administrative Office
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official smart token and appointment management service for public governance, revenue, and welfare services.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified Government Portal</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li>Revenue & Patta Services</li>
              <li>Community & Income Certificates</li>
              <li>Nativity & Residence Certificates</li>
              <li>Social Welfare & Pensions</li>
              <li>Public Grievance Redressal</li>
            </ul>
          </div>

          {/* Col 3: Office Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Working Hours</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Monday – Friday: 10:00 AM – 5:45 PM</span>
              </li>
              <li>Token Counter Closes: 4:30 PM</li>
              <li>Saturday / Sunday: Official Holiday</li>
              <li>Lunch Recess: 1:30 PM – 2:00 PM</li>
            </ul>
          </div>

          {/* Col 4: Citizen Helpline */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Citizen Helpline</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Toll-Free: 1800-425-1001</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>helpdesk@talukoffice.gov.in</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Taluk Headquarters, Civil Station Road
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Taluk Administrative Office. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
