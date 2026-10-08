import React, { useState } from "react";
import { feedbackService } from "../services/api";
import { Star, MessageSquare, CheckCircle2, X } from "lucide-react";

const FeedbackModal = ({
  isOpen,
  onClose,
  token,
  appointment,
  service,
  department,
  officer,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      const payload = {
        rating,
        comment: comment.trim() || undefined,
        token: token?._id || (typeof token === "string" ? token : undefined),
        appointment:
          appointment?._id ||
          (typeof appointment === "string" ? appointment : undefined),
        service:
          service?._id || (typeof service === "string" ? service : undefined),
        department:
          department?._id ||
          (typeof department === "string" ? department : undefined),
        officer:
          officer?._id || (typeof officer === "string" ? officer : undefined),
      };

      const res = await feedbackService.submit(payload);
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setError(res.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      setError(
        err.response?.data?.message ||
          "Could not submit feedback. Note: Feedback is permitted once per completed service."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Nandri! Thank You for Your Feedback
            </h3>
            <p className="text-sm text-slate-500">
              Your rating helps improve Taluk Office digital citizen services.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Citizen Satisfaction
              </span>
              <h3 className="text-xl font-bold text-slate-900 pt-2">
                Rate Your Service Experience
              </h3>
              <p className="text-xs text-slate-500">
                How satisfied were you with the speed, officer assistance, and queue process?
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {error}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-700">
                {rating === 5
                  ? "⭐ Excellent & Prompt"
                  : rating === 4
                  ? "⭐ Good Service"
                  : rating === 3
                  ? "⭐ Average / Satisfactory"
                  : rating === 2
                  ? "⭐ Needs Improvement"
                  : "⭐ Poor / Long Wait"}
              </span>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Feedback Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on counter service, waiting time, or document clarity..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-slate-600 font-bold text-sm rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gov-700 hover:bg-gov-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
