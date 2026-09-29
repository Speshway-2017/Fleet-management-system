import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { useSettings } from "@/context/SettingsContext";
import { updateGeneralSettingsSchema, validateField, validateForm } from "@/validations";
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
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { fetchPlatformSettings: fetchAdminPlatformSettings } = useAdmin();
  const { fetchPlatformSettings: fetchGlobalPlatformSettings } = useSettings();

  const getFormData = () => ({
    platformName,
    timezone,
    language,
    footerDescription,
    contactPhone,
    contactEmail,
    contactAddress,
    facebookUrl,
    linkedinUrl,
    twitterUrl,
    youtubeUrl
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
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

  const handleFieldChange = (field, value) => {
    let cleanValue = value;
    let customError = "";

    if (field === "platformName") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 30);
      if (value !== cleanValue && value.length > 0) {
        customError = "Platform name must contain alphabets only (numbers & symbols are not allowed).";
      }
      setPlatformName(cleanValue);
    } else if (field === "contactPhone") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
      if (value !== cleanValue && value.length > 0) {
        customError = "Phone number must contain numbers only (letters are not allowed).";
      }
      setContactPhone(cleanValue);
    } else if (field === "contactEmail") {
      cleanValue = value.slice(0, 30);
      if (/\s/.test(value)) {
        customError = "Email address must not contain spaces.";
      }
      setContactEmail(cleanValue);
    } else if (field === "contactAddress") {
      cleanValue = value.slice(0, 100);
      setContactAddress(cleanValue);
    } else if (field === "footerDescription") {
      cleanValue = value.slice(0, 500);
      setFooterDescription(cleanValue);
    } else if (field === "timezone") {
      cleanValue = value;
      setTimezone(value);
    } else if (field === "language") {
      cleanValue = value;
      setLanguage(value);
    } else if (field === "facebookUrl") {
      cleanValue = value.slice(0, 100);
      setFacebookUrl(cleanValue);
    } else if (field === "linkedinUrl") {
      cleanValue = value.slice(0, 100);
      setLinkedinUrl(cleanValue);
    } else if (field === "twitterUrl") {
      cleanValue = value.slice(0, 100);
      setTwitterUrl(cleanValue);
    } else if (field === "youtubeUrl") {
      cleanValue = value.slice(0, 100);
      setYoutubeUrl(cleanValue);
    }

    if (customError) {
      setErrors(prev => ({ ...prev, [field]: customError }));
    } else {
      const fieldError = validateField(updateGeneralSettingsSchema, field, cleanValue, { ...getFormData(), [field]: cleanValue });
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleBlur = (field) => {
    const data = getFormData();
    const fieldError = validateField(updateGeneralSettingsSchema, field, data[field], data);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, contactPhone: "Phone number must contain numbers only (letters are not allowed)." }));
    } else {
      if (errors.contactPhone?.includes("must contain numbers only")) {
        setErrors(prev => ({ ...prev, contactPhone: "" }));
      }
    }
  };

  const handlePlatformNameKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, platformName: "Platform name must contain alphabets only (numbers & symbols are not allowed)." }));
    } else {
      if (errors.platformName?.includes("must contain alphabets only")) {
        setErrors(prev => ({ ...prev, platformName: "" }));
      }
    }
  };

  const handleLogoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const validExts = /\.(jpg|jpeg|png)$/i;

      if (!validTypes.includes(file.type) && !validExts.test(file.name)) {
        setErrors(prev => ({ ...prev, logo: "Invalid file type. Only JPG, JPEG, and PNG files are allowed." }));
        toast.error("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
        e.target.value = "";
        return;
      }
      setErrors(prev => ({ ...prev, logo: "" }));
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formDataObj = getFormData();
    const { isValid, errors: validationErrors } = validateForm(updateGeneralSettingsSchema, formDataObj);

    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fix all validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("platformName", platformName.trim());
      formData.append("timezone", timezone);
      formData.append("language", language);
      formData.append("footerDescription", footerDescription.trim());
      formData.append("contactPhone", contactPhone.trim());
      formData.append("contactEmail", contactEmail.trim());
      formData.append("contactAddress", contactAddress.trim());
      formData.append("facebookUrl", facebookUrl.trim());
      formData.append("linkedinUrl", linkedinUrl.trim());
      formData.append("twitterUrl", twitterUrl.trim());
      formData.append("youtubeUrl", youtubeUrl.trim());

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
      setErrors({});
      await loadSettings();
      await fetchAdminPlatformSettings();
      await fetchGlobalPlatformSettings();
    } catch (error) {
      const serverMsg = error.response?.data?.message || "Failed to save settings";
      toast.error(serverMsg);
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
                className="w-full sm:w-auto px-6 py-2.5 bg-[#a14000] hover:bg-[#853400] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait text-center cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#a14000] border-t-transparent rounded-full"></div>
              </div>
            )}
            <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Platform Settings</h3>
            
            <div className="space-y-6 max-w-4xl">
              {/* Platform Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-600">Platform Name *</label>
                <input 
                  type="text" 
                  maxLength={30}
                  value={platformName}
                  onKeyDown={handlePlatformNameKeyDown}
                  onChange={(e) => handleFieldChange("platformName", e.target.value)}
                  onBlur={() => handleBlur("platformName")}
                  placeholder="FleetCommand (2-30 chars)" 
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                    errors.platformName 
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                      : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                  }`}
                />
                {errors.platformName && <p className="text-xs text-red-500 font-medium">{errors.platformName}</p>}
              </div>

              {/* Timezone & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Timezone *</label>
                  <select 
                    value={timezone}
                    onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    onBlur={() => handleBlur("timezone")}
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all cursor-pointer ${
                      errors.timezone 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                    }`}
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
                  {errors.timezone && <p className="text-xs text-red-500 font-medium">{errors.timezone}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Language *</label>
                  <select 
                    value={language}
                    onChange={(e) => handleFieldChange("language", e.target.value)}
                    onBlur={() => handleBlur("language")}
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all cursor-pointer ${
                      errors.language 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                    }`}
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
                  {errors.language && <p className="text-xs text-red-500 font-medium">{errors.language}</p>}
                </div>
              </div>

              {/* Platform Logo */}
              <div className="space-y-2 pt-2">
                <label className="block text-[13px] font-bold text-slate-600">Platform Logo (JPG, JPEG, PNG only)</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                    <img src={logoUrl} alt="Platform Logo" className="w-full h-full object-contain" />
                  </div>
                  
                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                    onChange={handleLogoFileChange} 
                  />
                  
                  <button 
                    type="button"
                    onClick={() => document.getElementById('logo-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Logo
                  </button>
                </div>
                {errors.logo && <p className="text-xs text-red-500 font-medium">{errors.logo}</p>}
              </div>

              <hr className="border-slate-200 my-6" />

              {/* Footer & Public Contact Settings Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Landing Page Footer & Public Contact Data</h4>
                  <p className="text-xs text-slate-500">Configure public footer text, support contact info, and social media handles saved directly to DB.</p>
                </div>

                {/* Footer Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-slate-600">Footer Description *</label>
                    <span className="text-[11px] font-medium text-slate-400">{footerDescription.length}/500</span>
                  </div>
                  <textarea 
                    rows={3}
                    maxLength={500}
                    value={footerDescription}
                    onChange={(e) => handleFieldChange("footerDescription", e.target.value)}
                    onBlur={() => handleBlur("footerDescription")}
                    placeholder="Enter short company description for landing footer (10-500 chars)..." 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all resize-none ${
                      errors.footerDescription 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                    }`}
                  />
                  {errors.footerDescription && <p className="text-xs text-red-500 font-medium">{errors.footerDescription}</p>}
                </div>

                {/* Contact Phone & Contact Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">Support / Contact Phone *</label>
                    <input 
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={contactPhone}
                      onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={() => handleBlur("contactPhone")}
                      placeholder="10-digit mobile number" 
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                        errors.contactPhone 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.contactPhone && (
                      <p className="text-xs text-red-500 font-medium">{errors.contactPhone}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">Support / Contact Email *</label>
                    <input 
                      type="email" 
                      maxLength={30}
                      value={contactEmail}
                      onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                      onBlur={() => handleBlur("contactEmail")}
                      placeholder="support@fleet.com (5-30 chars)" 
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                        errors.contactEmail 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.contactEmail && <p className="text-xs text-red-500 font-medium">{errors.contactEmail}</p>}
                  </div>
                </div>

                {/* Contact Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-bold text-slate-600">HQ / Contact Address *</label>
                    <span className="text-[11px] font-medium text-slate-400">{contactAddress.length}/100</span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={100}
                    value={contactAddress}
                    onChange={(e) => handleFieldChange("contactAddress", e.target.value)}
                    onBlur={() => handleBlur("contactAddress")}
                    placeholder="Tech City, Bengaluru, Karnataka, India (5-100 chars)" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                      errors.contactAddress 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                    }`}
                  />
                  {errors.contactAddress && <p className="text-xs text-red-500 font-medium">{errors.contactAddress}</p>}
                </div>

                {/* Social Media Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">Facebook URL</label>
                    <input 
                      type="text" 
                      maxLength={100}
                      value={facebookUrl}
                      onChange={(e) => handleFieldChange("facebookUrl", e.target.value)}
                      onBlur={() => handleBlur("facebookUrl")}
                      placeholder="https://facebook.com/yourbrand" 
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-all ${
                        errors.facebookUrl 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.facebookUrl && <p className="text-xs text-red-500 font-medium">{errors.facebookUrl}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">LinkedIn URL</label>
                    <input 
                      type="text" 
                      maxLength={100}
                      value={linkedinUrl}
                      onChange={(e) => handleFieldChange("linkedinUrl", e.target.value)}
                      onBlur={() => handleBlur("linkedinUrl")}
                      placeholder="https://linkedin.com/company/yourbrand" 
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-all ${
                        errors.linkedinUrl 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.linkedinUrl && <p className="text-xs text-red-500 font-medium">{errors.linkedinUrl}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">Twitter URL</label>
                    <input 
                      type="text" 
                      maxLength={100}
                      value={twitterUrl}
                      onChange={(e) => handleFieldChange("twitterUrl", e.target.value)}
                      onBlur={() => handleBlur("twitterUrl")}
                      placeholder="https://twitter.com/yourbrand" 
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-all ${
                        errors.twitterUrl 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.twitterUrl && <p className="text-xs text-red-500 font-medium">{errors.twitterUrl}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">YouTube URL</label>
                    <input 
                      type="text" 
                      maxLength={100}
                      value={youtubeUrl}
                      onChange={(e) => handleFieldChange("youtubeUrl", e.target.value)}
                      onBlur={() => handleBlur("youtubeUrl")}
                      placeholder="https://youtube.com/@yourbrand" 
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-all ${
                        errors.youtubeUrl 
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                          : "border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]"
                      }`}
                    />
                    {errors.youtubeUrl && <p className="text-xs text-red-500 font-medium">{errors.youtubeUrl}</p>}
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
