import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorMessage = ({
  message = "An error occurred while communicating with government servers.",
  onRetry,
}) => {
  return (
    <div className="bg-rose-50/80 border border-rose-200 text-rose-800 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-rose-900">Unable to load information</div>
          <div className="text-rose-700 text-xs mt-0.5">{message}</div>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors shrink-0 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
