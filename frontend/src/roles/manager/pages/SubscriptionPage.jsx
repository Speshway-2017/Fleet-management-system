import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import axiosClient from "@/api/axiosClient";

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
      setPlans(plansRes.data?.data || []);
      setPendingRequest(requestRes.data?.data || null);
    } catch (err) {
      console.error("Failed to load subscription page data:", err);
      toast.error("Failed to load plans and requests.");
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

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (user?.subscriptionStatus !== "ACTIVE" || !user?.subscriptionExpiry) return "--";
    const expiry = new Date(user.subscriptionExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="w-full px-6 md:px-8 py-8 overflow-x-hidden">
      <Breadcrumb />
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Subscription</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Manage your plan, request upgrades, and view expiry details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left Side: Current Subscription Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 flex flex-col justify-between h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFF3E8] text-[#B45A0A] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Current Subscription</h3>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Plan Name</span>
                <span className="text-sm font-extrabold text-[#1B2430]">
                  {user?.subscriptionPlan && typeof user.subscriptionPlan === 'object' 
                    ? user.subscriptionPlan.name 
                    : plans.find(p => p._id === user?.subscriptionPlan)?.name || "None"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  user?.subscriptionStatus === "ACTIVE" 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : user?.subscriptionStatus === "EXPIRED"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}>
                  {user?.subscriptionStatus || "INACTIVE"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Expiry Date</span>
                <span className="text-sm font-bold text-gray-700">
                  {user?.subscriptionExpiry 
                    ? new Date(user.subscriptionExpiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Days Remaining</span>
                <span className={`text-base font-black ${
                  getDaysRemaining() !== "--" && getDaysRemaining() <= 7 ? "text-red-600 animate-pulse" : "text-gray-800"
                }`}>
                  {getDaysRemaining()}
                </span>
              </div>
            </div>
          </div>

          {/* Pending request banner */}
          {pendingRequest && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1">Request Pending Approval</p>
              <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                You requested <strong>{pendingRequest.plan?.name}</strong>. The request is awaiting review.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Available Plans Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-poppins font-bold text-[#1B2430] text-[16px] mb-6 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFF3E8] text-[#B45A0A] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Choose a Subscription Plan
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => {
                  const isCurrent = user?.subscriptionPlan === plan._id;
                  const isRequested = pendingRequest?.plan?._id === plan._id;
                  
                  return (
                    <div 
                      key={plan._id}
                      className={`p-6 rounded-xl border relative flex flex-col justify-between ${
                        isCurrent 
                          ? "border-green-500 bg-green-50/10" 
                          : isRequested
                            ? "border-blue-400 bg-blue-50/10"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-green-500 text-white text-[8px] font-bold uppercase tracking-wider">
                          Active Plan
                        </span>
                      )}
                      {isRequested && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-blue-500 text-white text-[8px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-poppins font-bold text-gray-900 text-sm">{plan.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-1 min-h-[30px] font-medium leading-relaxed">{plan.description}</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-gray-900">₹{plan.price}</span>
                          <span className="text-[10px] text-gray-400 font-bold">/ month</span>
                        </div>
                        <div className="text-[10px] text-[#A14000] font-bold bg-[#FFDBCC]/40 px-2 py-1 rounded inline-block">
                          Duration: {plan.duration} Days
                        </div>
                        <ul className="space-y-2 pt-2 border-t border-gray-100">
                          <li className="flex items-center gap-2 text-[10px] text-gray-700 font-bold">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Max Vehicles: {plan.maxVehicles >= 9999 ? "Unlimited" : plan.maxVehicles}</span>
                          </li>
                          <li className="flex items-center gap-2 text-[10px] text-gray-700 font-bold">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Max Drivers: {plan.maxDrivers >= 9999 ? "Unlimited" : plan.maxDrivers}</span>
                          </li>
                          <li className="flex items-center gap-2 text-[10px] text-gray-700 font-bold">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Max Trips: {plan.maxTrips >= 9999 ? "Unlimited" : plan.maxTrips}</span>
                          </li>
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                              <svg className="h-3.5 w-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleRequestSubscription(plan._id)}
                        disabled={!!pendingRequest || isCurrent || requestingPlanId === plan._id}
                        className={`w-full mt-6 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer text-center ${
                          isCurrent
                            ? "bg-green-600 text-white opacity-90 cursor-default"
                            : isRequested
                              ? "bg-blue-600 text-white opacity-90 cursor-default"
                              : pendingRequest
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-[#B45A0A] text-white hover:bg-[#9A4D08] shadow-sm shadow-[#B45A0A]/20"
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
