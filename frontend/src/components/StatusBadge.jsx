import React from "react";

const StatusBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();

  const configs = {
    waiting: {
      label: "Waiting in Queue",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    called: {
      label: "Token Called",
      bg: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
      dot: "bg-blue-500",
    },
    serving: {
      label: "Currently Serving",
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    skipped: {
      label: "Skipped / No-show",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-slate-100 text-slate-700 border-slate-300",
      dot: "bg-slate-400",
    },
    booked: {
      label: "Booked",
      bg: "bg-sky-50 text-sky-700 border-sky-200",
      dot: "bg-sky-500",
    },
    confirmed: {
      label: "Confirmed",
      bg: "bg-teal-50 text-teal-700 border-teal-200",
      dot: "bg-teal-500",
    },
    checked_in: {
      label: "Checked-in",
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-500",
    },
    available: {
      label: "Available",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    busy: {
      label: "Serving Token",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    closed: {
      label: "Counter Closed",
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const config = configs[normalized] || {
    label: status,
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
