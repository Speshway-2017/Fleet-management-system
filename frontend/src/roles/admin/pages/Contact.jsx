import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Contact({ setActiveTab }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent successfully!");
    setForm({
      fullName: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="bg-bg-page min-h-screen flex flex-col font-sans">
      {/* 1. Header/Navbar */}
      <header className="bg-white border-b border-border-custom px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between sticky top-0 z-30">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img src="/brand-logo.png" alt="Fleet Management Logo" className="h-10 w-auto rounded-lg object-contain" />
          <div>
            <h1 className="font-display font-bold text-secondary tracking-wide text-sm sm:text-base hidden xs:block sm:block">Fleet Management</h1>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setActiveTab?.("home")}
            className="text-sm font-semibold text-body hover:text-heading transition-colors py-2 bg-transparent border-none cursor-pointer text-left"
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
            className="text-sm font-semibold text-heading relative py-2 border-b-2 border-secondary bg-transparent border-none cursor-pointer text-left"
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
            className="block w-full text-left py-2 font-semibold text-sm text-body hover:text-secondary transition-colors"
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
            className="block w-full text-left py-2 font-semibold text-sm text-heading hover:text-secondary transition-colors"
          >
            Contact Us
          </button>
        </div>
      )}

      {/* 2. Title Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 bg-bg-page border-b border-border-custom">
        <div className="max-w-6xl mx-auto space-y-3 flex flex-col items-center">
          <span className="text-secondary font-bold text-xs uppercase tracking-widest block font-display">
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-heading tracking-tight text-center">
            We're Here to Help Your Fleet Grow
          </h2>
          <p className="text-sm md:text-base text-body font-medium max-w-2xl leading-relaxed text-center">
            Our team is ready to help you get the most out of your fleet operations.
          </p>
        </div>
      </section>

      {/* 3. Main Content Section (Split Columns) */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-bg-page">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Information (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                Contact Information
              </span>

              {/* Items List */}
              <div className="space-y-5">
                {/* Item 1: Sales */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block leading-none">Sales & General</span>
                    <span className="text-xs font-bold text-heading font-display mt-0.5 block">+1 800 FLEET-01</span>
                  </div>
                </div>

                {/* Item 2: Support */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block leading-none">Support Hotline</span>
                    <span className="text-xs font-bold text-heading font-display mt-0.5 block">+1 800 FLEET-02</span>
                  </div>
                </div>

                {/* Item 3: Email */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 00-2.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block leading-none">Email Us</span>
                    <span className="text-xs font-bold text-heading font-display mt-0.5 block">hello@fleetcommand.io</span>
                  </div>
                </div>

                {/* Item 4: Website */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block leading-none">Website</span>
                    <span className="text-xs font-bold text-heading font-display mt-0.5 block">fleetcommand.io</span>
                  </div>
                </div>

                {/* Item 5: Headquarters */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted block leading-none">Headquarters</span>
                    <span className="text-xs font-bold text-heading font-display mt-0.5 block">Austin, TX 78701</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navy Card */}
            <div className="bg-primary text-white rounded-2xl p-6 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold font-display">Support Available 24/7</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Average response time: <span className="text-white font-bold">4 minutes</span>
              </p>
            </div>
          </div>

          {/* Right Column: Send Us a Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-border-custom p-5 sm:p-8 md:p-10 shadow-sm">
            <h3 className="font-display font-extrabold text-heading text-xl mb-6">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="James Okafor"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl border border-border-custom px-4 py-3 text-xs focus:border-secondary focus:outline-none placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="james@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-border-custom px-4 py-3 text-xs focus:border-secondary focus:outline-none placeholder:text-gray-400 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Company and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="TransGlobal Freight"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full rounded-xl border border-border-custom px-4 py-3 text-xs focus:border-secondary focus:outline-none placeholder:text-gray-400 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Inquiry"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-border-custom px-4 py-3 text-xs focus:border-secondary focus:outline-none placeholder:text-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Message textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block font-display">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your fleet and what you're looking to solve..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-border-custom px-4 py-3 text-xs focus:border-secondary focus:outline-none placeholder:text-gray-400 font-medium resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-accent text-white px-6 py-3.5 text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 5. Footer (Dark Background) */}
      <footer className="bg-primary text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pb-12 border-b border-gray-800">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/brand-logo.png" alt="Fleet Management Logo" className="h-9 w-auto rounded-lg object-contain bg-white/10 p-0.5" />
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
                <span>+1 (800) FLEET-01</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 00-2.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
