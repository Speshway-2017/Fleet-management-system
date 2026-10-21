import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { securitySettingsSchema, isValidIpv4, validateField, validateForm } from "@/validations";

export default function SecuritySettings() {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // Settings states
  const [twoFactorAdmin, setTwoFactorAdmin] = useState(true);
  const [twoFactorManager, setTwoFactorManager] = useState(false);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [attemptsError, setAttemptsError] = useState("");
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [ipAllowlistEnabled, setIpAllowlistEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState("");
  const [ipError, setIpError] = useState("");

  const handleAttemptsKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setAttemptsError("Allowed attempts must contain numbers only (letters are not allowed).");
    } else {
      if (attemptsError?.includes("must contain numbers only")) {
        setAttemptsError("");
      }
    }
  };

  const handleAttemptsChange = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 2);
    setMaxLoginAttempts(clean);
    
    if (value !== clean && value.length > 0) {
      setAttemptsError("Allowed attempts must contain numbers only (letters are not allowed).");
      return;
    }

    if (!clean) {
      setAttemptsError("Allowed attempts is required.");
      return;
    }

    const num = Number(clean);
    if (num < 1 || num > 10) {
      setAttemptsError("Allowed attempts must be between 1 and 10.");
      return;
    }

    setAttemptsError("");
  };

  const handleAttemptsBlur = () => {
    if (!maxLoginAttempts || String(maxLoginAttempts).trim() === "") {
      setAttemptsError("Allowed attempts is required.");
      return;
    }
    const num = Number(maxLoginAttempts);
    if (num < 1 || num > 10) {
      setAttemptsError("Allowed attempts must be between 1 and 10.");
      return;
    }
    setAttemptsError("");
  };

  const validateIps = (value) => {
    if (!value || !value.trim()) {
      setIpError("");
      return true;
    }
    if (value.length > 500) {
      setIpError("Allowed IP addresses must not exceed 500 characters.");
      return false;
    }
    const ips = value.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (ips.length === 0) {
      setIpError("");
      return true;
    }
    const allValid = ips.every((ip) => isValidIpv4(ip));
    if (!allValid) {
      setIpError("Invalid IP address format. Please enter valid IPv4 addresses (e.g. 192.168.1.1).");
      return false;
    }
    setIpError("");
    return true;
  };

  const fetchSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getSecuritySettings();
      const settings = response.data?.data || response.data;
      if (settings) {
        setTwoFactorAdmin(settings.twoFactorAdmin ?? true);
        setTwoFactorManager(settings.twoFactorManager ?? false);
        setSessionTimeout(settings.sessionTimeout || 60);
        setMaxLoginAttempts(settings.maxLoginAttempts ?? 5);
        
        if (settings.passwordPolicy) {
          setRequireUppercase(settings.passwordPolicy.requireUppercase ?? true);
          setRequireNumber(settings.passwordPolicy.requireNumber ?? true);
          setRequireSpecial(settings.passwordPolicy.requireSpecial ?? true);
        }
        
        setIpAllowlistEnabled(settings.ipAllowlistEnabled ?? false);
        const ips = settings.allowedIps || "";
        setAllowedIps(ips);
        validateIps(ips);
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
    const isIpValid = validateIps(allowedIps);
    if (!isIpValid) {
      toast.error(ipError || "Invalid IP address format.");
      return;
    }

    if (!maxLoginAttempts || String(maxLoginAttempts).trim() === "") {
      setAttemptsError("Allowed attempts is required.");
      toast.error("Allowed attempts is required.");
      return;
    }

    const numAttempts = Number(maxLoginAttempts);
    if (isNaN(numAttempts) || numAttempts < 1 || numAttempts > 10) {
      setAttemptsError("Allowed attempts must be between 1 and 10.");
      toast.error("Allowed attempts must be between 1 and 10.");
      return;
    }

    const payload = {
      twoFactorAdmin,
      twoFactorManager,
      sessionTimeout: Number(sessionTimeout),
      maxLoginAttempts: numAttempts,
      passwordPolicy: {
        requireUppercase,
        requireNumber,
        requireSpecial
      },
      ipAllowlistEnabled,
      allowedIps: allowedIps.trim()
    };

    const { isValid, errors: validationErrors } = validateForm(securitySettingsSchema, payload);
    if (!isValid) {
      if (validationErrors.maxLoginAttempts) {
        setAttemptsError(validationErrors.maxLoginAttempts);
      }
      if (validationErrors.allowedIps) {
        setIpError(validationErrors.allowedIps);
      }
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr || "Please fix validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateSecuritySettings(payload);
      toast.success("Security settings saved successfully!");
      setAttemptsError("");
      setIpError("");
      await fetchSecuritySettings();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save security settings");
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

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait text-center"
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
                      onKeyDown={handleAttemptsKeyDown}
                      onChange={(e) => handleAttemptsChange(e.target.value)}
                      onBlur={handleAttemptsBlur}
                      min={1} 
                      max={10} 
                      className={`w-full max-w-xs px-3 py-2 bg-white border ${
                        attemptsError
                          ? 'border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'
                      } rounded-lg text-[13px] text-slate-700 focus:outline-none transition-all`} 
                    />
                    {attemptsError && (
                      <p className="text-xs text-red-500 font-medium mt-1">{attemptsError}</p>
                    )}
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
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'ip' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[12px] font-bold text-slate-600">Allowed IP Addresses</label>
                      <span className="text-[11px] text-slate-400 font-medium">{allowedIps.length}/500</span>
                    </div>
                    <textarea 
                      maxLength={500}
                      value={allowedIps} 
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 500);
                        setAllowedIps(val);
                        validateIps(val);
                      }}
                      onBlur={() => validateIps(allowedIps)}
                      placeholder="Enter IP addresses separated by commas (e.g. 192.168.1.1, 10.0.0.5)"
                      className={`w-full px-3 py-2 bg-white border ${
                        ipError 
                          ? 'border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'
                      } rounded-lg text-[13px] text-slate-700 focus:outline-none transition-all resize-none h-20`}
                    />
                    {ipError && (
                      <p className="text-xs text-red-500 font-medium mt-1">{ipError}</p>
                    )}
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
