import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const timelineItems = [
    { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
    { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
    { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
    { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
    { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." },
  ];

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
      <LandingHeader />

      {/* 2. Our Story Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-white border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-heading tracking-tight leading-tight">
              Built for Fleet Operators, by Logistics Experts
            </h2>
            <div className="space-y-4 text-sm md:text-base text-body font-medium leading-relaxed">
              <p>
                Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.
              </p>
              <p>
                Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface.
              </p>
            </div>
          </div>

          {/* Right Column: 2x2 Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 pt-4">
            {/* Card 1 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">2018</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Founded</span>
            </div>
            {/* Card 2 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">340+</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Enterprises</span>
            </div>
            {/* Card 3 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">1.2M+</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Vehicles Tracked</span>
            </div>
            {/* Card 4 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm flex flex-col justify-center">
              <span className="text-xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">$180M+</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Customer Savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-bg-page border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left Column: Mission Content */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Mission
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-heading tracking-tight leading-tight">
              Eliminating Blind Spots in Fleet Operations
            </h2>
            <div className="space-y-4 text-sm md:text-base text-body font-medium leading-relaxed">
              <p>
                Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.
              </p>
              <p>
                FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork.
              </p>
            </div>
            {/* Quote Block */}
            <div className="border-l-4 border-secondary pl-5 italic text-heading font-semibold text-sm md:text-base my-4 max-w-md">
              "The only way to run a fleet well is to see it clearly."
            </div>
          </div>

          {/* Right Column: Attributes List */}
          <div className="space-y-5">
            {/* Item 1 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Total Transparency</h4>
                <p className="text-xs text-body leading-relaxed">
                  We give fleet operators complete visibility — every vehicle, every driver, every mile.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Reliability First</h4>
                <p className="text-xs text-body leading-relaxed">
                  Our 99.97% uptime SLA keeps your operations moving. Never depend on a flaky platform.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Outcome-Driven</h4>
                <p className="text-xs text-body leading-relaxed">
                  We measure our success by your cost savings, not just platform adoption.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Customer Obsession</h4>
                <p className="text-xs text-body leading-relaxed">
                  Dedicated success managers, 24/7 support, and onboarding that gets you live fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Journey Timeline Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-white border-b border-border-custom text-center">
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
          <div className="space-y-2">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Timeline
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-heading tracking-tight">
              Our Journey
            </h3>
          </div>

          {/* Timeline Nodes */}
          <div className="relative space-y-8 md:space-y-12 before:absolute before:top-0 before:bottom-0 before:left-3 md:before:left-1/2 before:w-[1px] before:bg-border-custom">
            {timelineItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${
                    isEven ? "md:justify-start" : "md:justify-end"
                  } pl-8 md:pl-0`}
                >
                  {/* Timeline Bullet Point */}
                  <div className="absolute left-[5px] md:left-1/2 top-1.5 md:top-1/2 -translate-y-0 md:-translate-y-1/2 -translate-x-0 md:-translate-x-1/2 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-white shadow-sm z-10" />

                  {/* Timeline Content */}
                  <div
                    className={`w-full md:w-[calc(50%-2rem)] text-left ${
                      isEven ? "md:text-right md:pr-8" : "md:text-left md:pl-8"
                    } space-y-1`}
                  >
                    <h4 className="font-display font-extrabold text-sm text-heading tracking-wide">
                      {item.year}
                    </h4>
                    <p className={`text-xs text-body font-medium leading-relaxed max-w-sm md:max-w-none ${
                      isEven ? "md:ml-auto md:mr-0" : "md:mr-auto md:ml-0"
                    }`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
