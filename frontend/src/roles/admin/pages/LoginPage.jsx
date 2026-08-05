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
  AlertCircle
} from "lucide-react";
import TermsModal from "@/components/common/TermsModal";

export default function LoginPage() {
  const { login, loading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const selectedPlanId = localStorage.getItem("selectedPlanId");
      const userRole = role;
      if (selectedPlanId && (userRole === "FLEET_MANAGER" || userRole === "manager")) {
        navigate("/manager/subscription", { state: { selectedPlanId }, replace: true });
      } else if (userRole === "SUPER_ADMIN" || userRole === "admin" || userRole === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "FLEET_MANAGER" || userRole === "manager") {
        navigate("/manager", { replace: true });
      } else if (userRole === "DRIVER" || userRole === "driver") {
        navigate("/driver/dashboard", { replace: true });
      } else {
        navigate("/manager", { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    setForm({ email: "", password: "" });
  }, []);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === "email") {
      setEmailError("");
    } else if (field === "password") {
      setPasswordError("");
    }
  };

  const validate = () => {
    let isValid = true;

    if (!form.email) {
      setEmailError("Email, Phone Number or Employee ID is required.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!form.password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const user = await login(form, rememberMe);
      toast.success(`Welcome back, ${user.name || "User"}!`);
      const selectedPlanId = localStorage.getItem("selectedPlanId");
      const userRole = user.role;
      if (selectedPlanId && (userRole === "FLEET_MANAGER" || userRole === "manager")) {
        navigate("/manager/subscription", { state: { selectedPlanId } });
      } else if (userRole === "SUPER_ADMIN" || userRole === "admin" || userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userRole === "FLEET_MANAGER" || userRole === "manager") {
        navigate("/manager");
      } else if (userRole === "DRIVER" || userRole === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/manager");
      }
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "No account found with this email" || message === "Email not found") {
        setEmailError("No account found with this email");
        setPasswordError("");
      } else if (message === "Incorrect password" || message === "Incorrect password. Please try again.") {
        setPasswordError("Incorrect password. Please try again.");
        setEmailError("");
      } else if (message === "Invalid credentials") {
        setEmailError("Invalid credentials");
        setPasswordError("Invalid credentials");
      } else {
        const displayMsg = message || "An error occurred. Please try again.";
        setEmailError(displayMsg);
        setPasswordError("");
      }

      setForm(prev => ({ ...prev, password: "" }));
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
    }
  };

  const focusLoginCard = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  return (
    <>
      {/* Premium Glassmorphism Card */}
      <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-[20px] p-6 sm:p-10 shadow-2xl relative z-10 my-auto">

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

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

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
                autoComplete="off"
                ref={emailInputRef}
                placeholder="name@organization.com"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-11 py-3 rounded-xl border text-xs text-[#1E293B] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${emailError
                    ? 'focus:ring-red-500/20 pr-10'
                    : 'pr-4 focus:ring-[#A14000]/15 focus:border-[#A14000]'
                  }`}
                style={{
                  borderColor: emailError ? '#DC2626' : '#E5E7EB',
                }}
              />
              {emailError && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#DC2626] pointer-events-none">
                  <AlertCircle className="h-4.5 w-4.5" />
                </span>
              )}
            </div>
            {emailError && (
              <p className="text-xs mt-1" style={{ color: '#DC2626', fontSize: '12px' }}>
                {emailError}
              </p>
            )}
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
                autoComplete="new-password"
                ref={passwordInputRef}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-11 py-3 rounded-xl border text-xs text-[#1E293B] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${passwordError
                    ? 'pr-16 focus:ring-red-500/20'
                    : 'pr-11 focus:ring-[#A14000]/15 focus:border-[#A14000]'
                  }`}
                style={{
                  borderColor: passwordError ? '#DC2626' : '#E5E7EB',
                }}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {passwordError && (
                  <AlertCircle className="h-4.5 w-4.5 text-[#DC2626] pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-[#0F2345] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
            {passwordError && (
              <p className="text-xs mt-1" style={{ color: '#DC2626', fontSize: '12px' }}>
                {passwordError}
              </p>
            )}
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

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </>
  );
}
