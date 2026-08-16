import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import anime from "animejs";
import { heroSequence, heroBackgroundAnimation } from "@/utils/animeUtils";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Building2, ShieldCheck, Truck, Shield, Activity, Coins, Bell, Clock, MapPin, Users, Award, Route, Star, UserCheck, CheckCircle2, TrendingUp, TrendingDown, Zap, Headphones, Cog, Cpu, Wifi, Database, Rocket } from "lucide-react";
import BlogCard from "@/components/common/BlogCard";
import RoundCarousel from "@/components/originkit/ui/roundcarousel";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";
import CountUpNumber from "@/components/common/CountUpNumber";
import SlideFromLeft from "@/components/common/SlideFromLeft";
import GoldFrameCard from "@/components/common/GoldFrameCard";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);
  const heroRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const fetchPublicReviews = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiBaseUrl}/public/reviews`);
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setPublicReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch public reviews:", err);
      }
    };
    fetchPublicReviews();
  }, []);

  useEffect(() => {
    let heroTimeline = null;
    let bgAnim = null;

    if (heroRef.current) {
      heroTimeline = heroSequence(heroRef.current);
    }
    if (bgRef.current) {
      bgAnim = heroBackgroundAnimation(bgRef.current);
    }

    return () => {
      if (heroTimeline) {
        try { heroTimeline.pause(); } catch (_) {}
      }
      if (bgAnim) {
        try { bgAnim.pause(); } catch (_) {}
      }
      if (heroRef.current) anime.remove(heroRef.current.querySelectorAll("*"));
    };
  }, []);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  return (
    <div className="bg-white flex-1 flex flex-col font-sans text-[#4B5563]">

      {/* 2. Hero Section */}
      <section ref={heroRef} className="relative w-full overflow-hidden border-b border-border-custom bg-white min-h-[550px] md:min-h-[600px] flex items-center">
        {/* Background Sunset Highway Truck Image - Continuous Smooth Parallax Travelling Effect */}
        <div
          ref={bgRef}
          data-hero-bg
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-0"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        {/* Translucent overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent md:bg-gradient-to-r md:from-white/70 md:via-white/30 md:to-transparent lg:bg-gradient-to-r lg:from-white/65 lg:via-white/15 lg:to-transparent" />

        {/* Content Container */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10 space-y-8">

          {/* Main Hero Header */}
          <div className="space-y-4 max-w-2xl">
            {/* 1. Hero Pill badge -> Fade + slide up */}
            <div
              data-hero-badge
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit opacity-0"
            >
              <span>⚡</span>
              <span>Smarter Operations. Stronger Results.</span>
            </div>

            {/* 2. Main heading -> Smooth reveal from bottom */}
            <h1
              data-hero-heading
              className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] leading-tight tracking-tight opacity-0"
            >
              Smart Fleet <br />
              <span className="text-[#A14000]">Management</span> Platform
            </h1>

            {/* 3. Description -> Fade + slide up */}
            <p
              data-hero-desc
              className="text-sm md:text-base text-body leading-relaxed max-w-xl font-normal opacity-0"
            >
              Manage your transportation operations with a secure, scalable, and intelligent fleet management platform built for enterprises.
            </p>

            {/* 4. CTA Buttons -> Enlarged with Water Fill and Micro-Animations */}
            <div
              data-hero-buttons
              className="flex flex-wrap items-center gap-4 pt-3 opacity-0"
            >
              <button
                onClick={() => navigate("/login")}
                className="btn-water-fill px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base text-white flex items-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <span>Login</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="btn-learn-more px-7 py-3.5 sm:px-8 sm:py-4 bg-white border border-slate-300 rounded-2xl font-black text-sm sm:text-base text-[#0B1B3D] flex items-center gap-2.5 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span>Learn More</span>
                <svg className="h-5 w-5 btn-arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>


            {/* 5. Trusted companies -> Subtle reveal */}
            <div
              data-hero-trusted
              className="pt-6 border-t border-slate-200/50 space-y-2.5 opacity-0"
            >
              <p className="text-[10px] uppercase font-black tracking-widest text-[#0B1B3D]/65">Trusted by Logistics Leaders Nationwide</p>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">TRANSLOGIX</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">SPEEDCARGO</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">MOVEPRESS</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">GLOBALFREIGHT</span>
              </div>
            </div>
          </div>

          {/* 6. Staggered feature cards at bottom of hero banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Real-time Tracking */}
            <div data-hero-card className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm anime-card-lift opacity-0">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Truck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Real-time Visibility</h4>
                <p className="text-[10px] text-body leading-normal">Track vehicles, drivers, and trips live with instant updates.</p>
              </div>
            </div>

            {/* Optimize Costs */}
            <div data-hero-card className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm anime-card-lift opacity-0">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Optimize & Reduce Costs</h4>
                <p className="text-[10px] text-body leading-normal">Reduce operational costs with data-driven alerts and analytics.</p>
              </div>
            </div>

            {/* Improve Efficiency */}
            <div data-hero-card className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm anime-card-lift opacity-0">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Improve Efficiency</h4>
                <p className="text-[10px] text-body leading-normal">Automate daily workflows and streamline logistics processes.</p>
              </div>
            </div>

            {/* Enterprise Security */}
            <div data-hero-card className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm anime-card-lift opacity-0">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0 anime-icon-hover">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Enterprise Security</h4>
                <p className="text-[10px] text-body leading-normal">Role-based access, encrypted logs, and full data protection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Section 1: Fleet Highlights (5 Horizontal Cards) */}
      <section className="relative py-12 md:py-16 bg-[#FAFBFC] border-b border-border-custom px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Soft background glow blobs to make glassmorphism backdrop blur pop */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">


            {/* Card 1: Route */}
            <GoldFrameCard>
              <div className="p-6 flex flex-col justify-between h-full anime-card-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm anime-icon-hover">
                    <Route className="w-6 h-6" />
                  </div>
                  <CountUpNumber endValue={2.5} decimals={1} suffix="M+" className="text-xl sm:text-2xl text-[#A14000]" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">KM Tracked Daily</h4>
                <p className="text-xs text-body font-normal leading-relaxed">Real-time GPS tracking across nationwide fleets.</p>
              </div>
            </GoldFrameCard>

            {/* Card 2: Truck */}
            <GoldFrameCard>
              <div className="p-6 flex flex-col justify-between h-full anime-card-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm anime-icon-hover">
                    <Truck className="w-6 h-6" />
                  </div>
                  <CountUpNumber endValue={650} suffix="+" className="text-xl sm:text-2xl text-[#A14000]" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Vehicles Managed</h4>
                <p className="text-xs text-body font-normal leading-relaxed">Manage commercial fleets from one platform.</p>
              </div>
            </GoldFrameCard>

            {/* Card 3: Driver */}
            <GoldFrameCard>
              <div className="p-6 flex flex-col justify-between h-full anime-card-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm anime-icon-hover">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <CountUpNumber endValue={350} suffix="+" className="text-xl sm:text-2xl text-[#A14000]" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Professional Drivers</h4>
                <p className="text-xs text-body font-normal leading-relaxed">Verified drivers with live monitoring.</p>
              </div>
            </GoldFrameCard>

            {/* Card 4: Building */}
            <GoldFrameCard>
              <div className="p-6 flex flex-col justify-between h-full anime-card-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm anime-icon-hover">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <CountUpNumber endValue={120} suffix="+" className="text-xl sm:text-2xl text-[#A14000]" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Enterprise Clients</h4>
                <p className="text-xs text-body font-normal leading-relaxed">Trusted by logistics companies nationwide.</p>
              </div>
            </GoldFrameCard>

            {/* Card 5: Star */}
            <GoldFrameCard>
              <div className="p-6 flex flex-col justify-between h-full anime-card-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm anime-icon-hover">
                    <Star className="w-6 h-6" />
                  </div>
                  <CountUpNumber endValue={98} suffix="%" className="text-xl sm:text-2xl text-[#A14000]" />
                </div>
                <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Customer Satisfaction</h4>
                <p className="text-xs text-body font-normal leading-relaxed">Reliable service backed by excellent support.</p>
              </div>
            </GoldFrameCard>

          </AnimeStaggerGroup>
        </div>
      </section>

      {/* Redesigned Section 2: Why Choose Fleet Management */}
      <section className="py-20 md:py-28 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto space-y-16">
          <AnimeScrollReveal direction="top" className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Why Choose Our Platform</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight">
              Smarter Technology. Stronger Operations.
            </h2>
            <p className="text-sm md:text-base text-body font-normal leading-relaxed">
              Deliver faster, safer, and more efficient fleet operations with one intelligent management platform.
            </p>
          </AnimeScrollReveal>
          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Intelligent Fleet Automation */}
            <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] anime-card-lift flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-5 shadow-xs border border-orange-100/40 anime-icon-hover">
                  <Cog className="w-6 h-6" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-[#0B1B3D] mb-2.5">Intelligent Fleet Automation</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-5">
                  Streamline workflows, reduce manual workload, and streamline operations to ensure your fleet runs efficiently.
                </p>
              </div>
              <ul className="space-y-2.5 pt-3.5 border-t border-slate-50">
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated workflows</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fleet Visibility</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Smart scheduling</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Reduced manual work</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Enterprise Security */}
            <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] anime-card-lift flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-5 shadow-xs border border-orange-100/40 anime-icon-hover">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-[#0B1B3D] mb-2.5">Enterprise Security</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-5">
                  Bank-grade security frameworks and encrypted communications to safeguard operational logs and data.
                </p>
              </div>
              <ul className="space-y-2.5 pt-3.5 border-t border-slate-50">
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Role-based access</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure authentication</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Encrypted data</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audit logs</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Real-Time Tracking */}
            <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] anime-card-lift flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-5 shadow-xs border border-orange-100/40 anime-icon-hover">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-[#0B1B3D] mb-2.5">Real-Time Tracking</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-5">
                  Complete visibility over every vehicle and driver in your fleet with live alerts and arrival predictions.
                </p>
              </div>
              <ul className="space-y-2.5 pt-3.5 border-t border-slate-50">
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live vehicle location</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Driver monitoring</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant alerts</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ETA prediction</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Performance Insights */}
            <div className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] anime-card-lift flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-5 shadow-xs border border-orange-100/40 anime-icon-hover">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-[#0B1B3D] mb-2.5">Performance Insights</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-5">
                  Actionable reports, analytics, and driver management to drive fleet performance monitoring.
                </p>
              </div>
              <ul className="space-y-2.5 pt-3.5 border-t border-slate-50">
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Operational reports</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fleet analytics</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cost optimization</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Driver Management</span>
                </li>
              </ul>
            </div>
          </AnimeStaggerGroup>
        </div>
      </section>

      {/* Redesigned Section 3: Why Businesses Trust Us (Dark Premium #0F172A) */}
      <section className="py-16 md:py-24 bg-[#0F172A] text-white px-4 sm:px-6 md:px-8 relative overflow-hidden">
        {/* Abstract glowing shapes */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#A14000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1550px] mx-auto relative z-10 space-y-12">
          <AnimeScrollReveal direction="top" className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Trusted Partner</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why Businesses Choose Our Platform
            </h2>
            <p className="text-sm md:text-base text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
              We deliver stable, secure, and enterprise-ready solutions designed to optimize operations and scale with your organization.
            </p>
          </AnimeScrollReveal>

          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Enterprise-grade Security */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 text-[#A14000] flex items-center justify-center mb-5 border border-slate-700/60 anime-icon-hover">
                  <ShieldCheck className="w-6 h-6 text-[#A14000]" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-white mb-2">Enterprise-grade Security</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Advanced encryption, secure authentication, and strict compliance with modern digital security standards.
                </p>
              </div>
            </div>

            {/* Card 2: 99.9% Uptime SLA */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 text-[#A14000] flex items-center justify-center mb-5 border border-slate-700/60 anime-icon-hover">
                  <Activity className="w-6 h-6 text-[#A14000]" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-white mb-2">99.9% High Availability</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Guaranteed cloud reliability ensuring real-time telematics and live operations are always accessible.
                </p>
              </div>
            </div>

            {/* Card 3: Seamless Integration */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 text-[#A14000] flex items-center justify-center mb-5 border border-slate-700/60 anime-icon-hover">
                  <Cpu className="w-6 h-6 text-[#A14000]" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-white mb-2">Seamless Integration</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Easily integrate with existing ERP, telematics hardware, GPS trackers, and third-party logistics APIs.
                </p>
              </div>
            </div>

            {/* Card 4: Dedicated 24/7 Support */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 text-[#A14000] flex items-center justify-center mb-5 border border-slate-700/60 anime-icon-hover">
                  <Headphones className="w-6 h-6 text-[#A14000]" />
                </div>
                <h4 className="font-display font-extrabold text-base sm:text-lg text-white mb-2">Dedicated 24/7 Support</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Direct access to logistics and technical experts whenever your fleet needs fast on-demand assistance.
                </p>
              </div>
            </div>
          </AnimeStaggerGroup>
        </div>
      </section>

      {/* Redesigned Section 4: Business Impact */}
      <section className="py-16 md:py-24 bg-[#FAFBFC] px-4 sm:px-6 md:px-8 border-b border-border-custom relative">
        <div className="max-w-[1550px] mx-auto space-y-12">
          <AnimeScrollReveal direction="top" className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Business Impact</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight">
              Real Impact. Measurable Results.
            </h2>
            <p className="text-sm md:text-base text-body font-normal max-w-2xl mx-auto leading-relaxed">
              Our enterprise partners achieve outstanding gains in operational speed, cost reductions, and overall asset lifespan.
            </p>
          </AnimeScrollReveal>

          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Card 1: Deliveries on Time */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D] tracking-tight">28%</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-4.5 h-4.5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-5 mb-1.5">More Deliveries On Time</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Significant reduction in delays and scheduling overhead across nationwide operations.
                </p>
              </div>
            </div>

            {/* Stat Card 2: Operating Costs */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D] tracking-tight">22%</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-4.5 h-4.5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-5 mb-1.5">Lower Operating Costs</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Optimized asset efficiency and smart driver management policies cut down overhead.
                </p>
              </div>
            </div>

            {/* Stat Card 3: Fleet Utilization */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D] tracking-tight">35%</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingUp className="w-4.5 h-4.5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-5 mb-1.5">Better Fleet Utilization</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Maximized asset allocation ensures empty miles and inactive vehicle hours are minimized.
                </p>
              </div>
            </div>

            {/* Stat Card 4: Vehicle Breakdowns */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 anime-card-lift flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1B3D] tracking-tight">30%</span>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-4.5 h-4.5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-5 mb-1.5">Reduced Vehicle Breakdowns</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Performance monitoring and real-time warnings prevent major on-road failures.
                </p>
              </div>
            </div>
          </AnimeStaggerGroup>
        </div>
        <div className="max-w-[1550px] mx-auto space-y-8">
          <AnimeScrollReveal direction="top" className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Our Fleet Ecosystem</h3>
            <ScrollHighlight
              text="Powering Every Kind of Fleet"
              font={{ fontSize: "2rem", fontWeight: 900, fontFamily: "inherit" }}
              dimColor="rgba(11, 27, 61, 0.25)"
              highlightColor="#0B1B3D"
              containerStyle={{ textAlign: "center" }}
            />
          </AnimeScrollReveal>

          {/* 3D Round Carousel Vehicle Image Showcase - Pure White Background */}
          <div className="w-full h-[360px] md:h-[420px] bg-white relative flex items-center justify-center">
            <RoundCarousel
              images={[
                { src: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&q=80&w=800" },
                { src: "/delivery-van.png" },
                { src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800" },
                { src: "/construction-vehicle.png" },
                { src: "/transport-vehicle.png" },
                { src: "/hero-bg.jpg" }
              ]}
              imageWidth={280}
              imageHeight={210}
              speed={4}
              background="#FFFFFF"
              perspective={2200}
              tilt={-4}
              cornerRadius={18}
            />
          </div>
        </div>
      </section>

      {/* 6. What Our Customers Say (Testimonials) Section */}
      <section className="py-16 md:py-24 bg-[#FCFCFD] border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto space-y-16">
          <AnimeScrollReveal direction="top" className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">What Our Customers Say</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Trusted by Businesses Worldwide
            </h2>
          </AnimeScrollReveal>


          <AnimeStaggerGroup direction="top" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publicReviews.length > 0 ? (
              publicReviews.slice(0, 6).map((review) => (
                <div key={review._id} className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between anime-card-lift">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#A14000] text-4xl block leading-none font-serif">“</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-body leading-relaxed font-medium">
                      {review.reviewText}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-orange-50 text-[#A14000] font-bold text-xs flex items-center justify-center border border-orange-100/40 shadow-sm uppercase">
                      {review.managerName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-xs text-[#0B1B3D]">{review.managerName}</h5>
                      <p className="text-[10px] text-gray-500">Fleet Manager</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between anime-card-lift">
                  <div className="space-y-4">
                    <span className="text-[#A14000] text-4xl block leading-none font-serif">“</span>
                    <p className="text-xs text-body leading-relaxed font-medium">
                      FleetManagement has transformed the way we manage our fleet. The platform is easy to use, reliable, and the support team is excellent.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                      alt="Ravi Kumar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-display font-bold text-xs text-[#0B1B3D]">Ravi Kumar</h5>
                      <p className="text-[10px] text-gray-500">Operations Manager, TransLogix Solutions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between anime-card-lift">
                  <div className="space-y-4">
                    <span className="text-[#A14000] text-4xl block leading-none font-serif">“</span>
                    <p className="text-xs text-body leading-relaxed font-medium">
                      The real-time tracking and maintenance alerts have helped us reduce downtime significantly. Highly recommended for any transport business.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                      alt="Sneha Patel"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-display font-bold text-xs text-[#0B1B3D]">Sneha Patel</h5>
                      <p className="text-[10px] text-gray-500">Fleet Head, SpeedCargo Logistics</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between anime-card-lift">
                  <div className="space-y-4">
                    <span className="text-[#A14000] text-4xl block leading-none font-serif">“</span>
                    <p className="text-xs text-body leading-relaxed font-medium">
                      Secure, scalable, and feature-rich platform that grows with our business. Best fleet management solution we've used.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
                      alt="Arjun Mehta"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-display font-bold text-xs text-[#0B1B3D]">Arjun Mehta</h5>
                      <p className="text-[10px] text-gray-500">CTO, MovePress Pvt. Ltd.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AnimeStaggerGroup>
        </div>
      </section>

      {/* 6.5 Latest Insights Section */}
      <section className="py-16 md:py-24 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <AnimeScrollReveal direction="top" className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Resources & Insights</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Latest Insights
            </h2>
            <p className="text-sm text-body max-w-xl mx-auto leading-relaxed">
              Stay informed with the latest trends, best practices, and technological advancements in modern fleet management.
            </p>
          </AnimeScrollReveal>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogCard
              image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
              category="Operations"
              date="July 14, 2026"
              readTime="5 min read"
              title="How Digital Fleet Platforms Improve Business Efficiency"
              summary="Discover how centralized fleet management platforms simplify daily operations, improve collaboration, enhance visibility, and support better decision-making for growing transportation businesses."
              onReadMore={() => navigate("/blogs", { state: { openBlogTitle: "How Digital Fleet Platforms Improve Business Efficiency" } })}
            />
            <BlogCard
              image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
              category="Security"
              date="July 12, 2026"
              readTime="4 min read"
              title="Building Secure Fleet Operations for Modern Businesses"
              summary="Learn how secure authentication, role-based access, data protection, and cloud infrastructure help organizations safeguard operational information."
              onReadMore={() => navigate("/blogs", { state: { openBlogTitle: "Building Secure Fleet Operations for Modern Businesses" } })}
            />
            <BlogCard
              image="https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80"
              category="Technology"
              date="June 20, 2026"
              readTime="5 min read"
              title="Building Reliable Fleet Operations"
              summary="Leverage highly available cloud platforms and real-time connectivity to ensure enterprise reliability and consistent service delivery."
              onReadMore={() => navigate("/blogs", { state: { openBlogTitle: "Building Reliable Fleet Operations" } })}
            />
          </div>

          {/* Section Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/blogs")}
              className="px-6 py-3.5 bg-[#0B1B3D] hover:bg-[#152e5c] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] w-full sm:w-auto"
            >
              View All Articles
            </button>
            <button
              onClick={() => navigate("/blogs")}
              className="px-6 py-3.5 bg-transparent border border-[#0B1B3D] hover:bg-[#0B1B3D]/5 rounded-xl font-bold text-sm text-[#0B1B3D] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] w-full sm:w-auto"
            >
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* 7. Ready to Transform Your Fleet Operations? CTA Section */}
      <section className="bg-white py-16 px-4 sm:px-6 md:px-8">
        <AnimeScrollReveal direction="top" className="max-w-6xl mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          {/* Subtle background image */}
          <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600')" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/50 via-[#0B1B3D]/95 to-[#0B1B3D] pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <h3 className="font-display text-2xl md:text-3xl font-extrabold">Ready to Take Control of Your Fleet?</h3>
            <p className="text-sm text-gray-400">Join hundreds of businesses that trust our platform to manage their fleet operations efficiently.</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3.5 bg-[#A14000] hover:bg-[#853500] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Login to Dashboard
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3.5 bg-transparent border border-white hover:bg-white/10 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              Contact Us
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </AnimeScrollReveal>
      </section>
    </div>
  );
}
