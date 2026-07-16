import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";
import axiosClient from "@/api/axiosClient";

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data: body } = await axiosClient.get("/subscriptions/public/plans");
        setPlans(body.data || []);
      } catch (err) {
        console.error("Failed to fetch public pricing plans:", err);
        toast.error("Failed to load subscription plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleChoosePlan = (plan) => {
    if (!isAuthenticated) {
      toast.error("Please login as a Fleet Manager to choose a plan.");
      localStorage.setItem("selectedPlanId", plan._id);
      navigate("/login");
      return;
    }

    if (role === "manager" || role === "FLEET_MANAGER") {
      navigate("/manager/subscription", { state: { selectedPlanId: plan._id } });
    } else {
      toast.error("Pricing plans are only available for Fleet Managers.");
    }
  };

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
      <LandingHeader />

      {/* Hero Header */}
      <section className="py-20 px-4 sm:px-6 md:px-8 text-center bg-gradient-to-br from-slate-50 to-white border-b border-border-custom">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
            Subscription Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-display text-heading tracking-tight leading-tight">
            Flexible Plans for Fleets of Any Size
          </h1>
          <p className="text-sm md:text-base text-body font-medium leading-relaxed max-w-2xl mx-auto">
            Choose the perfect plan to streamline operations, track assets, and improve logistics efficiency.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-body font-semibold">No active subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.name === "Professional";
                return (
                  <div
                    key={plan._id}
                    className={`bg-white rounded-3xl p-8 border transition-all duration-300 relative flex flex-col justify-between hover:shadow-xl ${
                      isPopular
                        ? "border-[#a14000] shadow-xl shadow-secondary/5 scale-105 z-10"
                        : "border-border-custom hover:border-slate-300"
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#a14000] text-white text-[9px] font-bold uppercase tracking-widest">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-black font-display text-heading">{plan.name}</h3>
                        <p className="text-xs text-body font-medium min-h-[40px] leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black font-display text-heading">₹{plan.price}</span>
                        <span className="text-xs text-body font-bold">/ month</span>
                      </div>

                      <div className="text-[10px] text-[#A14000] font-bold bg-[#FFDBCC]/40 px-3 py-1.5 rounded-lg inline-block">
                        Duration: {plan.duration} Days
                      </div>

                      {/* Limits Statistics Panel */}
                      <div className="grid grid-cols-3 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                        <div className="text-center space-y-1">
                          <span className="block text-[11px] font-black text-slate-800">
                            {plan.maxVehicles >= 9999 ? "Unlimited" : plan.maxVehicles}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Vehicles</span>
                        </div>
                        <div className="text-center space-y-1 border-x border-slate-200">
                          <span className="block text-[11px] font-black text-slate-800">
                            {plan.maxDrivers >= 9999 ? "Unlimited" : plan.maxDrivers}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Drivers</span>
                        </div>
                        <div className="text-center space-y-1">
                          <span className="block text-[11px] font-black text-slate-800">
                            {plan.maxTrips >= 9999 ? "Unlimited" : plan.maxTrips}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Trips</span>
                        </div>
                      </div>

                      <div className="border-t border-border-custom pt-6 space-y-4">
                        <p className="text-xs font-bold text-heading uppercase tracking-wider">Features Included:</p>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-xs text-body font-medium">
                              <svg
                                className="h-4.5 w-4.5 text-green-500 shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button
                        onClick={() => handleChoosePlan(plan)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] cursor-pointer text-center ${
                          isPopular
                            ? "bg-[#a14000] text-white hover:bg-[#853500] shadow-md shadow-secondary/20"
                            : "bg-[#0B1B3D] text-white hover:bg-[#152e5c] shadow-sm"
                        }`}
                      >
                        Choose Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
