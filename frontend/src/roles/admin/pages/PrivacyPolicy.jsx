import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldCheck, Lock, Database, Eye, Cookie, UserCheck, Clock, FileText } from "lucide-react";
import { AnimeScrollReveal } from "@/components/common/AnimeScrollReveal";
import { useSettings } from "@/context/SettingsContext";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";

export default function PrivacyPolicy() {
  const { platformSettings } = useSettings();
  const supportEmail = platformSettings?.contactEmail || "support@fleet.com";

  const sections = [
    {
      num: "01",
      title: "Information We Collect",
      icon: Database,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200/70",
      points: [
        "Account & Profile Information: Full name, work email address, phone number, employee ID, role assignment (Administrator, Fleet Manager, or Driver), and encrypted authentication credentials.",
        "Driver & Compliance Records: Driver license numbers, expiration dates, vehicle registration certificates (RC), insurance policies, PUC, fitness certificates, permits, and tax receipts.",
        "Operational & Telemetry Data: Live vehicle GPS coordinates, speed, ignition state, fuel refill entries, odometer readings, Proof of Delivery (POD) uploads, weighbridge slips, and trip manifests.",
        "Device & Audit Logs: IP addresses, browser or mobile device identifiers, push notification tokens (FCM), and security audit trails."
      ]
    },
    {
      num: "02",
      title: "How We Use Your Data",
      icon: Eye,
      iconBg: "bg-orange-50 text-[#A14000] border-orange-200/70",
      points: [
        "Real-Time Fleet Dispatch & Tracking: Enable managers to assign trips, monitor live route progress, calculate ETAs, and verify customer location arrivals.",
        "Safety & Regulatory Compliance: Track expiry timelines for driver licenses and vehicle compliance documents, and maintain statutory delivery manifests and tax/GST invoices.",
        "Expense & Maintenance Workflows: Process fuel receipts, approve weighbridge logs, and coordinate breakdown or preventive maintenance support tickets.",
        "Platform Security & Reliability: Authenticate sessions via JSON Web Tokens (JWT), prevent unauthorized access, and monitor platform uptime and diagnostics."
      ]
    },
    {
      num: "03",
      title: "Data Encryption & Security",
      icon: Lock,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/70",
      points: [
        "All data transmitted between web portals, mobile apps, and backend APIs is encrypted in transit using TLS 1.3 protocols.",
        "Passwords are stored using salted cryptographic hashing, and role-based access control (RBAC) enforces strict tenant and organization isolation.",
        "We never sell, rent, or trade organizational logistics metrics, driver profiles, or telemetry records to third-party advertisers or data brokers."
      ]
    },
    {
      num: "04",
      title: "Cookies, Tokens & Session Storage",
      icon: Cookie,
      iconBg: "bg-violet-50 text-violet-600 border-violet-200/70",
      points: [
        "We use persistent access tokens, secure storage tokens, and essential session cookies strictly to preserve authenticated sessions, protect API endpoints, and store interface preferences (such as language and theme).",
        "We do not deploy third-party advertising trackers across the Fleet Management dashboard or driver portals."
      ]
    },
    {
      num: "05",
      title: "Data Retention & Storage",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/70",
      points: [
        "Active account records and live telemetry are retained for as long as your organization maintains an active fleet subscription.",
        "Statutory transport records (completed POD slips, weighbridge logs, and tax/GST invoices) are retained as required by applicable commercial and tax audit laws."
      ]
    },
    {
      num: "06",
      title: "Your Privacy Rights & Contact",
      icon: UserCheck,
      iconBg: "bg-teal-50 text-teal-600 border-teal-200/70",
      points: [
        "Authorized users can review and update profile information directly within Profile Settings or through their assigned Fleet Manager.",
        `For privacy inquiries, data export requests, or compliance assistance, contact our Data Protection & Compliance Desk at ${supportEmail}.`
      ]
    }
  ];

  return (
    <div className="bg-bg-page flex-1 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 border-b border-border-custom relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A14000]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <AnimeScrollReveal direction="top" className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Protection & Transparency
          </div>

          <ScrollHighlight
            text="Privacy Policy"
            font={{ fontSize: "2.25rem", fontWeight: 900, fontFamily: "inherit" }}
            dimColor="rgba(11, 27, 61, 0.3)"
            highlightColor="#0B1B3D"
            containerStyle={{ textAlign: "center" }}
          />

          <p className="text-base sm:text-lg text-body max-w-2xl mx-auto leading-relaxed">
            We respect your privacy and are committed to safeguarding the personal, operational, and telemetry data processed across the Fleet Management platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NavLink
              to="/terms-and-conditions"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1B3D]/5 hover:bg-[#0B1B3D]/10 rounded-full text-xs font-bold text-[#0B1B3D] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#A14000]" />
              View Terms & Conditions
            </NavLink>
          </div>
        </AnimeScrollReveal>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto w-full space-y-6">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div
              key={section.num}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-border-custom shadow-xs space-y-4"
            >
              <div className="flex items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${section.iconBg}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A14000]">
                    Section {section.num}
                  </span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#0B1B3D]">
                    {section.title}
                  </h2>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
                {section.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#A14000] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}

