import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    confirmPassword: "",
  });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.companyName || !form.confirmPassword) {
      toast.error("Please fill in all details.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    toast.success("Account created successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFBFC] font-sans">
      {/* Visual Side (Left) - Matching LoginPage Exactly */}
      <div className="w-full lg:w-[45%] min-h-[450px] lg:min-h-screen relative overflow-hidden flex flex-col justify-start p-6 lg:p-10 lg:py-12 text-gray-800">
        {/* Background Image — full truck visible */}
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat bg-bottom z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
          }}
        />

        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-black/20 z-10 pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center h-10 w-10">
            <img
              src="/brand-logo.png"
              alt="Fleet Management Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-display font-bold text-gray-800 text-base tracking-wide">
            Fleet Management
          </span>
        </div>

        {/* Text Block and Stats */}
        <div className="relative z-20 mt-2 lg:mt-3.5 space-y-4 lg:space-y-5">
          <div className="space-y-1.5 lg:space-y-2">
            <h1 className="font-display text-xl lg:text-[26px] font-extrabold text-[#A14000] leading-[1.2] tracking-tight">
              Fleet Management <br />
              System
            </h1>
            <p className="text-[12px] lg:text-[13px] text-gray-700 font-semibold max-w-[280px] leading-relaxed">
              Manage your fleet operations efficiently with real-time telematics, driver performance tracking, and automated maintenance scheduling.
            </p>
          </div>

          {/* Stats Section */}
          <div className="flex gap-8 lg:gap-10 pt-1">
            <div className="space-y-0.5">
              <div className="text-xl lg:text-2xl font-black text-[#A14000] tracking-tight">
                99.9%
              </div>
              <div className="text-[8.5px] font-extrabold text-[#A14000] tracking-wider uppercase">
                UPTIME
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl lg:text-2xl font-black text-[#A14000] tracking-tight">
                15k+
              </div>
              <div className="text-[8.5px] font-extrabold text-[#A14000] tracking-wider uppercase">
                VEHICLES
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 lg:p-10 bg-[#FAFBFC] min-h-screen relative">
        
        {/* Back Link */}
        <div className="w-full max-w-md mb-4 flex justify-start">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="flex items-center gap-2 text-xs font-bold text-[#A14000] hover:text-[#7d3200] transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home page
          </a>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-md bg-white border border-[#A14000]/70 rounded-2xl p-8 lg:p-10 shadow-md relative z-10">
          
          {/* Logo centered */}
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center justify-center h-14 w-14">
              <img
                src="/brand-logo.png"
                alt="Fleet Management Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center gap-2.5 mb-6 select-none">
            {/* Step 1 Indicator */}
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-[#A14000] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                1
              </div>
              <span className="text-[11px] font-extrabold text-gray-700 tracking-wide">
                Account Info
              </span>
            </div>

            {/* Separator Chevron */}
            <span className="text-gray-300 text-xs font-semibold">&gt;</span>

            {/* Step 2 Indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  step === 2
                    ? "bg-[#A14000] text-white shadow-sm"
                    : "bg-[#E5E7EB] text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-[11px] tracking-wide transition-all ${
                  step === 2
                    ? "font-extrabold text-gray-700"
                    : "font-bold text-gray-400"
                }`}
              >
                Set Password
              </span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-800 mb-1">
            {step === 1 ? "Create Your Account" : "Set Details"}
          </h2>
          <p className="text-xs text-gray-400 mb-6 font-medium">
            {step === 1 ? "Start your 14-day free trial." : "Complete your profile credentials."}
          </p>

          {step === 1 ? (
            /* Step 1: Account Info Form */
            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@organization.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit / Continue Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-[#A14000] text-white font-bold text-sm py-3 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                Continue
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          ) : (
            /* Step 2: Set Password & Details Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  FULL NAME
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="companyName"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  COMPANY NAME
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="FleetCorp Enterprises"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-[#A14000] text-white font-bold text-sm rounded-lg hover:bg-[#7d3200] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Create Account
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* Sign In text */}
          <div className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="font-bold text-[#A14000] hover:text-[#7d3200] transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
