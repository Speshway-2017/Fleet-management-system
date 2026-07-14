import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  MapPin, 
  Coins, 
  Users, 
  Activity, 
  ShieldCheck, 
  TrendingUp,
  Cpu,
  Clock,
  Bell,
  Wrench,
  Navigation
} from "lucide-react";

export default function Features() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const mobileNavLinkClass = ({ isActive }) => {
    return `block w-full text-left py-2 font-semibold text-sm transition-colors ${
      isActive ? "text-[#A14000]" : "text-body hover:text-[#A14000]"
    }`;
  };

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans text-body">
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
          <NavLink to="/features" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
            Features
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
          <NavLink to="/features" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Features
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

      {/* 2. Hero Section with Background Volvo Truck */}
      <section className="relative w-full overflow-hidden border-b border-border-custom bg-white py-16 md:py-24 flex items-center min-h-[550px]">
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
              From real-time GPS telemetry to machine learning route planning, discover the advanced features designed to maximize operations efficiency.
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

            {/* Fuel Optimization */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Fuel Optimization</h4>
                <p className="text-[10px] text-body leading-normal">Consumption tracking, leak detection, and cost planning.</p>
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

            {/* AI Diagnostics */}
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
              <p className="text-[11px] text-body leading-relaxed">
                Maintain accurate records of all driver routes, distance traveled, start/end locations, transit times, and delay patterns. Eliminate manual logbooks.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-[#0B1B3D] text-white pt-16 pb-10 border-t border-border-custom px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#A14000]/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Column 1: Platform Branding */}
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
              <li><NavLink to="/features" className="hover:text-white transition-colors">Features</NavLink></li>
              <li><NavLink to="/security" className="hover:text-white transition-colors">Security</NavLink></li>
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
