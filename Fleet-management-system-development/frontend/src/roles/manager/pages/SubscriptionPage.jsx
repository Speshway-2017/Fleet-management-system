import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import axiosClient from "@/api/axiosClient";
import { getDaysRemaining } from "@/utils/dateUtils";

export default function SubscriptionPage() {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingPlanId, setRequestingPlanId] = useState(null);

  // Sync state
  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansRes, requestRes] = await Promise.all([
        axiosClient.get("/subscriptions/plans"),
        axiosClient.get("/subscriptions/requests/my")
      ]);
      if (plansRes.data?.data && Array.isArray(plansRes.data.data)) {
        setPlans(plansRes.data.data);
      }
      setPendingRequest(requestRes.data?.data || null);
    } catch (err) {
      console.error("Failed to load subscription page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // Handle plan auto-select from public Pricing page redirect
  useEffect(() => {
    const selectedPlanId = location.state?.selectedPlanId || localStorage.getItem("selectedPlanId");
    if (selectedPlanId && plans.length > 0) {
      const match = plans.find(p => p._id === selectedPlanId);
      if (match) {
        localStorage.removeItem("selectedPlanId");
        if (location.state?.selectedPlanId) {
          window.history.replaceState({}, document.title);
        }
        handleRequestSubscription(selectedPlanId);
      }
    }
  }, [plans, location.state]);

  const handleRequestSubscription = async (planId) => {
    if (pendingRequest) {
      toast.error("You already have a pending subscription request.");
      return;
    }

    try {
      setRequestingPlanId(planId);
      const { data: body } = await axiosClient.post("/subscriptions/requests", { planId });
      toast.success(body.message || "Subscription request submitted successfully.");
      
      // Refresh profile so warning banners, context, etc. update
      await refreshProfile();
      await loadSubscriptionData();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to submit subscription request.";
      toast.error(errMsg);
    } finally {
      setRequestingPlanId(null);
    }
  };



  return (
    <div className="w-full px-6 md:px-8 py-8 overflow-x-hidden">
      <Breadcrumb />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-2">
        <div className="max-w-xl">
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] dark:text-white leading-none">Subscription</h1>
          <p className="text-[16px] text-[#64748B] dark:text-white mt-3 leading-relaxed">Manage your plan, request upgrades, and view expiry details.</p>
        </div>

        {/* Current Subscription Card (Top Right) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-sm px-4 py-3 w-full md:w-auto min-w-[300px] shrink-0 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFF3E8] dark:bg-[#A14000]/20 text-[#A14000] dark:text-amber-400 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 dark:text-white font-extrabold uppercase tracking-wider">Current Plan</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-poppins font-bold text-[#1B2430] dark:text-white text-sm truncate">
                {user?.subscriptionPlan && typeof user.subscriptionPlan === 'object' 
                  ? user.subscriptionPlan.name 
                  : plans.find(p => p._id === user?.subscriptionPlan)?.name || "None"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                user?.subscriptionStatus === "ACTIVE" 
                  ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-emerald-300 border border-green-200 dark:border-green-800/50" 
                  : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-rose-300 border border-red-200 dark:border-red-800/50"
              }`}>
                {user?.subscriptionStatus || "INACTIVE"}
              </span>
            </div>
            {user?.subscriptionStatus === "ACTIVE" && user?.subscriptionExpiry && (
              <div className="text-[11px] text-gray-500 dark:text-white font-medium mt-1">
                Expires: <span className="font-bold text-gray-700 dark:text-white">{new Date(user.subscriptionExpiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span> ({getDaysRemaining(user?.subscriptionExpiry, user?.subscriptionStatus)} days left)
              </div>
            )}
            {pendingRequest && (
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-100/50 dark:border-blue-800/50 w-max">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Pending Request: <strong className="font-bold">{pendingRequest.plan?.name}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="w-full space-y-6 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="font-poppins font-bold text-[#1E293B] dark:text-white text-[20px] flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF3E8] dark:bg-[#A14000]/20 text-[#A14000] dark:text-amber-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            Choose a Subscription Plan
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const userPlanId = user?.subscriptionPlan && typeof user.subscriptionPlan === 'object'
                ? user.subscriptionPlan._id
                : user?.subscriptionPlan;
              const isCurrent = userPlanId === plan._id;
              const isRequested = pendingRequest?.plan?._id === plan._id;
              const hasActivePlan = user?.subscriptionStatus === "ACTIVE";
              const isDisableChoose = hasActivePlan && !isCurrent;
              
              return (
                <div 
                  key={plan._id}
                  className={`p-6 rounded-2xl border bg-white dark:bg-[#0F172A] shadow-sm relative flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    isCurrent 
                      ? "border-green-500 ring-2 ring-green-500/20" 
                      : isRequested
                        ? "border-blue-400 ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-[#1E293B] hover:border-gray-300 dark:hover:border-slate-700"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-green-500 text-white text-[8px] font-bold uppercase tracking-wider z-10">
                      Active Plan
                    </span>
                  )}
                  {isRequested && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-blue-500 text-white text-[8px] font-bold uppercase tracking-wider z-10">
                      Pending
                    </span>
                  )}

                  <div className="flex-1 flex flex-col min-w-0 space-y-4">
                    <div className="pb-3 border-b border-gray-100 dark:border-[#1E293B]/60">
                      <h4 className="font-poppins font-bold text-gray-900 dark:text-white text-base break-words break-all sm:break-words leading-tight line-clamp-2 min-h-[44px] flex items-center" title={plan.name}>
                        {plan.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-white mt-1 font-medium leading-relaxed break-words line-clamp-3 min-h-[44px]" title={plan.description}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="py-1 space-y-2 min-h-[70px] flex flex-col justify-center">
                      <div className="flex flex-wrap items-baseline gap-1 min-w-0">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white break-all">
                          ₹{typeof plan.price === "number" ? plan.price.toLocaleString("en-IN") : plan.price}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-white font-bold shrink-0">/ month</span>
                      </div>
                      <div className="text-xs text-[#A14000] dark:text-white font-extrabold bg-[#FFDBCC]/50 dark:bg-[#A14000]/40 border border-[#A14000]/30 px-3 py-1 rounded-lg inline-block max-w-full truncate">
                        Duration: {plan.duration} Days
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <div className="min-w-0 space-y-0.5">
                        <span className="block text-xs font-black text-slate-800 dark:text-white truncate" title={String(plan.maxVehicles || 0)}>
                          {plan.maxVehicles >= 9999 ? "Unlimited" : (plan.maxVehicles ?? 0)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Vehicles</span>
                      </div>
                      <div className="min-w-0 space-y-0.5 border-x border-slate-200 dark:border-slate-800 px-1">
                        <span className="block text-xs font-black text-slate-800 dark:text-white truncate" title={String(plan.maxDrivers || 0)}>
                          {plan.maxDrivers >= 9999 ? "Unlimited" : (plan.maxDrivers ?? 0)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Drivers</span>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="block text-xs font-black text-slate-800 dark:text-white truncate" title={String(plan.maxTrips || 0)}>
                          {plan.maxTrips >= 9999 ? "Unlimited" : (plan.maxTrips ?? 0)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Trips</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 pt-3.5 border-t border-gray-100 dark:border-[#1E293B] flex-1 min-w-0">
                      {(Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? plan.features.split("\n").map(f => f.trim()).filter(Boolean) : []).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white font-medium min-w-0">
                          <svg className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="break-words break-all sm:break-words min-w-0 flex-1 leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6">
                    <button
                      onClick={() => handleRequestSubscription(plan._id)}
                      disabled={!!pendingRequest || isCurrent || requestingPlanId === plan._id || isDisableChoose}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer text-center ${
                        isCurrent
                          ? "bg-green-600 text-white opacity-90 cursor-default"
                          : isRequested
                            ? "bg-blue-600 text-white opacity-90 cursor-default"
                            : (pendingRequest || isDisableChoose)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#A14000] text-white hover:bg-[#853400] shadow-sm shadow-[#A14000]/20"
                      }`}
                    >
                      {requestingPlanId === plan._id 
                        ? "Submitting..." 
                        : isCurrent 
                          ? "Currently Active" 
                          : isRequested 
                            ? "Request Submitted" 
                            : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
