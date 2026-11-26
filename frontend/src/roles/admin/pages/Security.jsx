import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import { useAuth } from "@/context/AuthContext";
import ScrollHighlight from "@/components/originkit/ui/scroll-text-highlight";

export default function Security() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  return (
    <div className="bg-bg-page flex-1 flex flex-col font-sans">

      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 border-b border-border-custom">
        <AnimeScrollReveal direction="top" className="max-w-[1550px] mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-semibold uppercase tracking-wider">
            Built with Security & Reliability
          </div>
          <ScrollHighlight
            text="Your Data. Your Trust. Our Priority."
            font={{ fontSize: "2.25rem", fontWeight: 900, fontFamily: "inherit" }}
            dimColor="rgba(11, 27, 61, 0.3)"
            highlightColor="#0B1B3D"
            containerStyle={{ textAlign: "center" }}
          />
          <p className="text-base sm:text-lg text-body max-w-2xl mx-auto leading-relaxed">
            We employ bank-grade security protocols, advanced encryption, and robust access controls to keep your enterprise fleet operations secure and compliant at all times.
          </p>
        </AnimeScrollReveal>
      </section>

      {/* Security Features Grid */}
      <section className="py-12 bg-bg-page px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">JWT Authentication</h3>
              <p className="text-xs text-body leading-relaxed">
                Secure login and session management using industry-standard JSON Web Tokens, protecting your system from unauthorized access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">Role-Based Access Control</h3>
              <p className="text-xs text-body leading-relaxed">
                Granular access control settings. Grant administrative, manager, or driver roles with tailored system permissions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">IDOR Protection</h3>
              <p className="text-xs text-body leading-relaxed">
                Built-in defenses against Insecure Direct Object Reference vulnerabilities, ensuring users can only access their authorized data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">API Rate Limiting</h3>
              <p className="text-xs text-body leading-relaxed">
                Protecting our API endpoints from denial-of-service attempts and resource misuse to guarantee high system availability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">Secure File Uploads</h3>
              <p className="text-xs text-body leading-relaxed">
                Strong validation of all user uploads. Scans document extensions, sizes, and content types to prevent malicious uploads.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">Encrypted Communication</h3>
              <p className="text-xs text-body leading-relaxed">
                All traffic is encrypted in transit using industry-standard TLS protocols, securing your data between client and server.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-custom card-dark-fill-bl space-y-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shadow-xs anime-icon-hover">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#0B1B3D]">Audit Logging</h3>
              <p className="text-xs text-body leading-relaxed">
                Detailed audit logs document critical system events, actions, and user sessions for operational transparency and compliance audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-page py-16 px-4 sm:px-6 md:px-8">
        <AnimeScrollReveal className="max-w-6xl mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
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
        </AnimeScrollReveal>
      </section>
    </div>
  );
}
