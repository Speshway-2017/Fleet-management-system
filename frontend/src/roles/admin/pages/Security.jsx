import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Security() {
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

      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-24 border-b border-border-custom">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-semibold uppercase tracking-wider">
            Built with Security & Reliability
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] tracking-tight">
            Your Data. Your Trust. <span className="text-[#A14000]">Our Priority.</span>
          </h2>
          <p className="text-base sm:text-lg text-body max-w-2xl mx-auto leading-relaxed">
            We employ bank-grade security protocols, advanced encryption, and robust access controls to keep your enterprise fleet operations secure and compliant at all times.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-16 bg-bg-page px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">JWT Authentication</h3>
              <p className="text-xs text-body leading-relaxed">
                Secure login and session management using industry-standard JSON Web Tokens, protecting your system from unauthorized access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">Role-Based Access Control</h3>
              <p className="text-xs text-body leading-relaxed">
                Granular access control settings. Grant administrative, manager, or driver roles with tailored system permissions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">IDOR Protection</h3>
              <p className="text-xs text-body leading-relaxed">
                Built-in defenses against Insecure Direct Object Reference vulnerabilities, ensuring users can only access their authorized data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">API Rate Limiting</h3>
              <p className="text-xs text-body leading-relaxed">
                Protecting our API endpoints from denial-of-service attempts and resource misuse to guarantee high system availability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">Secure File Uploads</h3>
              <p className="text-xs text-body leading-relaxed">
                Strong validation of all user uploads. Scans document extensions, sizes, and content types to prevent malicious uploads.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">Encrypted Communication</h3>
              <p className="text-xs text-body leading-relaxed">
                All traffic is encrypted in transit using industry-standard TLS protocols, securing your data between client and server.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-[#0B1B3D]">Audit Logging</h3>
              <p className="text-xs text-body leading-relaxed">
                Detailed audit logs document critical system events, actions, and user sessions for operational transparency and compliance audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-page py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/50 via-[#0B1B3D]/80 to-[#0B1B3D] pointer-events-none" />
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

      {/* 5. Footer (Dark Background) */}
      <footer className="bg-[#0B1B3D] text-gray-300 pt-12 sm:pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 pb-12 border-b border-gray-800">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fleet Management Logo" className="h-9 w-auto object-contain bg-white rounded-lg p-1" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.
            </p>
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

          <div className="space-y-4">
            <h5 className="font-display font-semibold text-white tracking-wider text-xs uppercase">Quick Links</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><NavLink to="/" className="hover:text-white transition-colors">Home</NavLink></li>
              <li><NavLink to="/performance" className="hover:text-white transition-colors">Performance</NavLink></li>
              <li><NavLink to="/security" className="hover:text-white transition-colors">Security</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-white transition-colors">Contact Us</NavLink></li>
            </ul>
          </div>

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
