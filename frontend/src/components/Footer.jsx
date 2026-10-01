import React from "react";
import { Building2, Phone, Mail, Clock, Shield } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

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
                {t("footer", "officeName")}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("footer", "officeDesc")}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>{t("footer", "verifiedPortal")}</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("footer", "citizenServicesTitle")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>{t("footer", "service1")}</li>
              <li>{t("footer", "service2")}</li>
              <li>{t("footer", "service3")}</li>
              <li>{t("footer", "service4")}</li>
              <li>{t("footer", "service5")}</li>
            </ul>
          </div>

          {/* Col 3: Office Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("footer", "workingHoursTitle")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("footer", "workingHoursDays")}</span>
              </li>
              <li>{t("footer", "counterCloses")}</li>
              <li>{t("footer", "holiday")}</li>
              <li>{t("footer", "lunch")}</li>
            </ul>
          </div>

          {/* Col 4: Citizen Helpline */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("footer", "helplineTitle")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("footer", "tollFree")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t("footer", "emailHelpline")}</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                {t("footer", "address")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {t("footer", "allRightsReserved")}</p>
          <div className="flex gap-4">
            <span>{t("footer", "privacyPolicy")}</span>
            <span>{t("footer", "termsOfService")}</span>
            <span>{t("footer", "accessibility")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
