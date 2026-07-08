import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Home({ setActiveTab }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
      {/* 1. Header/Navbar */}
      <header className="bg-white border-b border-border-custom px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between sticky top-0 z-30">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Fleet Management Logo" className="h-10 w-auto rounded-lg object-contain" />
          <div>
            <h1 className="font-display font-bold text-secondary tracking-wide text-sm sm:text-base hidden xs:block sm:block">Fleet Management</h1>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setActiveTab?.("home")}
            className="text-sm font-semibold text-heading relative py-2 border-b-2 border-secondary bg-transparent border-none cursor-pointer text-left"
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab?.("performance")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab?.("about")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
          >
            About
          </button>
          <button
            onClick={() => setActiveTab?.("contact")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
          >
            Contact Us
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-secondary/10 text-secondary font-semibold text-[11px] sm:text-xs transition-all hover:bg-secondary/20 active:scale-[0.98] cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl border border-secondary text-secondary font-semibold text-[11px] sm:text-xs transition-all hover:bg-secondary/5 active:scale-[0.98] cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-secondary text-white font-semibold text-[11px] sm:text-xs transition-all hover:bg-accent shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
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
          <button
            onClick={() => { setActiveTab?.("home"); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-semibold text-sm text-heading hover:text-secondary transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab?.("performance"); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-semibold text-sm text-body hover:text-secondary transition-colors"
          >
            Performance
          </button>
          <button
            onClick={() => { setActiveTab?.("about"); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-semibold text-sm text-body hover:text-secondary transition-colors"
          >
            About
          </button>
          <button
            onClick={() => { setActiveTab?.("contact"); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 font-semibold text-sm text-body hover:text-secondary transition-colors"
          >
            Contact Us
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative w-full overflow-hidden border-b border-border-custom bg-white">
        {/* Background Sunset Highway Truck Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        {/* Translucent overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/70 md:to-transparent lg:bg-gradient-to-r lg:from-white/80 lg:via-white/60 lg:to-transparent" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-44 lg:py-52 min-h-[450px] sm:min-h-[500px] md:min-h-[650px] lg:min-h-[750px] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 max-w-lg">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-heading leading-tight tracking-tight">
              Smarter Fleet Control. <br />
              Better <span className="text-secondary">Business</span> Performance.
            </h2>
            <p className="text-base md:text-lg text-body font-medium leading-relaxed">
              Track and optimise your vehicles in real time with a powerful platform designed for businesses. Reduce costs, and stay in full control of your fleet.
            </p>

            {/* Checklist */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-heading">
                <svg className="h-5 w-5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-heading">
                <svg className="h-5 w-5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-heading">
                <svg className="h-5 w-5 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>24/7 support</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  sessionStorage.removeItem("token");
                  navigate("/signup");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-accent shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Get Started
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                onClick={() => handleAction("Hero Contact Us")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-body/30 bg-transparent px-6 py-3.5 text-sm font-bold text-heading hover:bg-hover-custom hover:border-heading transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Contact us
                <svg className="h-4.5 w-4.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-12 sm:py-20 bg-white px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Centered Heading */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Everything Your Fleet Needs
            </h3>
            <p className="text-sm md:text-base text-body leading-relaxed">
              From tracking to analytics to compliance — FleetCommand is the single platform that eliminates operational blind spots.
            </p>
          </div>

          {/* 3x2 Grid Cards layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-x-[129px] gap-y-8 lg:gap-y-[54px]">
            {/* Card 1: GPS Tracking */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Real-Time GPS Tracking</h4>
                <p className="text-xs text-body leading-relaxed">
                  Monitor every vehicle's exact location with sub-second refresh rate and geofencing alerts.
                </p>
              </div>
            </div>

            {/* Card 2: Performance Analytics */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Performance Analytics</h4>
                <p className="text-xs text-body leading-relaxed">
                  Comprehensive dashboards with driver behavior scores, fuel efficiency trends, and route optimization.
                </p>
              </div>
            </div>

            {/* Card 3: Maintenance Alerts */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Maintenance Alerts</h4>
                <p className="text-xs text-body leading-relaxed">
                  Predictive maintenance scheduling prevents breakdowns before they happen, reducing downtime by 35%.
                </p>
              </div>
            </div>

            {/* Card 4: Fuel Management */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Fuel Management</h4>
                <p className="text-xs text-body leading-relaxed">
                  Track fuel consumption per vehicle, identify wastes, and cut costs with intelligent routing.
                </p>
              </div>
            </div>

            {/* Card 5: Driver Management */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Driver Management</h4>
                <p className="text-xs text-body leading-relaxed">
                  Full driver profiles, HOS compliance, performance scoring, and incident reporting in one place.
                </p>
              </div>
            </div>

            {/* Card 6: Instant Notifications */}
            <div className="rounded-3xl bg-[#FFDBCC] border border-[#FFDBCC] p-8 space-y-6 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-md">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-heading">Instant Notifications</h4>
                <p className="text-xs text-body leading-relaxed">
                  Real-time alerts for speeding, idle time, unsafe driving, and critical maintenance issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ready to Take Control of Your Fleet? CTA Section */}
      <section className="bg-bg-page py-8 sm:py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-border-custom p-6 sm:p-8 md:p-12 text-center space-y-6 shadow-sm">
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-secondary">
            Ready to Take Control of Your Fleet?
          </h3>
          <p className="text-sm md:text-base text-body max-w-xl mx-auto">
            Join 340+ enterprises who trust FleetCommand with their most critical operations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("token");
                navigate("/signup");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-primary-dark shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              Start Your Free Trial
              <svg className="h-4.5 w-4.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer (Dark Background) */}
      <footer className="bg-primary text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pb-12 border-b border-gray-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-9 w-auto rounded-lg object-contain bg-white/10 p-0.5" />
              <h4 className="font-display font-bold text-white tracking-wide text-sm">Fleet Management</h4>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              The industry's most trusted fleet management platform. Real-time visibility, intelligent routing, and proactive maintenance.
            </p>
          </div>

          {/* Column 2: PRODUCT */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Product</h5>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><a href="#performance" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Performance"); }} className="hover:text-white transition-colors">Performance</a></li>
              <li><a href="#tracking" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Live Tracking"); }} className="hover:text-white transition-colors">Live Tracking</a></li>
              <li><a href="#analytics" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Fuel Analytics"); }} className="hover:text-white transition-colors">Fuel Analytics</a></li>
              <li><a href="#maintenance" onClick={(e) => { e.preventDefault(); handleAction("Footer Product - Maintenance"); }} className="hover:text-white transition-colors">Maintenance</a></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Company</h5>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - About"); }} className="hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Contact"); }} className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#careers" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Careers"); }} className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#blog" onClick={(e) => { e.preventDefault(); handleAction("Footer Company - Blog"); }} className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 4: CONTACT */}
          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Contact</h5>
            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hello@fleetcommand.io</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>fleetcommand.io</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted font-medium">
          <div>
            <span>© 2026 FleetCommand Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); handleAction("Privacy Policy"); }} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); handleAction("Terms of Service"); }} className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#cookies" onClick={(e) => { e.preventDefault(); handleAction("Cookie Policy"); }} className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
