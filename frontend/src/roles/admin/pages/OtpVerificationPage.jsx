import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import toast from "react-hot-toast";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Allow single digit
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus the next empty input, or the last one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP verified successfully!");
      // Navigate to reset password page or dashboard
      // navigate("/reset-password");
    } catch (err) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      backLabel="Back to Login"
      onBack={() => navigate("/login")}
    >
      {/* ── Heading ── */}
      <h2 className="text-center font-display text-2xl font-bold text-gray-900 mb-3">
        Verify OTP
      </h2>
      <p className="text-center text-sm text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
        We've sent a 6-digit verification code to your registered mobile number.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OTP Input Group */}
        <div>
          <div className="flex justify-center gap-2 sm:gap-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-11 h-12 sm:w-12 sm:h-12 text-center text-xl font-bold text-gray-800 bg-white border border-[#A14000] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A14000]/30 transition-all"
                required
              />
            ))}
          </div>
          {/* Timer */}
          <div className="text-center text-sm font-bold text-gray-700">
            00:29
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="w-full rounded-xl bg-[#A14000] text-white font-semibold text-sm py-3.5 hover:bg-[#7d3200] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 mt-6"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={() => toast.success("OTP resent successfully!")}
          className="text-[#A14000] hover:text-[#7d3200] transition-colors"
        >
          Resend
        </button>
      </div>
    </AuthLayout>
  );
}
