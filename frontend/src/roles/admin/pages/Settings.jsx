import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { useSettings } from "@/context/SettingsContext";

import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "(GMT+05:30) India Standard Time (IST) - New Delhi, Mumbai, Kolkata" },
  { value: "UTC", label: "(GMT+00:00) UTC / Greenwich Mean Time" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada) (EST/EDT)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada) (CST/CDT)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada) (MST/MDT)" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US & Canada) (PST/PDT)" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska Time (AKST/AKDT)" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii Standard Time (HST)" },
  { value: "America/Halifax", label: "(GMT-04:00) Atlantic Time (Canada)" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) Brasilia Time - São Paulo, Buenos Aires" },
  { value: "Europe/London", label: "(GMT+00:00 / +01:00) London, Dublin, Edinburgh (GMT/BST)" },
  { value: "Europe/Paris", label: "(GMT+01:00) Central European Time - Paris, Berlin, Rome, Madrid" },
  { value: "Europe/Athens", label: "(GMT+02:00) Eastern European Time - Athens, Cairo, Helsinki" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow Standard Time, Baghdad, Riyadh, Nairobi" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Gulf Standard Time - Dubai, Abu Dhabi, Muscat" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Pakistan Standard Time, Islamabad, Karachi, Tashkent" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Bangladesh Standard Time, Dhaka, Almaty" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Indochina Time - Bangkok, Hanoi, Jakarta" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, Hong Kong, Beijing, Perth" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Japan Standard Time - Tokyo, Osaka, Seoul" },
  { value: "Australia/Sydney", label: "(GMT+10:00 / +11:00) Australian Eastern Time - Sydney, Melbourne" },
  { value: "Pacific/Auckland", label: "(GMT+12:00 / +13:00) New Zealand Time - Auckland, Wellington" }
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Hindi", label: "Hindi (हिन्दी)" },
  { value: "Arabic", label: "Arabic (العربية)" },
  { value: "Chinese", label: "Chinese (Mandarin)" },
  { value: "Japanese", label: "Japanese (日本語)" },
  { value: "Portuguese", label: "Portuguese (Português)" }
];

export default function Settings() {
  const [platformName, setPlatformName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [logoFile, setLogoFile] = useState(null);

  // Footer & Contact Data
  const [footerDescription, setFooterDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
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
        setTimezone(settings.timezone && settings.timezone !== "IFD" ? settings.timezone : "Asia/Kolkata");
        setLanguage(settings.language || "English");
        setLogoUrl(settings.logoUrl || "/logo.png");
        setFooterDescription(settings.footerDescription || "A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.");
        const rawPhone = settings.contactPhone ? String(settings.contactPhone).replace(/\D/g, '').slice(-10) : "";
        setContactPhone(rawPhone);
        setContactEmail(settings.contactEmail || "support@fleet.com");
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

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '').slice(0, 10);
    setContactPhone(cleanDigits);

    if (rawVal !== cleanDigits && rawVal.length > 0) {
      setPhoneError("Please enter valid mobile number");
    } else if (!cleanDigits) {
      setPhoneError("Please enter valid mobile number");
    } else if (cleanDigits.length < 10) {
      setPhoneError("Please enter valid mobile number");
    } else {
      setPhoneError("");
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setPhoneError("Please enter valid mobile number");
    }
  };

  const handlePhoneBlur = () => {
    if (!contactPhone || contactPhone.length !== 10 || !/^\d{10}$/.test(contactPhone)) {
      setPhoneError("Please enter valid mobile number");
    } else {
      setPhoneError("");
    }
  };

  const handleSave = async () => {
    if (!platformName || !timezone || !language) {
      toast.error("Please fill in all required platform fields");
      return;
    }

    if (!contactPhone || contactPhone.length !== 10 || !/^\d{10}$/.test(contactPhone)) {
      setPhoneError("Please enter valid mobile number");
      toast.error("Please enter valid mobile number");
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
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Timezone</option>
                    {timezone && !TIMEZONE_OPTIONS.some(tz => tz.value === timezone || tz.label === timezone) && (
                      <option value={timezone}>{timezone}</option>
                    )}
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Language</option>
                    {language && !LANGUAGE_OPTIONS.some(lang => lang.value === language || lang.label === language) && (
                      <option value={language}>{language}</option>
                    )}
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
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
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={contactPhone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={handlePhoneBlur}
                      placeholder="Enter 10-digit mobile number" 
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                        phoneError 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]"
                      }`}
                    />
                    {phoneError && (
                      <p className="text-xs text-red-500 font-medium mt-1">{phoneError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Support / Contact Email</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="support@fleet.com" 
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
