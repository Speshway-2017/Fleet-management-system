import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const toggleCard = (cardId) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Security settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Security" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                General
              </Link>
              <Link to="/admin/settings/security" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm transition-colors truncate">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Profile
              </Link>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button onClick={() => { logout(); navigate('/login'); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 bg-white hover:bg-[#b45309]/10 border border-[#b45309]/30 text-[#b45309] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors text-center w-full sm:w-auto truncate">
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden min-[360px]:inline">Logout</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] sm:flex-none px-2 sm:px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait text-center w-full sm:w-auto truncate"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl">
            <div className="mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Security Settings</h3>
              <p className="text-[13px] text-slate-500 font-medium">Manage platform security policies</p>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 border-t border-slate-100">
              
              {/* Two-Factor Authentication */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('2fa')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Two-Factor Authentication</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Require 2FA for all admin accounts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTwoFactor(!twoFactor); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${twoFactor ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === '2fa' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === '2fa' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" defaultChecked />
                      <span className="text-[13px] text-slate-600 font-medium">Require for Super Admins</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Require for Fleet Managers</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('session')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Session Timeout</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Auto-logout inactive sessions</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSessionTimeout(!sessionTimeout); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${sessionTimeout ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${sessionTimeout ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'session' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'session' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Timeout Duration</label>
                    <select className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="240">4 Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Max Login Attempts */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('attempts')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Max Login Attempts</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Lock account after failed attempts</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'attempts' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'attempts' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Allowed Attempts</label>
                    <input type="number" defaultValue={5} min={1} max={10} className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all" />
                  </div>
                </div>
              </div>

              {/* Password Policy */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('password')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Password Policy</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Minimum password requirements</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'password' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'password' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" defaultChecked />
                      <span className="text-[13px] text-slate-600 font-medium">Require at least one uppercase letter</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" defaultChecked />
                      <span className="text-[13px] text-slate-600 font-medium">Require at least one number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" defaultChecked />
                      <span className="text-[13px] text-slate-600 font-medium">Require at least one special character</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* IP Allowlist */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('ip')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">IP Allowlist</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Restrict access to specific IPs</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIpAllowlist(!ipAllowlist); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${ipAllowlist ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${ipAllowlist ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'ip' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'ip' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Allowed IP Addresses</label>
                    <textarea 
                      placeholder="Enter IP addresses separated by commas (e.g. 192.168.1.1, 10.0.0.5)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all resize-none h-20"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
