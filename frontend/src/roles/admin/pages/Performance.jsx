import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import anime from "animejs";
import { heroSequence } from "@/utils/animeUtils";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import { useAuth } from "@/context/AuthContext";
import SpotlightRevealText from "@/components/common/SpotlightRevealText";
import CountUpNumber from "@/components/common/CountUpNumber";
import GoldFrameCard from "@/components/common/GoldFrameCard";
import WordRevealParagraph from "@/components/common/WordRevealParagraph";
import { 
  Shield, 
  Settings, 
  Key, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Database, 
  Cloud, 
  Lock, 
  Headphones, 
  Zap, 
  Truck, 
  MapPin, 
  Coins, 
  Activity, 
  Users, 
  Award,
  ChevronRight
} from "lucide-react";

export default function Performance() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
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

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

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
              <span>📈</span>
              <span>Performance You Can Count On</span>
            </div>

            <div data-hero-heading className="opacity-0 text-center w-full">
              <SpotlightRevealText
                text="Delivering Performance That Moves Your Business"
                as="h1"
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0B1B3D] leading-tight tracking-tight block text-center"
              />
            </div>
            
            <div className="max-w-2xl mx-auto text-center">
              <WordRevealParagraph
                text="Our Fleet Management System is engineered to deliver reliable, efficient, and uninterrupted performance—every day, on every journey."
                fontSize="1.2rem"
                lineHeight="1.8"
                className="text-body font-medium text-center"
              />
            </div>
          </div>

          {/* 4 Feature Columns at the bottom of hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 max-w-6xl mx-auto">
            
            {/* High Reliability */}
            <div data-hero-card className="opacity-0">
              <GoldFrameCard>
                <div className="flex gap-3 items-start p-4 anime-card-lift">
                  <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-[#0B1B3D]">High Reliability</h4>
                    <p className="text-[10px] text-body leading-normal">99.8% system uptime ensures your operations never stop.</p>
                  </div>
                </div>
              </GoldFrameCard>
            </div>

            {/* Optimized Operations */}
            <div data-hero-card className="opacity-0">
              <GoldFrameCard>
                <div className="flex gap-3 items-start p-4 anime-card-lift">
                  <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-[#0B1B3D]">Optimized Operations</h4>
                    <p className="text-[10px] text-body leading-normal">Streamlined processes reduce delays, costs, and manual effort.</p>
                  </div>
                </div>
              </GoldFrameCard>
            </div>

            {/* Data Security */}
            <div data-hero-card className="opacity-0">
              <GoldFrameCard>
                <div className="flex gap-3 items-start p-4 anime-card-lift">
                  <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-[#0B1B3D]">Data Security</h4>
                    <p className="text-[10px] text-body leading-normal">Enterprise-grade security keeps your data safe and compliant.</p>
                  </div>
                </div>
              </GoldFrameCard>
            </div>

            {/* Built for Scale */}
            <div data-hero-card className="opacity-0">
              <GoldFrameCard>
                <div className="flex gap-3 items-start p-4 anime-card-lift">
                  <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-[#0B1B3D]">Built for Scale</h4>
                    <p className="text-[10px] text-body leading-normal">Handle growing fleets and users without performance drop.</p>
                  </div>
                </div>
              </GoldFrameCard>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Full Width Dark Stats Banner */}
      <div className="bg-[#0B1B3D] text-white py-6 px-4 sm:px-6 md:px-8 border-b border-blue-900/30">
        <div className="max-w-[1550px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-between items-center text-center">
          
          <div className="flex flex-col items-center gap-1.5">
            <Shield className="w-5 h-5 text-[#A14000]" />
            <CountUpNumber endValue={99.8} decimals={1} suffix="%" className="text-sm text-white" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">System Uptime</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">Lightning Fast</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Real-time Updates</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Database className="w-5 h-5 text-[#A14000]" />
            <CountUpNumber endValue={100} suffix="%" className="text-sm text-white" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Data Integrity</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Cloud className="w-5 h-5 text-[#A14000]" />
            <CountUpNumber endValue={99.9} decimals={1} suffix="%" className="text-sm text-white" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Service Availability</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Lock className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">24/7 Secure</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Protected</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Headphones className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">&lt; 2 Min</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Response Time</span>
          </div>

        </div>
      </div>

      {/* 4. Built for Operational Excellence Section */}
      <section className="py-16 md:py-24 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Built for Operational Excellence</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Performance at Every Mile
            </h2>
            <p className="text-xs sm:text-sm text-body max-w-xl mx-auto leading-relaxed">
              From real-time tracking to vehicle and driver management, our system ensures peak performance across your entire fleet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side -> 6 stats details sliding in from left */}
            <AnimeStaggerGroup direction="top" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 order-2 lg:order-1">
              
              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Real-time Tracking</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Instant location updates with high accuracy and low latency.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Fleet Visibility</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Real-time tracking algorithms reduce transit delay, idle time, and resource waste.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Performance Monitoring</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Monitor utilization logs and optimize key performance indicators.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Compliance Monitoring</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Automated scheduling alerts and timely warnings prevent major vehicle breakdowns.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Driver Performance</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Track speed, acceleration, and idling to encourage safer habits.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-300 hover:bg-orange-50/30 hover:border-orange-200 border border-transparent">
                <div className="p-2 rounded-xl bg-orange-50 text-[#A14000] shrink-0 border border-orange-100/50 shadow-xs anime-icon-hover">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Trip Management</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Streamlined workflows from trip dispatch to complete delivery logs.</p>
                </div>
              </div>

            </AnimeStaggerGroup>

            {/* Right side -> Why Our System Performs Better */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <h3 className="font-display font-extrabold text-heading text-lg sm:text-xl border-b border-border-custom pb-3">
                Why Our System Performs Better
              </h3>

              <AnimeStaggerGroup direction="top" className="space-y-4">
                <div className="flex gap-3.5 items-start p-2 rounded-xl transition-all hover:bg-slate-50">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">01</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Real-time & Accurate</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Live data synchronization ensures you always have the latest and most accurate information.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-2 rounded-xl transition-all hover:bg-slate-50">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">02</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Reliable & Robust</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Built with a scalable architecture ensuring maximum uptime and reliability.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-2 rounded-xl transition-all hover:bg-slate-50">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">03</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Fast & Responsive</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Optimized for speed to give you a smooth experience across all devices.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-2 rounded-xl transition-all hover:bg-slate-50">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">04</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Secure & Compliant</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Advanced security protocols and regular backups keep your data protected.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-2 rounded-xl transition-all hover:bg-slate-50">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">05</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Future Ready</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Continuously updated with the latest technology to keep your fleet ahead.</p>
                  </div>
                </div>
              </AnimeStaggerGroup>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Performance Results Cards (5 Cards) */}
      <section className="py-16 md:py-24 bg-bg-page border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Performance You Can See</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Results You Can Feel
            </h2>
          </div>

          <AnimeStaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* Card 1: Higher Fleet Utilization */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 anime-card-lift flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4 anime-icon-hover">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Higher Fleet Utilization</h4>
                <p className="text-[11px] text-body leading-relaxed">Reduce idle time and improve asset utilization across vehicles.</p>
              </div>
            </div>

            {/* Card 2: Lower Operational Costs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 anime-card-lift flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4 anime-icon-hover">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Lower Operational Costs</h4>
                 <p className="text-[11px] text-body leading-relaxed">Optimize resource usage, vehicle health, and overall expenses.</p>
              </div>
            </div>

            {/* Card 3: Happier Drivers */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 anime-card-lift flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4 anime-icon-hover">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Happier Drivers</h4>
                 <p className="text-[11px] text-body leading-relaxed">Better communication, tracking, and support for all drivers.</p>
              </div>
            </div>

            {/* Card 4: Fewer Breakdowns */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 anime-card-lift flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4 anime-icon-hover">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Fewer Breakdowns</h4>
                 <p className="text-[11px] text-body leading-relaxed">Proactive monitoring helps reduce unexpected vehicle downtime.</p>
              </div>
            </div>

            {/* Card 5: Smooth Decision Making */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 anime-card-lift flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4 anime-icon-hover">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Smooth Decision Making</h4>
                <p className="text-[11px] text-body leading-relaxed">All the right information at the right time for better decisions.</p>
              </div>
            </div>

          </AnimeStaggerGroup>
        </div>
      </section>

      {/* 6. Experience Peak Performance Banner (CTA) */}
      <section className="py-12 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-[1550px] mx-auto rounded-3xl bg-[#A14000] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">

          <div className="space-y-2">
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold">
              Experience Peak Performance with Our Fleet Management System
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl font-normal leading-relaxed">
              Power your fleet with a system built for reliability, efficiency, and results.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/contact")}
            className="px-6 py-3.5 bg-white text-[#A14000] hover:bg-gray-50 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98] shrink-0 whitespace-nowrap"
          >
            Request Demo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
