import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LandingHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavLinkClass = ({ isActive }) => {
    return `block w-full text-left py-2 font-semibold text-sm transition-colors ${
      isActive ? "text-[#A14000]" : "text-body hover:text-[#A14000]"
    }`;
  };

  return (
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
        <NavLink to="/blogs" className={({ isActive }) => `text-sm font-semibold py-2 transition-all duration-200 ${isActive ? "text-[#A14000] border-b-2 border-[#A14000]" : "text-body hover:text-[#A14000]"}`}>
          Blogs
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
