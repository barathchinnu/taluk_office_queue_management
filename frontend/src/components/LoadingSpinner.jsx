import React from "react";

const LoadingSpinner = ({ text = "Loading government services...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
  };

  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-[#0b3b60] border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-600 tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
