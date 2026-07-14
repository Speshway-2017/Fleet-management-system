import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
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
              <span>📈</span>
              <span>Performance You Can Count On</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] leading-tight tracking-tight">
              Delivering Performance <br />
              That <span className="text-[#A14000]">Moves Your Business</span>
            </h1>
            <p className="text-sm md:text-base text-body leading-relaxed max-w-xl font-normal">
              Our Fleet Management System is engineered to deliver reliable, efficient, and uninterrupted performance—every day, on every journey.
            </p>
          </div>

          {/* 4 Feature Columns at the bottom of hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            
            {/* High Reliability */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">High Reliability</h4>
                <p className="text-[10px] text-body leading-normal">99.8% system uptime ensures your operations never stop.</p>
              </div>
            </div>

            {/* Optimized Operations */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Optimized Operations</h4>
                <p className="text-[10px] text-body leading-normal">Streamlined processes reduce delays, costs, and manual effort.</p>
              </div>
            </div>

            {/* Data Security */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Data Security</h4>
                <p className="text-[10px] text-body leading-normal">Enterprise-grade security keeps your data safe and compliant.</p>
              </div>
            </div>

            {/* Built for Scale */}
            <div className="flex gap-3 items-start bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0B1B3D]">Built for Scale</h4>
                <p className="text-[10px] text-body leading-normal">Handle growing fleets and users without performance drop.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Full Width Dark Stats Banner */}
      <div className="bg-[#0B1B3D] text-white py-6 px-4 sm:px-6 md:px-8 border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-between items-center text-center">
          
          <div className="flex flex-col items-center gap-1.5">
            <Shield className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">99.8%</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">System Uptime</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">Lightning Fast</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Real-time Updates</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Database className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">100%</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Data Integrity</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Cloud className="w-5 h-5 text-[#A14000]" />
            <span className="text-sm font-black">99.9%</span>
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
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Built for Operational Excellence</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Performance at Every Mile
            </h2>
            <p className="text-xs sm:text-sm text-body max-w-xl mx-auto leading-relaxed">
              From real-time tracking to maintenance and fuel management, our system ensures peak performance across your entire fleet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side -> Truck Image surrounded by 6 stats details */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 order-2 lg:order-1">
              
              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Real-time Tracking</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Instant location updates with high accuracy and low latency.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Optimized Routes</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Efficient routing algorithms reduce travel time, distance & fuel.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Fuel Efficiency</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Monitor consumption logs and optimize fuel performance indicators.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Preventive Maintenance</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Automated schedules and timely alerts prevent major vehicle breakdowns.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Driver Performance</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Track speed, acceleration, and idling to encourage safer habits.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2 rounded-xl bg-gray-50 text-[#0B1B3D] shrink-0 border border-gray-100">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Trip Management</h4>
                  <p className="text-xs text-body leading-relaxed mt-0.5">Streamlined workflows from trip dispatch to complete delivery logs.</p>
                </div>
              </div>

            </div>

            {/* Right side -> Why Our System Performs Better */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <h3 className="font-display font-extrabold text-heading text-lg sm:text-xl border-b border-border-custom pb-3">
                Why Our System Performs Better
              </h3>

              <div className="space-y-5">
                <div className="flex gap-3.5 items-start">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">01</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Real-time & Accurate</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Live data synchronization ensures you always have the latest and most accurate information.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">02</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Reliable & Robust</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Built with a scalable architecture ensuring maximum uptime and reliability.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">03</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Fast & Responsive</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Optimized for speed to give you a smooth experience across all devices.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">04</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Secure & Compliant</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Advanced security protocols and regular backups keep your data protected.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="text-sm font-bold text-[#A14000] mt-0.5">05</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Future Ready</h4>
                    <p className="text-xs text-body leading-relaxed mt-0.5">Continuously updated with the latest technology to keep your fleet ahead.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Performance Results Cards (5 Cards) */}
      <section className="py-16 md:py-24 bg-bg-page border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase">Performance You Can See</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Results You Can Feel
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* Card 1: Higher Fleet Utilization */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Higher Fleet Utilization</h4>
                <p className="text-[11px] text-body leading-relaxed">Reduce idle time and improve asset utilization across vehicles.</p>
              </div>
            </div>

            {/* Card 2: Lower Operational Costs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Lower Operational Costs</h4>
                <p className="text-[11px] text-body leading-relaxed">Optimize fuel usage, maintenance, and overall expenses.</p>
              </div>
            </div>

            {/* Card 3: Happier Drivers */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Happier Drivers</h4>
                <p className="text-[11px] text-body leading-relaxed">Better communication, routes, and support for all drivers.</p>
              </div>
            </div>

            {/* Card 4: Fewer Breakdowns */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Fewer Breakdowns</h4>
                <p className="text-[11px] text-body leading-relaxed">Preventive maintenance helps reduce unexpected vehicle downtime.</p>
              </div>
            </div>

            {/* Card 5: Smooth Decision Making */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div className="h-9 w-9 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-[#0B1B3D]">Smooth Decision Making</h4>
                <p className="text-[11px] text-body leading-relaxed">All the right information at the right time for better decisions.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Experience Peak Performance Banner (CTA) */}
      <section className="py-12 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#A14000] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
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

      {/* 7. Footer (Dark Background) */}
      <footer className="bg-[#0B1B3D] text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto border-t border-blue-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-gray-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-9 w-auto object-contain bg-white rounded-lg p-1" />
              <span className="font-display font-black text-white text-sm tracking-wide">
                Fleet Management
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.
            </p>
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
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 font-medium">
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
