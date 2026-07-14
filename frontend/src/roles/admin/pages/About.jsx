import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const navLinkClass = ({ isActive }) => {
    return `text-sm font-semibold py-2 rounded-xl transition-all duration-200 px-3 ${isActive
        ? "bg-secondary text-white"
        : "text-body hover:text-heading bg-transparent"
      }`;
  };

  const mobileNavLinkClass = ({ isActive }) => {
    return `block w-full text-left py-2 font-semibold text-sm transition-colors ${isActive
        ? "text-secondary"
        : "text-body hover:text-secondary"
      }`;
  };

  const timelineItems = [
    { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
    { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
    { year: "2021", text: "Series A — ₹200 Cr. Expanded to fuel analytics and driver scoring." },
    { year: "2023", text: "Surpassed 1M vehicles tracked. Launched predictive maintenance AI." },
    { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." },
  ];

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
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

      {/* 2. Our Story Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-white border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-heading tracking-tight leading-tight">
              Built for Fleet Operators, by Logistics Experts
            </h2>
            <div className="space-y-4 text-sm md:text-base text-body font-medium leading-relaxed">
              <p>
                Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.
              </p>
              <p>
                Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface.
              </p>
            </div>
          </div>

          {/* Right Column: 2x2 Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 pt-4">
            {/* Card 1 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">2018</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Founded</span>
            </div>
            {/* Card 2 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">340+</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display">Enterprises</span>
            </div>
            {/* Card 3 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">1.2M+</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Vehicles Tracked</span>
            </div>
            {/* Card 4 */}
            <div className="bg-[#FFDBCC] rounded-3xl p-4 sm:p-6 text-center space-y-1 shadow-sm flex flex-col justify-center">
              <span className="text-xl sm:text-3xl font-extrabold text-heading font-display block tracking-tight">$180M+</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Customer Savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-bg-page border-b border-border-custom">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left Column: Mission Content */}
          <div className="space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Our Mission
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-heading tracking-tight leading-tight">
              Eliminating Blind Spots in Fleet Operations
            </h2>
            <div className="space-y-4 text-sm md:text-base text-body font-medium leading-relaxed">
              <p>
                Every year, inefficient fleet management costs businesses billions in wasted fuel, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.
              </p>
              <p>
                FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork.
              </p>
            </div>
            {/* Quote Block */}
            <div className="border-l-4 border-secondary pl-5 italic text-heading font-semibold text-sm md:text-base my-4 max-w-md">
              "The only way to run a fleet well is to see it clearly."
            </div>
          </div>

          {/* Right Column: Attributes List */}
          <div className="space-y-5">
            {/* Item 1 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Total Transparency</h4>
                <p className="text-xs text-body leading-relaxed">
                  We give fleet operators complete visibility — every vehicle, every driver, every mile.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Reliability First</h4>
                <p className="text-xs text-body leading-relaxed">
                  Our 99.97% uptime SLA keeps your operations moving. Never depend on a flaky platform.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Outcome-Driven</h4>
                <p className="text-xs text-body leading-relaxed">
                  We measure our success by your cost savings, not just platform adoption.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-start gap-4 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-heading">Customer Obsession</h4>
                <p className="text-xs text-body leading-relaxed">
                  Dedicated success managers, 24/7 support, and onboarding that gets you live fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Journey Timeline Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-8 bg-white border-b border-border-custom text-center">
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
          <div className="space-y-2">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
              Timeline
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-heading tracking-tight">
              Our Journey
            </h3>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-8 text-left border-l border-border-custom pl-8 ml-4 relative">
            {timelineItems.map((item, idx) => (
              <div key={idx} className="relative space-y-1.5 pb-2">
                {/* Timeline Bullet Point */}
                <div className="absolute -left-[37px] top-1.5 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-white shadow-sm" />
                <h4 className="font-display font-extrabold text-sm text-heading tracking-wide">
                  {item.year}
                </h4>
                <p className="text-xs text-body font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 00-2.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hello@fleetmanagement.io</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>fleetmanagement.io</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted font-medium">
          <div>
            <span>© 2026 FleetManagement Inc. All rights reserved.</span>
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
