import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";

// ── Password eye toggle ──────────────────────────────────────────────────────
function EyeIcon({ visible }) {
  return visible ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ── Password requirement row ────────────────────────────────────────────────
function PasswordRule({ met, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${met ? "bg-green-500" : "bg-gray-300"}`}>
        {met && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs ${met ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

// ── Stepper for Step 1 → only shows step 1 active ──────────────────────────
function StepperStep1() {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-5 sm:mb-7">
      {/* Step 1 — active */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#A14000] text-white flex items-center justify-center text-xs sm:text-sm font-black shadow-sm">
          1
        </div>
        <span className="text-[9px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-tight sm:tracking-wide">Account Info</span>
      </div>

      {/* Connector */}
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Step 2 — inactive */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs sm:text-sm font-black shadow-sm">
          2
        </div>
        <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-wide">Set Password</span>
      </div>
    </div>
  );
}

// ── Stepper for Step 2 → step 1 complete, step 2 active ────────────────────
function StepperStep2() {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-5 sm:mb-7">
      {/* Step 1 — completed */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#A14000] text-white flex items-center justify-center shadow-sm">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-tight sm:tracking-wide">Account Info</span>
      </div>

      {/* Connector */}
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Step 2 — active */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#A14000] text-white flex items-center justify-center text-xs sm:text-sm font-black shadow-sm">
          2
        </div>
        <span className="text-[9px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-tight sm:tracking-wide">Set Password</span>
      </div>
    </div>
  );
}

// ── Main SignupPage ──────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [form, setForm] = useState({
    email: "", fullName: "", companyName: "", password: "", confirmPassword: "",
  });

  const passwordRules = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number:    /[0-9]/.test(form.password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName || !form.companyName) {
      toast.error("Please fill in all fields."); return;
    }
    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address."); return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields."); return;
    }
    if (!Object.values(passwordRules).every(Boolean)) {
      toast.error("Password does not meet all requirements."); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (!agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy."); return;
    }
    toast.success("Account created successfully! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1500);
  };

  const backProps = step === 1
    ? { backLabel: "Back to Home page", onBack: () => navigate("/") }
    : { backLabel: "Back to Account Info", onBack: () => setStep(1) };

  return (
    <AuthLayout {...backProps}>

      {/* ── STEP 1: Account Info ── */}
      {step === 1 && (
        <>
          <StepperStep1 />

          <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
          <p className="text-xs text-gray-400 mb-6 font-medium">Start your 14-day free trial.</p>

          <form onSubmit={handleNextStep} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-gray-700 block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input id="email" type="email" placeholder="name@organization.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  required />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-bold text-gray-700 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input id="fullName" type="text" placeholder="John Doe"
                  value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  required />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="text-xs font-bold text-gray-700 block">Company Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input id="companyName" type="text" placeholder="FleetCorp Enterprises"
                  value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  required />
              </div>
            </div>

            <button type="submit"
              className="w-full rounded-lg bg-[#A14000] text-white font-bold text-sm py-3 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
              Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </>
      )}

      {/* ── STEP 2: Set Password ── */}
      {step === 2 && (
        <>
          <StepperStep2 />

          <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
          <p className="text-sm text-gray-400 font-medium mb-6">
            Welcome, {form.fullName || "😊"}! Choose a strong password to secure your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-700 block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700 block">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                  value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                  required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-gray-700">Password requirements:</p>
              <div className="space-y-1.5">
                <PasswordRule met={passwordRules.length}    label="At least 8 characters" />
                <PasswordRule met={passwordRules.uppercase} label="At least one uppercase letter" />
                <PasswordRule met={passwordRules.number}    label="At least one number" />
                <PasswordRule met={passwordRules.special}   label="At least one special character" />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <input id="terms" type="checkbox" checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#A14000] border-[#A14000] rounded cursor-pointer" />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[#A14000] font-semibold hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[#A14000] font-semibold hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button type="submit"
              className="w-full rounded-lg bg-[#A14000] text-white font-bold text-sm py-3 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Create Account
            </button>
          </form>
        </>
      )}

      {/* Footer */}
      <div className="mt-6 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}
          className="font-bold text-[#A14000] hover:text-[#7d3200] transition-colors">
          Sign in
        </button>
      </div>
    </AuthLayout>
  );
}
