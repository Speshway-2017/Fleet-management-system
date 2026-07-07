import { useState } from "react";
import { Link } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Security" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Profile
              </Link>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {isSaving ? "Saving..." : "Save Security Settings"}
            </button>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl">
            <div className="mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Security Settings</h3>
              <p className="text-[13px] text-slate-500 font-medium">Manage platform security policies</p>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 border-t border-slate-100">
              
              {/* Two-Factor Authentication */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Require 2FA for all admin accounts</p>
                </div>
                <button 
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${twoFactor ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Session Timeout */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Session Timeout</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Auto-logout inactive sessions</p>
                </div>
                <button 
                  onClick={() => setSessionTimeout(!sessionTimeout)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${sessionTimeout ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${sessionTimeout ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Max Login Attempts */}
              <div className="py-5 flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Max Login Attempts</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Lock account after failed attempts</p>
                </div>
              </div>

              {/* Password Policy */}
              <div className="py-5 flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Password Policy</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Minimum password requirements</p>
                </div>
              </div>

              {/* IP Allowlist */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">IP Allowlist</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Restrict access to specific IPs</p>
                </div>
                <button 
                  onClick={() => setIpAllowlist(!ipAllowlist)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${ipAllowlist ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${ipAllowlist ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
