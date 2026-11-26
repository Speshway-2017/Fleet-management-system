import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import { heroSequence } from "@/utils/animeUtils";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import RoundCarousel from "@/components/originkit/ui/roundcarousel";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";
import WordRevealParagraph from "@/components/common/WordRevealParagraph";
import {
  MapPin,
  Coins,
  Users,
  Activity,
  ShieldCheck,
  Cpu,
  Clock,
  Bell,
  Wrench,
  Navigation
} from "lucide-react";

export default function Features() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    let heroTimeline = null;

    if (heroRef.current) {
      heroTimeline = heroSequence(heroRef.current);
    }

    return () => {
      if (heroTimeline) {
        try { heroTimeline.pause(); } catch (_) {}
      }
      if (heroRef.current) anime.remove(heroRef.current.querySelectorAll("*"));
    };
  }, []);

  return (
    <div className="bg-bg-page flex-1 flex flex-col font-sans text-body">

      {/* 2. Hero Section */}
      <section ref={heroRef} className="relative w-full overflow-hidden border-b border-border-custom bg-gradient-to-b from-white via-slate-50/60 to-white min-h-[480px] md:min-h-[520px] flex items-center py-16 md:py-20">

        {/* Content Container */}
        <div className="relative w-full max-w-[1550px] mx-auto px-4 sm:px-6 md:px-10 space-y-12 z-10 text-center">

          {/* Main Hero Header - Centered in Middle */}
          <div className="space-y-5 max-w-3xl mx-auto flex flex-col items-center text-center">
            {/* Pill badge */}
            <div data-hero-badge className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit mx-auto opacity-0 shadow-xs">
              <span>🚀</span>
              <span>Advanced Operations Suite</span>
            </div>

            <h2 data-hero-heading className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0B1B3D] tracking-tight leading-tight opacity-0 text-center">
              Powerful Features for <br />
              <span className="text-[#A14000]">Modern Fleet Operations</span>
            </h2>
            
            <div className="max-w-2xl mx-auto text-center">
              <WordRevealParagraph
                text="From real-time GPS telemetry to workflow automation and real-time tracking, discover the advanced features designed to maximize operations efficiency."
                fontSize="1.2rem"
                lineHeight="1.8"
                className="text-body font-medium text-center"
              />
            </div>
          </div>

          {/* 4 Feature Columns at the bottom of hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 max-w-6xl mx-auto">

            {/* Live GPS Tracking */}
            <div data-hero-card className="flex gap-3.5 items-start bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#A14000]/40 transition-all text-left anime-card-lift opacity-0">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Live GPS Tracking</h4>
                <p className="text-[11px] text-body leading-relaxed">Real-time coordinates and visual location monitoring.</p>
              </div>
            </div>

            {/* Operational Efficiency */}
            <div data-hero-card className="flex gap-3.5 items-start bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#A14000]/40 transition-all text-left anime-card-lift opacity-0">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Operational Efficiency</h4>
                <p className="text-[11px] text-body leading-relaxed">Resource tracking, performance analytics, and cost planning.</p>
              </div>
            </div>

            {/* Driver Analytics */}
            <div data-hero-card className="flex gap-3.5 items-start bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#A14000]/40 transition-all text-left anime-card-lift opacity-0">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Driver Scoring</h4>
                <p className="text-[11px] text-body leading-relaxed">Safety tracking, speed monitoring, and behavioral scoring.</p>
              </div>
            </div>

            {/* Performance Monitoring */}
            <div data-hero-card className="flex gap-3.5 items-start bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#A14000]/40 transition-all text-left anime-card-lift opacity-0">
              <div className="h-9 w-9 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">AI Diagnostics</h4>
                <p className="text-[11px] text-body leading-relaxed">Predictive maintenance planning and engine health alerts.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Deep-Dive Features Breakdown */}
      <section className="py-20 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto space-y-16">

          <AnimeScrollReveal direction="top" className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Comprehensive Toolkit</h3>
            <ScrollHighlight
              text="Everything You Need to Manage Your Fleet"
              font={{ fontSize: "2rem", fontWeight: 900, fontFamily: "inherit" }}
              dimColor="rgba(11, 27, 61, 0.25)"
              highlightColor="#0B1B3D"
              containerStyle={{ textAlign: "center" }}
            />
            <p className="text-xs sm:text-sm text-body leading-relaxed max-w-xl mx-auto">
              Our integrated suite brings together coordinates, diagnostics, schedules, and accounting tools under a single interface.
            </p>
          </AnimeScrollReveal>

          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">Geofencing & Smart Routing</h3>
              <p className="text-xs text-body leading-relaxed">
                Create virtual geographic boundaries and map out custom delivery zones. Trigger automated mobile notifications whenever a vehicle enters or exits a geofence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">IoT Telematics Integration</h3>
              <p className="text-xs text-body leading-relaxed">
                Connect directly with onboard diagnostics (OBD) systems and telemetry transponders. Track parameters like engine RPM, coolant temperature, and DTC fault codes instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">Real-time Emergency Alerts</h3>
              <p className="text-xs text-body leading-relaxed">
                Configure instant alerts for safety events, sudden deceleration, speeding spikes, geofence breaches, or overnight unauthorized usage.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">Smart Maintenance Hub</h3>
              <p className="text-xs text-body leading-relaxed">
                Automate schedule warnings for oil filter changes, tire rotations, brake pad replacements, and emissions checks. Reduce downtime and repair costs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">Digital Document Wallet</h3>
              <p className="text-xs text-body leading-relaxed">
                Store registration cards, road permits, commercial vehicle insurance, emission certifications, and driving licenses securely in the cloud. Get expiry notifications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#FAFBFC] p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-xs anime-icon-hover">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm sm:text-base">Automated Trip Logging</h3>
              <p className="text-xs text-body leading-relaxed font-normal">
                Maintain accurate records of all driver routes, distance traveled, start/end locations, transit times, and delay patterns. Eliminate manual logbooks.
              </p>
            </div>

          </AnimeStaggerGroup>
        </div>
      </section>
    </div>
  );
}
