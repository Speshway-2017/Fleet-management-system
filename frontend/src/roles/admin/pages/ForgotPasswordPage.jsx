import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import toast from "react-hot-toast";

import { authApi } from "@/api/authApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact) {
      setError("Please enter your email.");
      return;
    }
    const isEmail = contact.includes("@");
    if (!isEmail || !/^\S+@\S+\.\S+$/.test(contact)) {
      setError("Invalid email format");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(contact);
      toast.success("OTP generated! Check the backend console.");
      navigate("/otp-verification", { state: { email: contact } });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      backLabel="Back to Home page"
      onBack={() => navigate("/")}
    >
      {/* ── Heading ── */}
      <h2 className="text-center font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        Forgot Password
      </h2>
      <p className="text-center text-xs text-gray-400 mb-8 font-medium px-4">
        Enter your registered email address or mobile number to receive a verification code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email/Phone Field */}
        <div>
          <label htmlFor="contact" className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
            Email Address/Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="contact"
              type="text"
              placeholder="name@organization.com"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setError(""); }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-[#A14000] focus:ring-[#A14000]/20'}`}
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#A14000] text-white font-bold text-sm py-3 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Sending..." : (
            <>
              Send OTP
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-4 text-center text-xs font-medium text-gray-500">
        Remember your password?{" "}
        <button
          onClick={() => navigate("/login")}
          className="font-bold text-[#A14000] hover:text-[#7d3200] transition-colors"
        >
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}
