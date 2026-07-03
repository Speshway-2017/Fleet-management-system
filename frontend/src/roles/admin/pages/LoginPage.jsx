import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name || "User"}!`);
      navigate(user.role === "admin" ? "/admin" : "/manager");
    } catch (err) {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFBFC] font-sans">
      {/* Visual Side (Left) */}
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

          <h2 className="text-center font-display text-2xl font-bold text-gray-800 mb-2">
            Welcome back
          </h2>
          <p className="text-center text-xs text-gray-500 mb-8 font-medium">
            Please enter your credentials to access the console.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block"
                >
                  PASSWORD
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.error("Password reset is not configured for this demo.");
                  }}
                  className="text-[9px] font-bold text-[#A14000] hover:underline uppercase tracking-wide transition-all"
                >
                  FORGOT PASSWORD?
                </a>
              </div>
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 accent-[#A14000] text-[#A14000] border-gray-300 rounded focus:ring-[#A14000]/20 cursor-pointer"
                defaultChecked
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs font-semibold text-gray-500 select-none cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#A14000] text-white font-bold text-sm py-3 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Logging in..." : (
                <>
                  Login to Dashboard
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* SignUp text */}
          <div className="text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className="font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              SignUp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
