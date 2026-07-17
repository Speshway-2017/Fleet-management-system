import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // Settings states
  const [twoFactorAdmin, setTwoFactorAdmin] = useState(true);
  const [twoFactorManager, setTwoFactorManager] = useState(false);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [ipAllowlistEnabled, setIpAllowlistEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState("");

  const fetchSecuritySettings = async () => {
    try {
      const response = await adminApi.getSecuritySettings();
      const settings = response.data?.data || response.data;
      if (settings) {
        setTwoFactorAdmin(settings.twoFactorAdmin ?? true);
        setTwoFactorManager(settings.twoFactorManager ?? false);
        setSessionTimeout(settings.sessionTimeout || 60);
        setMaxLoginAttempts(settings.maxLoginAttempts || 5);
        
        if (settings.passwordPolicy) {
          setRequireUppercase(settings.passwordPolicy.requireUppercase ?? true);
          setRequireNumber(settings.passwordPolicy.requireNumber ?? true);
          setRequireSpecial(settings.passwordPolicy.requireSpecial ?? true);
        }
        
        setIpAllowlistEnabled(settings.ipAllowlistEnabled ?? false);
        setAllowedIps(settings.allowedIps || "");
      }
    } catch (error) {
      toast.error("Failed to fetch security settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const toggleCard = (cardId) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        twoFactorAdmin,
        twoFactorManager,
        sessionTimeout: Number(sessionTimeout),
        maxLoginAttempts: Number(maxLoginAttempts),
        passwordPolicy: {
          requireUppercase,
          requireNumber,
          requireSpecial
        },
        ipAllowlistEnabled,
        allowedIps
      };
      
      await adminApi.updateSecuritySettings(payload);
      toast.success("Security settings saved successfully!");
      await fetchSecuritySettings();
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Security" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/reviews" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Reviews
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}
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
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setTwoFactorAdmin(!twoFactorAdmin); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 cursor-pointer ${twoFactorAdmin || twoFactorManager ? 'bg-green-500' : 'bg-slate-200'}`}
                      style={{ minWidth: '44px', height: '24px', padding: 0, margin: 0 }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${twoFactorAdmin || twoFactorManager ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ minWidth: '20px', height: '20px' }} />
                    </div>
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === '2fa' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={twoFactorAdmin} onChange={(e) => setTwoFactorAdmin(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Require for Super Admins</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={twoFactorManager} onChange={(e) => setTwoFactorManager(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
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
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setSessionTimeoutEnabled(!sessionTimeoutEnabled); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 cursor-pointer ${sessionTimeoutEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                      style={{ minWidth: '44px', height: '24px', padding: 0, margin: 0 }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${sessionTimeoutEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ minWidth: '20px', height: '20px' }} />
                    </div>
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'session' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Timeout Duration</label>
                    <select 
                      value={sessionTimeout} 
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    >
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
                    <input 
                      type="number" 
                      value={maxLoginAttempts} 
                      onChange={(e) => setMaxLoginAttempts(e.target.value)}
                      min={1} 
                      max={10} 
                      className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all" 
                    />
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
                      <input type="checkbox" checked={requireUppercase} onChange={(e) => setRequireUppercase(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Require at least one uppercase letter</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={requireNumber} onChange={(e) => setRequireNumber(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Require at least one number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={requireSpecial} onChange={(e) => setRequireSpecial(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
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
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setIpAllowlistEnabled(!ipAllowlistEnabled); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 cursor-pointer ${ipAllowlistEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                      style={{ minWidth: '44px', height: '24px', padding: 0, margin: 0 }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${ipAllowlistEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ minWidth: '20px', height: '20px' }} />
                    </div>
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'ip' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Allowed IP Addresses</label>
                    <textarea 
                      value={allowedIps}
                      onChange={(e) => setAllowedIps(e.target.value)}
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
