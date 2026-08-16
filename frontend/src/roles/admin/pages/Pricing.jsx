import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import { useAuth } from "@/context/AuthContext";
import TruckLoader from "@/components/common/TruckLoader";
import axiosClient from "@/api/axiosClient";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";

const DEFAULT_PLANS = [
  {
    _id: "starter",
    name: "Starter",
    description: "Ideal for small fleets and growing logistics businesses.",
    price: 999,
    duration: 30,
    maxVehicles: 5,
    maxDrivers: 5,
    maxTrips: 100,
    features: ["Real-time GPS Tracking", "Basic Analytics & Reports", "Email & Chat Support", "Maintenance Alerts"]
  },
  {
    _id: "professional",
    name: "Professional",
    description: "Comprehensive solution for medium to large fleet operations.",
    price: 2499,
    duration: 30,
    maxVehicles: 25,
    maxDrivers: 25,
    maxTrips: 500,
    features: ["Everything in Starter", "Advanced Telematics & Geofencing", "Fuel & Expense Tracking", "Priority 24/7 Support", "Automated Compliance Reports"]
  },
  {
    _id: "enterprise",
    name: "Enterprise",
    description: "Tailored for heavy enterprise operations with unlimited scale.",
    price: 4999,
    duration: 30,
    maxVehicles: 9999,
    maxDrivers: 9999,
    maxTrips: 9999,
    features: ["Unlimited Vehicles & Drivers", "Custom API & ERP Integrations", "Dedicated Account Manager", "Custom Analytics Dashboards", "24/7 Premium SLA Support"]
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: body } = await axiosClient.get("/subscriptions/public/plans");
        if (body.data && body.data.length > 0) {
          setPlans(body.data);
        }
      } catch (err) {
        console.error("Failed to fetch public pricing plans:", err);
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
    <div className="bg-bg-page flex-1 flex flex-col font-sans">
      {/* Hero Header */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-8 text-center bg-gradient-to-br from-slate-50 to-white border-b border-border-custom">
        <AnimeScrollReveal direction="top" className="max-w-3xl mx-auto space-y-4">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
            Subscription Pricing
          </span>
          <ScrollHighlight
            text="Flexible Plans for Fleets of Any Size"
            font={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "inherit" }}
            dimColor="rgba(11, 27, 61, 0.3)"
            highlightColor="#0B1B3D"
            containerStyle={{ textAlign: "center" }}
          />
          <p className="text-sm md:text-base text-body font-medium leading-relaxed max-w-2xl mx-auto">
            Choose the perfect plan to streamline operations, track assets, and improve logistics efficiency.
          </p>
        </AnimeScrollReveal>
      </section>

      {/* Plans Section */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-8 flex-1">
        <div className="max-w-6xl mx-auto">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-[#A14000] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-body">Loading Subscription Plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-body font-semibold">No active subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.name === "Professional";
                return (
                  <div
                    key={plan._id}
                    className={`bg-white rounded-2xl p-6 sm:p-7 border transition-all duration-400 relative flex flex-col justify-between anime-card-lift ${isPopular
                        ? "border-[#a14000]/60 shadow-lg shadow-[#a14000]/5 scale-[1.02] z-10"
                        : "border-border-custom hover:border-slate-300"
                      }`}
                  >
                    {isPopular && (
                      <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3.5 py-1 rounded-full bg-[#a14000] text-white text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-black font-display text-heading">{plan.name}</h3>
                        <p className="text-xs text-body font-normal min-h-[36px] leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black font-display text-heading">₹{plan.price}</span>
                        <span className="text-xs text-body font-bold">/ month</span>
                      </div>

                      <div className="text-[10px] text-[#A14000] font-bold bg-[#FFDBCC]/40 px-2.5 py-1 rounded-md inline-block">
                        Duration: {plan.duration} Days
                      </div>

                      {/* Limits Statistics Panel */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-center space-y-0.5">
                          <span className="block text-xs font-black text-slate-800">
                            {plan.maxVehicles >= 9999 ? "Unlimited" : plan.maxVehicles}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Vehicles</span>
                        </div>
                        <div className="text-center space-y-0.5 border-x border-slate-200">
                          <span className="block text-xs font-black text-slate-800">
                            {plan.maxDrivers >= 9999 ? "Unlimited" : plan.maxDrivers}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Drivers</span>
                        </div>
                        <div className="text-center space-y-0.5">
                          <span className="block text-xs font-black text-slate-800">
                            {plan.maxTrips >= 9999 ? "Unlimited" : plan.maxTrips}
                          </span>
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Trips</span>
                        </div>
                      </div>

                      <div className="border-t border-border-custom pt-4 space-y-3">
                        <p className="text-xs font-bold text-heading uppercase tracking-wider">Features Included:</p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-body font-medium">
                              <svg
                                className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"
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

                    <div className="pt-6">
                      <button
                        onClick={() => handleChoosePlan(plan)}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] cursor-pointer text-center ${isPopular
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
    </div>
  );
}

