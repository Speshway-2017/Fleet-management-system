import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { useSettings } from "@/context/SettingsContext";

import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";

export default function Settings() {
  const [platformName, setPlatformName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [logoFile, setLogoFile] = useState(null);

  // Footer & Contact Data
  const [footerDescription, setFooterDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { fetchPlatformSettings: fetchAdminPlatformSettings } = useAdmin();
  const { fetchPlatformSettings: fetchGlobalPlatformSettings } = useSettings();

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      const settings = response.data?.data || response.data;
      if (settings) {
        setPlatformName(settings.platformName || "FleetCommand");
        setTimezone(settings.timezone || "IFD");
        setLanguage(settings.language || "English");
        setLogoUrl(settings.logoUrl || "/logo.png");
        setFooterDescription(settings.footerDescription || "A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.");
        setContactPhone(settings.contactPhone || "+91 1800 200 4567");
        setContactEmail(settings.contactEmail || "support@fleetmanagement.io");
        setContactAddress(settings.contactAddress || "Logistics Hub Tower, Tech City, Bengaluru 560001, Karnataka, India");
        setFacebookUrl(settings.facebookUrl || "https://facebook.com");
        setLinkedinUrl(settings.linkedinUrl || "https://linkedin.com");
        setTwitterUrl(settings.twitterUrl || "https://twitter.com");
        setYoutubeUrl(settings.youtubeUrl || "https://youtube.com");
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
      toast.error("Please fill in all required platform fields");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("platformName", platformName);
      formData.append("timezone", timezone);
      formData.append("language", language);
      formData.append("footerDescription", footerDescription);
      formData.append("contactPhone", contactPhone);
      formData.append("contactEmail", contactEmail);
      formData.append("contactAddress", contactAddress);
      formData.append("facebookUrl", facebookUrl);
      formData.append("linkedinUrl", linkedinUrl);
      formData.append("twitterUrl", twitterUrl);
      formData.append("youtubeUrl", youtubeUrl);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await adminApi.updateSettings(formData);
      const updatedSettings = response.data?.data || response.data;
      if (updatedSettings) {
        setLogoUrl(updatedSettings.logoUrl || logoUrl);
        setLogoFile(null);
      }
      toast.success("Platform & Footer settings saved successfully!");
      await loadSettings();
      await fetchAdminPlatformSettings();
      await fetchGlobalPlatformSettings();
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
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
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

              <hr className="border-slate-200 my-6" />

              {/* Footer & Public Contact Settings Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Landing Page Footer & Public Contact Data</h4>
                  <p className="text-xs text-slate-500">Configure public footer text, support contact info, and social media handles saved directly to DB.</p>
                </div>

                {/* Footer Description */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Footer Description</label>
                  <textarea 
                    rows={3}
                    value={footerDescription}
                    onChange={(e) => setFooterDescription(e.target.value)}
                    placeholder="Enter short company description for landing footer..." 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all resize-none"
                  />
                </div>

                {/* Contact Phone & Contact Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Support / Contact Phone</label>
                    <input 
                      type="text" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 1800 200 4567" 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Support / Contact Email</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="support@fleetmanagement.io" 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    />
                  </div>
                </div>

                {/* Contact Address */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">HQ / Contact Address</label>
                  <input 
                    type="text" 
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Tech City, Bengaluru, Karnataka, India" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                  />
                </div>

                {/* Social Media Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Facebook URL</label>
                    <input 
                      type="text" 
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourbrand" 
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/yourbrand" 
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Twitter URL</label>
                    <input 
                      type="text" 
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/yourbrand" 
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">YouTube URL</label>
                    <input 
                      type="text" 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourbrand" 
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
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
