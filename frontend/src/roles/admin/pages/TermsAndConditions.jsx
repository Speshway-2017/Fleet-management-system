import React from "react";
import { NavLink } from "react-router-dom";
import { FileText, ShieldAlert, Truck, Navigation, AlertTriangle, Scale, CheckCircle2, ShieldCheck } from "lucide-react";
import { AnimeScrollReveal } from "@/components/common/AnimeScrollReveal";
import { useSettings } from "@/context/SettingsContext";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";

export default function TermsAndConditions() {
  const { platformSettings } = useSettings();
  const supportEmail = platformSettings?.contactEmail || "support@fleet.com";

  const sections = [
    {
      num: "01",
      title: "Acceptance of Terms",
      icon: CheckCircle2,
      iconBg: "bg-orange-50 text-[#A14000] border-orange-200/70",
      paragraphs: [
        "Welcome to the Fleet Management Platform. By accessing our public website, signing into the web portal, or using the Fleet Driver Mobile application, you agree to comply with and be bound by these Terms & Conditions.",
        "If you are accessing the platform on behalf of a logistics organization or fleet enterprise, you represent that you have the authority to bind that organization to these terms."
      ]
    },
    {
      num: "02",
      title: "Authorized Use & Account Roles",
      icon: ShieldAlert,
      iconBg: "bg-blue-50 text-blue-600 border-blue-200/70",
      paragraphs: [
        "Access to operational dashboards and mobile workflows is strictly restricted to authorized administrators, fleet managers, dispatchers, and verified drivers provisioned by an organization.",
        "Account sharing, credential tampering, bypassing role-based permissions, or attempting to access records belonging to another fleet organization is strictly prohibited and may result in immediate account suspension."
      ]
    },
    {
      num: "03",
      title: "Real-Time Tracking & Telematics Consent",
      icon: Navigation,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/70",
      paragraphs: [
        "Our platform processes real-time vehicle GPS coordinates, route progress, speed, ignition state, fuel transactions, odometer readings, and driver duty status to support dispatch coordination and safety monitoring.",
        "By signing into the Driver Mobile app or web portal and toggling active duty status, you acknowledge and consent to operational location logging during active shifts and assigned trips."
      ]
    },
    {
      num: "04",
      title: "Trip Execution, Documents & Safety",
      icon: Truck,
      iconBg: "bg-violet-50 text-violet-600 border-violet-200/70",
      paragraphs: [
        "Drivers and fleet managers are responsible for verifying the accuracy of uploaded compliance documents (RC, Insurance, PUC, Fitness, Permits, Road Tax), Proof of Delivery (POD) slips, weighbridge receipts, and fuel bills.",
        "Drivers must always prioritize road safety and comply with local traffic regulations. Never interact with mobile device controls while actively operating a moving vehicle."
      ]
    },
    {
      num: "05",
      title: "Service Availability & Limitation of Liability",
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/70",
      paragraphs: [
        "We strive to maintain high availability and reliable dispatch telemetry; however, network conditions, third-party map/routing providers, or scheduled maintenance may occasionally impact connectivity.",
        "To the maximum extent permitted by law, Fleet Management shall not be liable for indirect or consequential operational delays, route navigation variances, or third-party carrier disruptions."
      ]
    },
    {
      num: "06",
      title: "Modifications & Governing Law",
      icon: Scale,
      iconBg: "bg-teal-50 text-teal-600 border-teal-200/70",
      paragraphs: [
        "We may update these Terms & Conditions periodically to reflect platform improvements, security updates, or statutory requirements. Continued use of the platform following updates constitutes acceptance of the revised terms.",
        `Questions regarding these Terms & Conditions or enterprise compliance agreements can be directed to ${supportEmail}.`
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
            <FileText className="w-3.5 h-3.5" />
            Platform Legal Agreement
          </div>

          <ScrollHighlight
            text="Terms & Conditions"
            font={{ fontSize: "2.25rem", fontWeight: 900, fontFamily: "inherit" }}
            dimColor="rgba(11, 27, 61, 0.3)"
            highlightColor="#0B1B3D"
            containerStyle={{ textAlign: "center" }}
          />

          <p className="text-base sm:text-lg text-body max-w-2xl mx-auto leading-relaxed">
            Please review these Terms & Conditions carefully before using our Fleet Management web platform, dispatch services, or Driver Mobile application.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NavLink
              to="/privacy-policy"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1B3D]/5 hover:bg-[#0B1B3D]/10 rounded-full text-xs font-bold text-[#0B1B3D] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#A14000]" />
              View Privacy Policy
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
                    Clause {section.num}
                  </span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#0B1B3D]">
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                {section.paragraphs.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

