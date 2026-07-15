import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Zap
} from "lucide-react";
import TermsModal from "@/components/common/TermsModal";

export default function LoginPage() {
  const { login, loading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loginError, setLoginError] = useState(null);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === "SUPER_ADMIN" || role === "admin" ? "/admin/dashboard" : "/manager", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    if (loginError) {
      setLoginError(null);
    }
    if (isPasswordError) {
      setIsPasswordError(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email) && form.email !== "admin@123") newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsPasswordError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!validate()) return;

    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name || "User"}!`);
      navigate(user.role === "SUPER_ADMIN" || user.role === "admin" ? "/admin/dashboard" : "/manager");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const displayMsg = backendMessage || "Invalid email or password.";
      
      setLoginError(displayMsg);
      setIsPasswordError(true);
      setForm(prev => ({ ...prev, password: "" }));
      
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);

      timeoutRef.current = setTimeout(() => {
        setLoginError(null);
        setIsPasswordError(false);
      }, 5000);
    }
  };

  const focusLoginCard = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-sans text-[#1E293B] relative overflow-hidden">
      
      {/* ── LEFT PANEL (55% Width) ── */}
      <div 
        className="w-full lg:w-[55%] flex flex-col justify-between p-8 lg:p-14 relative overflow-hidden bg-cover bg-center min-h-[600px] lg:min-h-screen shrink-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      >
        {/* Soft dark overlay for text readability while maintaining high image clarity */}
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none z-0" />
        
        {/* Top Header: Logo + Title */}
        <div className="relative z-10">
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Fleet Management Logo" className="h-10 w-auto object-contain bg-white/95 rounded-xl p-1 shadow-sm" />
            <span className="font-display font-black text-white text-lg tracking-wide">
              Fleet Management
            </span>
          </NavLink>
        </div>

        {/* Middle Hero details */}
        <div className="relative z-10 space-y-7 max-w-xl my-auto py-12">
          
          <h1 className="font-display font-black text-white text-3xl sm:text-4xl md:text-5xl leading-[1.15] tracking-tight">
            Fleet Management <br />
            <span className="text-[#A14000]">System</span>
          </h1>

          <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-lg">
            Manage fleets, drivers, vehicles, centralized dashboard and operations from one intelligent platform. 
            Improve operational efficiency, monitor vehicle health in real time, reduce operational costs, 
            and secure your logistics operations with enterprise-grade technology.
          </p>

          {/* Features rows */}
          <div className="space-y-4 pt-4">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <span className="text-lg">🚛</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Real-Time Fleet Tracking</h4>
                <p className="text-[11px] text-slate-300 font-medium">Monitor vehicles live using GPS and telematics.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Enterprise Security</h4>
                <p className="text-[11px] text-slate-300 font-medium">Role-based authentication with secure access.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Smart Analytics</h4>
                <p className="text-[11px] text-slate-300 font-medium">Generate reports and optimize operational performance.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/60 shadow-sm flex items-center justify-center shrink-0 text-[#A14000]">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-white">Automated Operations</h4>
                <p className="text-[11px] text-slate-300 font-medium">Reduce manual work through workflow automation.</p>
              </div>
            </div>

          </div>

          {/* Left panel CTA buttons: Login button removed as requested */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 rounded-xl bg-white/80 border border-gray-300 hover:bg-white text-[#1E293B] font-bold text-xs shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>

        </div>

        {/* Bottom stats bar: Dark glassmorphic stats bar with four metrics */}
        <div className="relative z-10 w-full mt-auto pt-6 border-t border-gray-300/30">
          <div className="bg-[#0F2345]/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-white shadow-xl">
            
            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl font-black text-[#A14000] tracking-tight leading-none">500+</div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">Vehicles Managed</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl font-black text-[#A14000] tracking-tight leading-none">250+</div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">Enterprise Clients</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl font-black text-[#A14000] tracking-tight leading-none">1.2M+</div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">KM Tracked</p>
            </div>

            <div className="space-y-1 text-center md:text-left">
              <div className="text-2xl font-black text-[#A14000] tracking-tight leading-none">99.9%</div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">Platform Uptime</p>
            </div>

          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL (45% Width) ── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 md:p-16 bg-[#F8FAFC] min-h-screen">
        
        {/* Premium Glassmorphism Card */}
        <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-[20px] p-6 sm:p-10 shadow-2xl relative z-10 lg:-translate-y-14">
          
          {/* Back to Home Navigation Link */}
          <div className="mb-6">
            <NavLink
              to="/"
              className="group inline-flex items-center gap-2 px-4 py-1.5 text-[15px] md:text-[16px] font-display font-medium text-[#475569] hover:text-[#A14000] hover:bg-[#A14000]/5 rounded-full transition-all duration-[250ms] ease-in-out cursor-pointer -ml-4"
            >
              <span className="inline-block transform group-hover:-translate-x-1.5 transition-transform duration-[250ms] ease-in-out text-lg">
                ←
              </span>
              <span>Back to Home</span>
            </NavLink>
          </div>



          {/* Welcome heading */}
          <div className="flex flex-col items-start justify-start mb-8">
            <h2 className="font-display text-2xl font-black text-[#0F2345] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-[#1E293B]/70 mt-1 font-semibold">
              Access your Fleet Management Dashboard securely.
            </p>
          </div>

          {/* Error alert component */}
          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-sm shrink-0">❌</span>
              <div className="flex-1 font-medium leading-relaxed">
                {loginError}
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setLoginError(null);
                  setIsPasswordError(false);
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                }}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-[#0F2345] block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="email" 
                  type="email" 
                  ref={emailInputRef}
                  placeholder="name@organization.com"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-xs text-[#1E293B] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-[#A14000]/15 focus:border-[#A14000]'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-[#0F2345] block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  ref={passwordInputRef}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border text-xs text-[#1E293B] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.password || isPasswordError
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-[#A14000]/15 focus:border-[#A14000]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F2345] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#A14000] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs font-bold text-gray-500 select-none cursor-pointer">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-bold text-[#A14000] hover:text-[#853500] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Large Accent Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#A14000] hover:bg-[#853500] text-white font-bold text-xs py-3.5 shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying Credentials..." : (
                <>
                  Secure Login
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            {/* Secondary Outline button: Continue with Microsoft */}
            <button
              type="button"
              onClick={() => toast.success("Redirecting to Microsoft identity provider...")}
              className="w-full rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#1E293B] font-bold text-xs py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 23 23" fill="none">
                <path d="M0 0h11v11H0z" fill="#F25022" />
                <path d="M12 0h11v11H12z" fill="#7FBA00" />
                <path d="M0 12h11v11H0z" fill="#00A4EF" />
                <path d="M12 12h11v11H12z" fill="#FFB900" />
              </svg>
              Continue with Microsoft
            </button>

          </form>

          {/* Footer inside card */}
          <div className="mt-8 text-center text-[10px] text-gray-400 font-semibold leading-relaxed">
            By logging in, you agree to our <br />
            <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-[#A14000] hover:underline">Terms of Service</a> & <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-[#A14000] hover:underline">Privacy Policy</a>
          </div>

        </div>

      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
