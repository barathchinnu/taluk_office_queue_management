import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, ArrowRight } from "lucide-react";

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = "No records found",
  description = "There are currently no items available in this category.",
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-7 h-7 text-[#0b3b60]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
        {description}
      </p>

      {actionText && (
        <div className="mt-6 flex justify-center">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b3b60] hover:bg-[#082a45] text-white text-xs font-bold tracking-wide transition-all shadow-xs"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b3b60] hover:bg-[#082a45] text-white text-xs font-bold tracking-wide transition-all shadow-xs"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
