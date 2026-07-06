import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Requirements logic
  const reqLength = form.password.length >= 8;
  const reqNumber = /\d/.test(form.password);
  const reqSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reqLength || !reqNumber || !reqSpecial) {
      toast.error("Please meet all password requirements.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordRule = ({ met, label }) => (
    <li className="flex items-center gap-2 text-xs text-gray-600">
      <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors border ${met ? "bg-green-600 border-green-600" : "border-gray-400 bg-transparent"}`}>
        {met && (
          <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={met ? "text-gray-800" : "text-gray-500"}>{label}</span>
    </li>
  );

  return (
    <AuthLayout
      backLabel="Back to Login"
      onBack={() => navigate("/login")}
    >
      {/* ── Heading ── */}
      <h2 className="text-center font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        Create New Password
      </h2>
      <p className="text-center text-xs text-gray-500 mb-8 px-2 leading-relaxed">
        Your new password must be different from your previous password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password Field */}
        <div>
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Confirm Password Field */}
        <div>
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#A14000] text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
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

        {/* Requirements Box */}
        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-700 mb-2">Password Requirements:</p>
          <ul className="space-y-1.5">
            <PasswordRule met={reqLength} label="Minimum 8 characters" />
            <PasswordRule met={reqNumber} label="One number" />
            <PasswordRule met={reqSpecial} label="One special character" />
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !reqLength || !reqNumber || !reqSpecial || !form.confirmPassword}
          className="w-full rounded-xl bg-[#A14000] text-white font-semibold text-sm py-3.5 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 mt-4"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs font-bold">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#A14000] hover:text-[#7d3200] transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}
