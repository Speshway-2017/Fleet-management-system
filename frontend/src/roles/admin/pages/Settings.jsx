import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";

export default function Settings() {
  const [platformName, setPlatformName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [logoFile, setLogoFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      const settings = response.data?.data || response.data;
      if (settings) {
        setPlatformName(settings.platformName || "FleetCommand");
        setTimezone(settings.timezone || "IFD");
        setLanguage(settings.language || "English");
        setLogoUrl(settings.logoUrl || "/logo.png");
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!platformName || !timezone || !language) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("platformName", platformName);
      formData.append("timezone", timezone);
      formData.append("language", language);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await adminApi.updateSettings(formData);
      const updatedSettings = response.data?.data || response.data;
      if (updatedSettings) {
        setLogoUrl(updatedSettings.logoUrl);
        setLogoFile(null);
      }
      toast.success("Settings saved successfully!");
      await loadSettings();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="General Settings" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm transition-colors truncate">
                General
              </Link>
              <Link to="/admin/settings/security" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Profile
              </Link>
              <Link to="/admin/settings/reviews" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Reviews
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}
            <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Platform Settings</h3>
            
            <div className="space-y-6 max-w-4xl">
              {/* Platform Name */}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-slate-600">Platform Name</label>
                <input 
                  type="text" 
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="FleetCommand" 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                />
              </div>

              {/* Timezone & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Timezone</label>
                  <input 
                    type="text" 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Language</label>
                  <input 
                    type="text" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                  />
                </div>
              </div>

              {/* Platform Logo */}
              <div className="space-y-3 pt-2">
                <label className="block text-[13px] font-bold text-slate-600">Platform Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                    <img src={logoUrl} alt="Platform Logo" className="w-full h-full object-contain" />
                  </div>
                  
                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setLogoFile(file);
                        setLogoUrl(URL.createObjectURL(file));
                      }
                    }} 
                  />
                  
                  <button 
                    onClick={() => document.getElementById('logo-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
