import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Building2, ShieldCheck, Truck, Shield, Activity, Coins, Bell, Clock, MapPin, Users, Award, Route, Star, UserCheck, CheckCircle2, TrendingUp, TrendingDown, Zap, Headphones, Cog, Wifi, Database, Rocket } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const mobileNavLinkClass = ({ isActive }) => {
    return `block w-full text-left py-2 font-semibold text-sm transition-colors ${isActive ? "text-[#A14000]" : "text-body hover:text-[#A14000]"
      }`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-[#4B5563]">
      {/* 1. Header/Navbar */}
      <header className="bg-white border-b border-border-custom px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Fleet Management Logo" className="h-10 w-auto object-contain" />
            <span className="font-display font-black text-[#0B1B3D] text-lg tracking-wide">
              Fleet Management
            </span>
          </NavLink>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`} end>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
            About
          </NavLink>
          <NavLink to="/performance" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
            Performance
          </NavLink>
          <NavLink to="/security" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
            Security
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
            Contact Us
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-body hidden sm:inline-block">
                {user?.name || "Admin"}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary font-semibold text-xs transition-all hover:bg-secondary/20 active:scale-[0.98] cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-xl bg-[#0B1B3D] text-white font-semibold text-xs flex items-center gap-2 hover:bg-[#152e5c] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
              </svg>
              Login
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border-custom px-6 py-4 space-y-3 shadow-lg sticky top-20 z-20">
          <NavLink to="/" className={mobileNavLinkClass} end onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/performance" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Performance
          </NavLink>
          <NavLink to="/security" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Security
          </NavLink>
          <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Contact Us
          </NavLink>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative w-full overflow-hidden border-b border-border-custom bg-white min-h-[500px] sm:min-h-[550px] md:min-h-[650px] lg:min-h-[720px] flex items-center">
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
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column (55% or lg:col-span-7 to balance text and right-side card) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Smarter Operations. Stronger Results. Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit">
              <span className="text-xs">⚡</span>
              <span>Smarter Operations. Stronger Results.</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-[#0B1B3D] leading-[1.1] tracking-tight">
              Smart Fleet <br />
              <span className="text-[#A14000]">Management</span> <br />
              Platform
            </h1>
            <p className="text-xs sm:text-sm text-body max-w-md font-normal leading-relaxed">
              Manage your transportation operations with a secure, scalable, and intelligent fleet management platform built for enterprises.
            </p>

            {/* List of features */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-gray-100 text-[#0B1B3D] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Real-time Fleet Visibility</h4>
                  <p className="text-[10px] text-body">Track vehicles, drivers, and trips in real-time with live updates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-gray-100 text-[#0B1B3D] shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Optimize & Reduce Costs</h4>
                  <p className="text-[10px] text-body">Reduce operational costs with data-driven insights & alerts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-gray-100 text-[#0B1B3D] shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Improve Efficiency</h4>
                  <p className="text-[10px] text-body">Automate workflows and streamline daily fleet operations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-gray-100 text-[#0B1B3D] shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Secure & Compliant</h4>
                  <p className="text-[10px] text-body">Enterprise-grade security with role-based access & audit logs.</p>
                </div>
              </div>
            </div>

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

          {/* Right Column (Performance Card - aligned to the absolute right edge of the sunset hero banner to keep vehicle visible) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end z-10 lg:absolute lg:right-4 xl:right-12 lg:top-1/2 lg:-translate-y-1/2 mt-8 lg:mt-0">
            <div className="bg-[#0B1B3D]/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 w-full max-w-sm text-white">
              <h3 className="font-display font-black text-lg text-white mb-6">Performance at a Glance</h3>

              <div className="space-y-5">
                {/* 99.8% System Uptime */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center border border-white/10 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">99.8%</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">System Uptime</p>
                  </div>
                </div>

                {/* < 2 Min Avg. Response Time */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center border border-white/10 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">&lt; 2 Min</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Avg. Response Time</p>
                  </div>
                </div>

                {/* 24/7 System Availability */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center border border-white/10 shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">24/7</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">System Availability</p>
                  </div>
                </div>

                {/* 100% Data Integrity */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center border border-white/10 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">100%</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Data Integrity</p>
                  </div>
                </div>

                {/* Zero Downtime Deployments */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-orange-400 flex items-center justify-center border border-white/10 shrink-0">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white">Zero</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Downtime Deployments</p>
                  </div>
                </div>
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
                  Streamline workflows, reduce manual workload, and optimize paths to ensure your fleet runs autonomously.
                </p>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-50">
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated workflows</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-body font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Route optimization</span>
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
                  Actionable reports, analytics, and maintenance planning to drive fleet performance optimization.
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
                  <span>Maintenance planning</span>
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
                  Optimized route efficiency and smart fuel consumption policies cut down overhead.
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
                  Predictive maintenance planning and real-time warnings prevent major on-road failures.
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
            <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&q=80&w=400"
                alt="Heavy Truck"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Heavy Trucks</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=400"
                alt="Delivery Van"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Delivery Vans</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400"
                alt="Logistics Fleet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Logistics Fleet</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border-custom">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400"
                alt="Construction Vehicle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                <span className="font-display font-bold text-xs sm:text-sm text-white">Construction Vehicles</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border-custom col-span-2 md:col-span-1 lg:col-span-1">
              <img
                src="/bus.png"
                alt="Transport Vehicle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* 8. Footer (Dark Background) */}
      <footer className="bg-[#0B1B3D] text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-gray-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-9 w-auto object-contain bg-white rounded-lg p-1" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="text-[#A14000] hover:opacity-80 transition-opacity">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
              </a>
              <a href="#" className="text-[#A14000] hover:opacity-80 transition-opacity">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="#" className="text-[#A14000] hover:opacity-80 transition-opacity">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="#" className="text-[#A14000] hover:opacity-80 transition-opacity">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.872.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Quick Links</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><NavLink to="/" className="hover:text-white transition-colors">Home</NavLink></li>
              <li><NavLink to="/performance" className="hover:text-white transition-colors">Performance</NavLink></li>
              <li><NavLink to="/security" className="hover:text-white transition-colors">Security</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-white transition-colors">Contact Us</NavLink></li>
            </ul>
          </div>

          {/* Column 3: PLATFORM */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Platform</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Features"); }} className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Security"); }} className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Integrations"); }} className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Pricing"); }} className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Documentation"); }} className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Column 4: COMPANY */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Company</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Careers"); }} className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Blog"); }} className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Privacy"); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleAction("Terms"); }} className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div className="space-y-4 text-xs text-gray-400">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Contact Us</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@fleetmanagement.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#A14000] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 font-medium">
          <div>
            <span>© 2026 Fleet Management. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("Privacy Policy"); }} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleAction("Terms of Service"); }} className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
