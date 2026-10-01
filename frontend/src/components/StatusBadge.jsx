import React from "react";
import { useLanguage } from "../context/LanguageContext";

const StatusBadge = ({ status }) => {
  const { language } = useLanguage();
  const normalized = (status || "").toLowerCase();

  const configs = {
    waiting: {
      label: {
        en: "Waiting in Queue",
        ta: "வரிசையில் காத்திருப்பில்",
        both: "Waiting • காத்திருப்பில்",
      },
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    called: {
      label: {
        en: "Token Called",
        ta: "அழைக்கப்பட்டது",
        both: "Called • அழைக்கப்பட்டது",
      },
      bg: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
      dot: "bg-blue-500",
    },
    serving: {
      label: {
        en: "Currently Serving",
        ta: "சேவையில் உள்ளது",
        both: "Serving • சேவையில்",
      },
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    },
    completed: {
      label: {
        en: "Completed",
        ta: "முடிந்தது",
        both: "Completed • முடிந்தது",
      },
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    skipped: {
      label: {
        en: "Skipped / No-show",
        ta: "தவிர்க்கப்பட்டது",
        both: "Skipped • தவிர்க்கப்பட்டது",
      },
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    cancelled: {
      label: {
        en: "Cancelled",
        ta: "ரத்து செய்யப்பட்டது",
        both: "Cancelled • ரத்து",
      },
      bg: "bg-slate-100 text-slate-700 border-slate-300",
      dot: "bg-slate-400",
    },
    booked: {
      label: {
        en: "Booked",
        ta: "முன்பதிவு செய்யப்பட்டது",
        both: "Booked • முன்பதிவு",
      },
      bg: "bg-sky-50 text-sky-700 border-sky-200",
      dot: "bg-sky-500",
    },
    confirmed: {
      label: {
        en: "Confirmed",
        ta: "உறுதிப்படுத்தப்பட்டது",
        both: "Confirmed • உறுதி",
      },
      bg: "bg-teal-50 text-teal-700 border-teal-200",
      dot: "bg-teal-500",
    },
    checked_in: {
      label: {
        en: "Checked-in",
        ta: "அலுவலகம் வந்தார்",
        both: "Checked-in • வருகை",
      },
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-500",
    },
    available: {
      label: {
        en: "Available",
        ta: "தயார்",
        both: "Ready • தயார்",
      },
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    busy: {
      label: {
        en: "Serving Token",
        ta: "சேவையில் உள்ளது",
        both: "Serving • சேவையில்",
      },
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    closed: {
      label: {
        en: "Counter Closed",
        ta: "கவுண்டர் மூடப்பட்டது",
        both: "Closed • மூடப்பட்டது",
      },
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const config = configs[normalized] || {
    label: { en: status, ta: status, both: status },
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  const labelText = typeof config.label === "object"
    ? config.label[language] || config.label.both || config.label.en
    : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {labelText}
    </span>
  );
};

export default StatusBadge;
