import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export default function LandingHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { platformSettings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavLinkClass = ({ isActive }) => {
    return `block w-full text-left py-2 font-semibold text-sm transition-colors ${
      isActive ? "text-[#A14000]" : "text-body hover:text-[#A14000]"
    }`;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 md:px-8 h-20 flex items-center sticky top-0 z-50 w-full transition-all duration-300 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1550px] mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3 group">
            <img src={platformSettings?.logoUrl || "/logo.png"} alt="Fleet Management Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="font-display font-black text-[#0D1B2A] text-lg tracking-wide">
              {platformSettings?.platformName || "Fleet Management"}
            </span>
          </NavLink>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { to: "/", label: "Home", end: true },
            { to: "/about", label: "About" },
            { to: "/features", label: "Features" },
            { to: "/performance", label: "Performance" },
            { to: "/security", label: "Security" },
            { to: "/pricing", label: "Pricing" },
            { to: "/blogs", label: "Blogs" },
            { to: "/contact", label: "Contact Us" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `cube-roll-wrap font-bold text-xs uppercase tracking-wider py-1.5 transition-colors duration-200 cursor-pointer ${
                  isActive ? "text-[#A14000]" : "text-body hover:text-[#A14000]"
                }`
              }
            >
              <span className="cube-roll">
                <span className="cube-roll-front">{item.label}</span>
                <span className="cube-roll-bottom">{item.label}</span>
              </span>
            </NavLink>
          ))}
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
                className="px-4 py-2 rounded-xl bg-[#A14000]/10 text-[#A14000] font-semibold text-xs transition-all hover:bg-[#A14000]/20 active:scale-[0.98] cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-[#A14000] hover:bg-[#853400] px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
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
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 md:hidden bg-white border-b border-border-custom px-6 py-4 space-y-3 shadow-lg z-20">
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
          <NavLink to="/pricing" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Pricing
          </NavLink>
          <NavLink to="/blogs" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Blogs
          </NavLink>
          <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            Contact Us
          </NavLink>
        </div>
      )}
    </header>
  );
}

