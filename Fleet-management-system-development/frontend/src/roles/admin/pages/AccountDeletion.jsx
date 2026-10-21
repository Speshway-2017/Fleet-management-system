import React from "react";
import { NavLink } from "react-router-dom";
import { AnimeScrollReveal } from "@/components/common/AnimeScrollReveal";
import { useSettings } from "@/context/SettingsContext";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";

export default function AccountDeletion() {
  const { platformSettings } = useSettings();

  const steps = [
    {
      step: "01",
      title: "Complete Open Trips",
      desc: "Ensure all active, in-progress, or assigned delivery manifests are completed, and submit any pending fuel bills or Proof of Delivery (POD) slips.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeColor: "bg-orange-50 text-orange-700 border border-orange-200/60",
      iconBg: "bg-orange-500 text-white",
    },
    {
      step: "02",
      title: "Open App Settings",
      desc: "Launch Fleet Driver Mobile, tap the Settings tab in the bottom navigation bar, and scroll down to the Legal & Support section.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badgeColor: "bg-blue-50 text-blue-700 border border-blue-200/60",
      iconBg: "bg-blue-600 text-white",
    },
    {
      step: "03",
      title: "Request Deletion",
      desc: "Tap Help Center or Contact Dispatcher to request account deletion, or email our 24/7 compliance desk with your registered Driver ID & Phone.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      badgeColor: "bg-amber-50 text-amber-700 border border-amber-200/60",
      iconBg: "bg-amber-500 text-white",
    },
    {
      step: "04",
      title: "Immediate Deactivation",
      desc: "Your login access, JWT tokens, and background GPS location telemetry cease immediately. All personal profile records are permanently purged.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      iconBg: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="bg-bg-page flex-1 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 border-b border-border-custom relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A14000]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <AnimeScrollReveal direction="top" className="max-w-[1550px] mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Driver Privacy & Data Removal
          </div>

          <ScrollHighlight
            text="Driver Account Deletion Guide"
            font={{ fontSize: "2.25rem", fontWeight: 900, fontFamily: "inherit" }}
            dimColor="rgba(11, 27, 61, 0.3)"
            highlightColor="#0B1B3D"
            containerStyle={{ textAlign: "center" }}
          />

          <p className="text-base sm:text-lg text-body max-w-2xl mx-auto leading-relaxed">
            We are committed to driver data privacy and transparency. Follow the 4-step procedure below to delete your driver account and permanently erase your personal telemetry and profile records.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
            <span>🚛</span> Applies to Fleet Driver Mobile (Android / iOS) and Driver Web Portal
          </div>
        </AnimeScrollReveal>
      </section>

      {/* Main Step Cards Section */}
      <section className="py-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full space-y-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-custom shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-xl text-[#0B1B3D]">Step-by-Step Account Deletion Process</h3>
              <p className="text-xs text-slate-500 mt-0.5">Please review each step before initiating your deletion request</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold self-start sm:self-auto">
              <span>🔒</span> Privacy Protected
            </div>
          </div>

          {/* 4 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => (
              <div
                key={item.step}
                className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Badge & Icon Top Row */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${item.badgeColor}`}>
                      Step {item.step}
                    </span>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-xs ${item.iconBg}`}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-display font-bold text-base text-[#0B1B3D] leading-snug">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                  <span>Phase {item.step} of 04</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DATA DISCLOSURES & RETENTION DETAILS */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-custom space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-lg text-[#0B1B3D]">Data Removal & Legal Disclosures</h3>
            <p className="text-xs text-slate-500">Overview of what information is permanently removed versus statutory records</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Permanently Deleted Driver Data
              </div>
              <ul className="text-xs text-emerald-950 space-y-2 list-disc list-inside leading-relaxed">
                <li>Driver identity details (name, avatar, employee ID, phone, personal email).</li>
                <li>Biometric credentials, active JWT tokens, and mobile app login sessions.</li>
                <li>Continuous background GPS tracking hooks and live telemetry logs.</li>
                <li>Saved notification preferences and device push notification tokens.</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Statutory Records Retained by Law
              </div>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>Completed delivery trip manifests and Proof of Delivery (POD) slips (required by transport regulations).</li>
                <li>Tax/GST invoices and weighbridge slips retained for mandatory statutory audit periods.</li>
                <li>Physical vehicle maintenance tickets associated with the fleet asset.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SUPPORT / DISPATCH DESK BANNER */}
        <div className="bg-[#0B1B3D] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-lg text-white">Need Assistance with Account Deletion?</h4>
            <p className="text-xs text-slate-300">
              Contact our 24/7 Driver Support & Compliance desk directly via email or reach out to your assigned Fleet Dispatcher.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink
              to="/contact"
              className="px-6 py-3 bg-[#A14000] hover:bg-[#8A3700] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Contact Support Desk</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
