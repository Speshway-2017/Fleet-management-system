import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ArrowLeft, Shield, Smartphone, QrCode } from "lucide-react";
import toast from "react-hot-toast";

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleToggle2FA = () => {
    if (isEnabled) {
      setIsEnabled(false);
      toast.success("Two-Factor Authentication disabled.");
    } else {
      toast.success("Authenticator configuration requested!");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Please enter a valid code!");
      return;
    }
    setIsEnabled(true);
    setVerificationCode("");
    toast.success("Two-Factor Authentication enabled successfully!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800 max-w-2xl">
      <Breadcrumb />
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Two-Factor Authentication
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Protect your fleet manager account with an extra verification layer.
          </p>
        </div>
      </div>

      {/* ── SETTINGS CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-orange-50/30 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#A14000]" />
          <h3 className="font-poppins font-black text-xs text-[#A14000] uppercase tracking-wider">
            2FA Security Preferences
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Indicators */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800">Authenticator App Verification</p>
              <p className="text-xs text-gray-400 font-medium">Use an app like Google Authenticator or Authy to generate codes.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${isEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${isEnabled ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-[#A14000] hover:bg-[#853400] text-white'}`}
              >
                {isEnabled ? "Disable" : "Configure"}
              </button>
            </div>
          </div>

          {/* Configuration Form if not enabled */}
          {!isEnabled && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-150 grid grid-cols-1 md:grid-cols-12 gap-5 animate-fade-in">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl">
                {/* Mock QR Code */}
                <QrCode className="w-24 h-24 text-gray-800" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Scan QR Code</span>
              </div>
              
              <form onSubmit={handleVerify} className="md:col-span-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-850">Setup Authenticator App:</h4>
                  <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside font-medium leading-relaxed">
                    <li>Scan the QR code with your mobile authenticator.</li>
                    <li>Enter the 6-digit numeric token generated below.</li>
                  </ol>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Verification Token</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#A14000] bg-white text-gray-800"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-fit px-4 py-2 bg-[#A14000] hover:bg-[#853400] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
                >
                  Verify and Activate
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
