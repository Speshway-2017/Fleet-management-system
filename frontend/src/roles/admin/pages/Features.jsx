import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";
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

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans text-body">
      <LandingHeader />

      {/* 2. Hero Section with Background Volvo Truck */}
      <section className="relative w-full overflow-hidden border-b border-border-custom bg-white min-h-[550px] md:min-h-[600px] flex items-center">
        {/* Background Sunset Highway Truck Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        {/* Translucent overlay for text legibility (minimized white casting for maximum image clarity) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent md:bg-gradient-to-r md:from-white/70 md:via-white/30 md:to-transparent lg:bg-gradient-to-r lg:from-white/65 lg:via-white/15 lg:to-transparent" />

        {/* Content Container */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16 space-y-12 z-10">
          
          {/* Main Hero Header */}
          <div className="space-y-4 max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit">
              <span>🚀</span>
              <span>Advanced Operations Suite</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight leading-tight">
              Powerful Features for <br />
              <span className="text-[#A14000]">Modern Fleet Operations</span>
            </h2>
            <p className="text-sm md:text-base text-body leading-relaxed max-w-xl font-normal">
              From real-time GPS telemetry to workflow automation and real-time tracking, discover the advanced features designed to maximize operations efficiency.
            </p>
          </div>

          {/* 4 Feature Columns at the bottom of hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            
            {/* Live GPS Tracking */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Live GPS Tracking</h4>
                <p className="text-[10px] text-body leading-normal">Real-time coordinates and visual location monitoring.</p>
              </div>
            </div>

            {/* Operational Efficiency */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Operational Efficiency</h4>
                <p className="text-[10px] text-body leading-normal">Resource tracking, performance analytics, and cost planning.</p>
              </div>
            </div>

            {/* Driver Analytics */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Driver Scoring</h4>
                <p className="text-[10px] text-body leading-normal">Safety tracking, speed monitoring, and behavioral scoring.</p>
              </div>
            </div>

            {/* Performance Monitoring */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">AI Diagnostics</h4>
                <p className="text-[10px] text-body leading-normal">Predictive maintenance planning and engine health alerts.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Deep-Dive Features Breakdown */}
      <section className="py-20 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Comprehensive Toolkit</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Everything You Need to Manage Your Fleet
            </h2>
            <p className="text-xs sm:text-sm text-body leading-relaxed max-w-xl mx-auto">
              Our integrated suite brings together coordinates, diagnostics, schedules, and accounting tools under a single interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">Geofencing & Smart Routing</h3>
              <p className="text-xs text-body leading-relaxed">
                Create virtual geographic boundaries and map out custom delivery zones. Trigger automated mobile notifications whenever a vehicle enters or exits a geofence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">IoT Telematics Integration</h3>
              <p className="text-xs text-body leading-relaxed">
                Connect directly with onboard diagnostics (OBD) systems and telemetry transponders. Track parameters like engine RPM, coolant temperature, and DTC fault codes instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">Real-time Emergency Alerts</h3>
              <p className="text-xs text-body leading-relaxed">
                Configure instant alerts for safety events, sudden deceleration, speeding spikes, geofence breaches, or overnight unauthorized usage.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">Smart Maintenance Hub</h3>
              <p className="text-xs text-body leading-relaxed">
                Automate schedule warnings for oil filter changes, tire rotations, brake pad replacements, and emissions checks. Reduce downtime and repair costs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">Digital Document Wallet</h3>
              <p className="text-xs text-body leading-relaxed">
                Store registration cards, road permits, commercial vehicle insurance, emission certifications, and driving licenses securely in the cloud. Get expiry notifications.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#FAFBFC] p-8 rounded-2xl border border-border-custom hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-[#0B1B3D] text-sm">Automated Trip Logging</h3>
              <p className="text-xs text-body leading-relaxed font-normal">
                Maintain accurate records of all driver routes, distance traveled, start/end locations, transit times, and delay patterns. Eliminate manual logbooks.
              </p>
            </div>

          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
