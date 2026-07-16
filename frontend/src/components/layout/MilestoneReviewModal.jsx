import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { managerApi } from "../../roles/manager/api/managerApi";

export default function MilestoneReviewModal({ milestoneData, onClose, onLockStateChange }) {
  const { milestone, isMandatory } = milestoneData;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Notify parent about lock state so it can apply layout blurs
    onLockStateChange(isMandatory);
  }, [isMandatory, onLockStateChange]);

  useEffect(() => {
    if (!isMandatory) return;

    // Prevent closing with Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isMandatory]);

  const cleanReview = reviewText.trim();
  const isValid = rating > 0 && cleanReview.length >= 20 && cleanReview.length <= 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await managerApi.submitReview({
        rating,
        reviewText: cleanReview,
        milestone
      });
      toast.success("Thank you for your valuable feedback!");
      onLockStateChange(false);
      onClose(true); // Close and refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaybeLater = async () => {
    if (isMandatory) return;
    try {
      await managerApi.maybeLater(milestone);
      onClose(false); // Close without refreshing
    } catch (err) {
      console.error(err);
      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Dark Blur Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!isMandatory) {
            handleMaybeLater();
          }
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/80 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col animate-scale-in">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500" />

        {/* Close Button (only if not mandatory) */}
        {!isMandatory && (
          <button 
            onClick={handleMaybeLater}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon icon="material-symbols:close" className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Milestone Badge Icon */}
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm mb-4 animate-bounce-subtle">
            <Icon icon="solar:cup-first-bold" className="w-9 h-9" />
          </div>

          <h3 className="font-poppins font-black text-slate-900 text-xl sm:text-2xl tracking-tight">
            We'd Love Your Feedback!
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-poppins leading-relaxed">
            Congratulations on completing your trip milestone!
            <br />
            Your feedback helps us improve the Fleet Management System and provide a better experience.
          </p>

          <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col items-center">
            {/* Interactive Stars Component */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                >
                  <Icon
                    icon={
                      star <= (hoverRating || rating)
                        ? "solar:star-bold"
                        : "solar:star-linear"
                    }
                    className={`w-9 h-9 transition-colors duration-150 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-500 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]"
                        : "text-slate-300 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Review Area */}
            <div className="w-full relative">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about your journey with us..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-slate-800 placeholder-slate-400"
              />
              
              {/* Length Indicator & Limits */}
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  {cleanReview.length < 20 ? (
                    <span className="text-red-500">Min 20 characters required</span>
                  ) : (
                    <span className="text-green-500">Character requirement met</span>
                  )}
                </span>
                <span className={`text-[10px] font-bold ${reviewText.length >= 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {reviewText.length}/500
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
              {!isMandatory && (
                <button
                  type="button"
                  onClick={handleMaybeLater}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              )}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                  isValid && !isSubmitting
                    ? "bg-[#B45A0A] hover:bg-[#963f00] shadow-amber-900/10 cursor-pointer"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
