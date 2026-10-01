import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = ({ variant = "pills", className = "" }) => {
  const { language, setLanguage, cycleLanguage } = useLanguage();

  const options = [
    { id: "both", label: "🌐 Eng + தமிழ்", shortLabel: "Eng + தமிழ்" },
    { id: "ta", label: "🇮🇳 தமிழ்", shortLabel: "தமிழ்" },
    { id: "en", label: "🇬🇧 English", shortLabel: "English" },
  ];

  if (variant === "compact") {
    const current = options.find((o) => o.id === language) || options[0];
    return (
      <button
        onClick={cycleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${className}`}
        title="Switch Language: Both / தமிழ் / English"
      >
        <Globe className="w-3.5 h-3.5 text-amber-500" />
        <span>{current.shortLabel}</span>
      </button>
    );
  }

  // Segmented Pill Variant (Default)
  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {options.map((opt) => {
        const isActive = language === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLanguage(opt.id)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? "bg-white dark:bg-amber-400 text-gov-800 dark:text-slate-950 shadow-xs ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
