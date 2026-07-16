import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Building2, ShieldCheck, Truck, Shield, Activity, Coins, Bell, Clock, MapPin, Users, Award, Route, Star, UserCheck, CheckCircle2, TrendingUp, TrendingDown, Zap, Headphones, Cog, Wifi, Database, Rocket } from "lucide-react";
import BlogCard from "@/components/common/BlogCard";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);

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

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-[#4B5563]">
      <LandingHeader />

      {/* 2. Hero Section */}
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
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16 space-y-12">

          {/* Main Hero Header */}
          <div className="space-y-4 max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit">
              <span>⚡</span>
              <span>Smarter Operations. Stronger Results.</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] leading-tight tracking-tight">
              Smart Fleet <br />
              <span className="text-[#A14000]">Management</span> Platform
            </h1>
            <p className="text-sm md:text-base text-body leading-relaxed max-w-xl font-normal">
              Manage your transportation operations with a secure, scalable, and intelligent fleet management platform built for enterprises.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 bg-[#A14000] hover:bg-[#853500] rounded-xl font-bold text-xs text-white flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                Login
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-xs text-heading flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                Learn More
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200/50 space-y-2.5">
              <p className="text-[10px] uppercase font-black tracking-widest text-[#0B1B3D]/65">Trusted by Logistics Leaders Nationwide</p>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">TRANSLOGIX</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">SPEEDCARGO</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">MOVEPRESS</span>
                <span className="font-display font-black text-xs tracking-widest text-[#0B1B3D]">GLOBALFREIGHT</span>
              </div>
            </div>
          </div>

          {/* 4 Feature Columns at bottom of hero banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            
            {/* Real-time Tracking */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Real-time Visibility</h4>
                <p className="text-[10px] text-body leading-normal">Track vehicles, drivers, and trips live with instant updates.</p>
              </div>
            </div>

            {/* Optimize Costs */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Optimize & Reduce Costs</h4>
                <p className="text-[10px] text-body leading-normal">Reduce operational costs with data-driven alerts and analytics.</p>
              </div>
            </div>

            {/* Improve Efficiency */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Improve Efficiency</h4>
                <p className="text-[10px] text-body leading-normal">Automate daily workflows and streamline logistics processes.</p>
              </div>
            </div>

            {/* Secure & Compliant */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Secure & Compliant</h4>
                <p className="text-[10px] text-body leading-normal">Enterprise-grade security with role-based access controls.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Redesigned Section 1: Fleet Highlights (5 Horizontal Cards) */}
      <section className="relative py-12 md:py-16 bg-[#FAFBFC] border-b border-border-custom px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Soft background glow blobs to make glassmorphism backdrop blur pop */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-72 h-72 bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

            {/* Card 1: Route */}
            <div className="group relative bg-white/45 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                  <Route className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#A14000] tracking-tight">2.5M+</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">KM Tracked Daily</h4>
              <p className="text-xs text-body font-normal leading-relaxed">Real-time GPS tracking across nationwide fleets.</p>
            </div>

            {/* Card 2: Truck */}
            <div className="group relative bg-white/45 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                  <Truck className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#A14000] tracking-tight">650+</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Vehicles Managed</h4>
              <p className="text-xs text-body font-normal leading-relaxed">Manage commercial fleets from one platform.</p>
            </div>

            {/* Card 3: Driver */}
            <div className="group relative bg-white/45 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                  <UserCheck className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#A14000] tracking-tight">350+</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Professional Drivers</h4>
              <p className="text-xs text-body font-normal leading-relaxed">Verified drivers with live monitoring.</p>
            </div>

            {/* Card 4: Building */}
            <div className="group relative bg-white/45 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                  <Building2 className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#A14000] tracking-tight">120+</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Enterprise Clients</h4>
              <p className="text-xs text-body font-normal leading-relaxed">Trusted by logistics companies nationwide.</p>
            </div>

            {/* Card 5: Star */}
            <div className="group relative bg-white/45 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50/60 text-[#A14000] flex items-center justify-center border border-orange-100/40 shadow-sm">
                  <Star className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#A14000] tracking-tight">98%</span>
              </div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-1">Customer Satisfaction</h4>
              <p className="text-xs text-body font-normal leading-relaxed">Reliable service backed by excellent support.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Redesigned Section 2: Why Choose Fleet Management */}
      <section className="py-20 md:py-28 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Why Choose Our Platform</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight">
              Smarter Technology. Stronger Operations.
            </h2>
            <p className="text-sm md:text-base text-body font-normal leading-relaxed">
              Deliver faster, safer, and more efficient fleet operations with one intelligent management platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Intelligent Fleet Automation */}
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-6 shadow-sm border border-orange-100/40">
                  <Cog className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-[#0B1B3D] mb-3">Intelligent Fleet Automation</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-6">
                  Streamline workflows, reduce manual workload, and streamline operations to ensure your fleet runs efficiently.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated workflows</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fleet Visibility</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Smart scheduling</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Reduced manual work</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Enterprise Security */}
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-6 shadow-sm border border-orange-100/40">
                  <Shield className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-[#0B1B3D] mb-3">Enterprise Security</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-6">
                  Bank-grade security frameworks and encrypted communications to safeguard operational logs and data.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Role-based access</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure authentication</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Encrypted data</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audit logs</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Real-Time Tracking */}
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-6 shadow-sm border border-orange-100/40">
                  <MapPin className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-[#0B1B3D] mb-3">Real-Time Tracking</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-6">
                  Complete visibility over every vehicle and driver in your fleet with live alerts and arrival predictions.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live vehicle location</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Driver monitoring</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant alerts</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ETA prediction</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Performance Insights */}
            <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#A14000] flex items-center justify-center mb-6 shadow-sm border border-orange-100/40">
                  <TrendingUp className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-[#0B1B3D] mb-3">Performance Insights</h4>
                <p className="text-xs text-body font-normal leading-relaxed mb-6">
                  Actionable reports, analytics, and driver management to drive fleet performance monitoring.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Operational reports</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fleet analytics</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cost optimization</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Driver Management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Section 3: Why Businesses Trust Us (Dark Premium #0F172A) */}
      <section className="py-20 md:py-28 bg-[#0F172A] text-white px-4 sm:px-6 md:px-8 relative overflow-hidden">
        {/* Abstract glowing shapes */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#A14000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Trusted Partner</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why Businesses Choose Our Platform
            </h2>
            <p className="text-sm md:text-base text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
              We deliver stable, secure, and enterprise-ready solutions designed to optimize operations and scale with your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Enterprise-grade Security */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 hover:-translate-y-1.5 hover:bg-slate-800/50 hover:border-slate-700/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#A14000] flex items-center justify-center mb-6 shadow-sm">
                  <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Enterprise-grade Security</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Cloud protection with encrypted communication and strict protocols for full data isolation.
                </p>
              </div>
            </div>

            {/* Card 2: Scalable Infrastructure */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 hover:-translate-y-1.5 hover:bg-slate-800/50 hover:border-slate-700/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#A14000] flex items-center justify-center mb-6 shadow-sm">
                  <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Scalable Infrastructure</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Supports businesses of every size. Spin up operations, add regions, and manage fleets dynamically.
                </p>
              </div>
            </div>

            {/* Card 3: High Availability */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 hover:-translate-y-1.5 hover:bg-slate-800/50 hover:border-slate-700/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#A14000] flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">High Availability</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  99.9% uptime with reliable cloud services and real-time multi-region redundancies.
                </p>
              </div>
            </div>

            {/* Card 4: Dedicated Support */}
            <div className="group relative bg-slate-800/25 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 hover:-translate-y-1.5 hover:bg-slate-800/50 hover:border-slate-700/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#A14000] flex items-center justify-center mb-6 shadow-sm">
                  <Headphones className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Dedicated Support</h4>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Expert assistance whenever you need help. Responsive 24/7/365 enterprise customer care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Section 4: Business Impact */}
      <section className="py-20 md:py-28 bg-[#FAFBFC] px-4 sm:px-6 md:px-8 border-b border-border-custom relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-black tracking-widest uppercase">Business Impact</h3>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight">
              Real Impact. Measurable Results.
            </h2>
            <p className="text-sm md:text-base text-body font-normal max-w-2xl mx-auto leading-relaxed">
              Our enterprise partners achieve outstanding gains in operational speed, cost reductions, and overall asset lifespan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Card 1: Deliveries on Time */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.04)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl font-black text-[#0B1B3D] tracking-tight">28%</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-6 mb-2">More Deliveries On Time</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Significant reduction in delays and scheduling overhead across nationwide operations.
                </p>
              </div>
            </div>

            {/* Stat Card 2: Operating Costs */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.04)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl font-black text-[#0B1B3D] tracking-tight">22%</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-6 mb-2">Lower Operating Costs</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Optimized asset efficiency and smart driver management policies cut down overhead.
                </p>
              </div>
            </div>

            {/* Stat Card 3: Fleet Utilization */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.04)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl font-black text-[#0B1B3D] tracking-tight">35%</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-6 mb-2">Better Fleet Utilization</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Maximized asset allocation ensures empty miles and inactive vehicle hours are minimized.
                </p>
              </div>
            </div>

            {/* Stat Card 4: Vehicle Breakdowns */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.04)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl font-black text-[#0B1B3D] tracking-tight">30%</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/40">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-display font-extrabold text-sm text-[#0B1B3D] mt-6 mb-2">Reduced Vehicle Breakdowns</h4>
                <p className="text-xs text-body font-normal leading-relaxed">
                  Performance monitoring and real-time warnings prevent major on-road failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 5. Our Fleet Ecosystem Section */}
      <section className="py-16 md:py-24 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Our Fleet Ecosystem</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Powering Every Kind of Fleet
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&q=80&w=400"
                alt="Heavy Truck"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Heavy Trucks</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-border-custom">
              <img
                src="/delivery-van.png"
                alt="Delivery Van"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Delivery Vans</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400"
                alt="Logistics Fleet"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Logistics Fleet</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-border-custom">
              <img
                src="/construction-vehicle.png"
                alt="Construction Vehicle"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Construction Vehicles</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md border border-border-custom col-span-2 md:col-span-1 lg:col-span-1">
              <img
                src="/transport-vehicle.png"
                alt="Transport Vehicle"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Transport Vehicles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What Our Customers Say (Testimonials) Section */}
      <section className="py-16 md:py-24 bg-[#FCFCFD] border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">What Our Customers Say</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Trusted by Businesses Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publicReviews.length > 0 ? (
              publicReviews.slice(0, 6).map((review) => (
                <div key={review._id} className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
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
                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
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

                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
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

                <div className="bg-white p-8 rounded-3xl border border-border-custom space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
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
          </div>
        </div>
      </section>

      {/* 6.5 Latest Insights Section */}
      <section className="py-16 md:py-24 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Resources & Insights</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Latest Insights
            </h2>
            <p className="text-sm text-body max-w-xl mx-auto leading-relaxed">
              Stay informed with the latest trends, best practices, and technological advancements in modern fleet management.
            </p>
          </div>

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

      {/* 7. Ready to Take Control of Your Fleet? CTA Section */}
      <section className="bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
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
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
