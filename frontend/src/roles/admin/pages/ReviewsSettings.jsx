import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import NewAdminSidebar from "../../../components/layout/NewAdminSidebar";
import NewAdminTopNav from "../../../components/layout/NewAdminTopNav";
import { adminApi } from "../../../api/adminApi";

export default function ReviewsSettings() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReviews();
      const data = res.data?.data || res.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch manager reviews:", err);
      toast.error("Failed to load reviews from the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async (id, currentVal) => {
    try {
      const newVal = !currentVal;
      await adminApi.toggleReviewPublic(id, newVal);
      setReviews(prev => prev.map(r => r._id === id ? { ...r, showPublic: newVal } : r));
      toast.success(newVal ? "Review is now visible on the public page!" : "Review is now hidden from the public page.");
    } catch (err) {
      console.error("Failed to toggle review visibility:", err);
      toast.error("Failed to update review visibility status");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4.5 h-4.5 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Manager Feedback" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          {/* Header Area with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/reviews" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Reviews
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
              </Link>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative min-h-[300px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Milestone Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and manage feedback submitted by managers upon reaching trip milestones.
                </p>
              </div>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </span>
            </div>

            {reviews.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Reviews Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Manager reviews and milestone feedback will show up here as they complete trip milestones (10, 50, and 100 trips).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all flex flex-col gap-4 relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{review.managerName}</h4>
                        <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded mt-1.5">
                          Milestone: {review.tripMilestone} Trips
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {renderStars(review.rating)}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-100/80 text-xs text-slate-600 italic leading-relaxed">
                      "{review.reviewText}"
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500">Show on Public Landing Page</span>
                      <button
                        onClick={() => handleTogglePublic(review._id, review.showPublic)}
                        className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          review.showPublic ? "bg-[#b45309]" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            review.showPublic ? "translate-x-4.5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
