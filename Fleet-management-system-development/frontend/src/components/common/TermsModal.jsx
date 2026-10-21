import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function TermsModal({ isOpen, onClose }) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the Terms and Privacy Policy to proceed.");
      return;
    }
    localStorage.setItem("terms_accepted", "true");
    toast.success("Thank you! You have accepted the Terms and Privacy Policy.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] relative animate-scale-up">
        
        {/* Close button (top right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 text-gray-500 hover:text-black rounded-full transition-all border border-gray-100 hover:scale-105 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-[#0B1B3D] text-lg">Terms & Privacy Policy</h3>
            <p className="text-[11px] text-gray-400 font-semibold">Please read and accept the agreements below to continue.</p>
          </div>
        </div>

        {/* Scrollable agreements text */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-[#4B5563] space-y-5 leading-relaxed bg-[#FAFBFC]">
          
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-2">1. Terms of Service</h4>
            <p className="mb-2">
              Welcome to our Fleet Management Platform. By using this application or signing in, you agree to comply with and be bound by these Terms of Service. Please review them carefully.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">1.1 Authorized Use & Roles</h5>
            <p className="mb-2">
              This system is restricted to authorized fleet operators, dispatch managers, drivers, and administrators. Unauthorized access attempts, account sharing, or credentials tampering are strictly prohibited and may result in immediate suspension.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">1.2 Real-Time Tracking & Telematics Data</h5>
            <p className="mb-2">
              Our system tracks vehicle GPS locations, vehicle telemetry (speed, fuel levels, ignition state), trip diagnostics, and driver profiles in real-time. By logging into the platform, you acknowledge and consent to this operational logging.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">1.3 Limitation of Liability</h5>
            <p className="mb-2">
              We strive to achieve 99.8% uptime; however, we are not liable for operational delays, navigation issues, or server disruptions impacting live shipments or schedule dispatches.
            </p>
          </div>

          <div className="border-t border-gray-200/80 pt-4">
            <h4 className="font-display font-bold text-sm text-[#0B1B3D] mb-2">2. Privacy Policy</h4>
            <p className="mb-2">
              We respect your privacy and are committed to protecting the personal and telemetry data generated through your use of the Fleet Management platform.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">2.1 Information We Collect</h5>
            <p className="mb-2">
              We collect user information (names, emails, phones, encrypted passwords), driver licenses, route details, and ongoing diagnostics reports to guarantee security, safety, and business operations.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">2.2 Data Encryption & Storage</h5>
            <p className="mb-2">
              All data transmitted through the application is encrypted using TLS 1.3 protocols and stored using advanced secure standards. We never sell organizational or driver metrics to third parties.
            </p>
            <h5 className="font-bold text-[#0B1B3D] mt-3 mb-1">2.3 Cookies and Access Logs</h5>
            <p className="mb-2">
              We utilize persistent access tokens, local storage tokens, and session cookies solely to preserve user sessions, authenticate API requests, and audit security events.
            </p>
          </div>

        </div>

        {/* Modal Footer / Checkbox + Action */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 bg-white space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none py-1 text-xs font-semibold text-[#0B1B3D]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#A14000] focus:ring-[#A14000] cursor-pointer"
            />
            <span>I have read, understood, and accept the Terms of Service and Privacy Policy.</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#0B1B3D] font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreed}
              className="flex-1 py-3 bg-[#A14000] hover:bg-[#853500] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Accept & Continue
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
