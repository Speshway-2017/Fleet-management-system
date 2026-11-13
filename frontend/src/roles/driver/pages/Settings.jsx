import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { applyApplicationLanguage, LANGUAGE_OPTIONS, getLanguageName, getLanguageCode } from "@/utils/languageUtils";
import { toast } from "react-hot-toast";
import {
  Settings,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowRight,
  Bell,
  Globe,
  Sliders,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  RefreshCw
} from "lucide-react";

export default function DriverSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();
  const { currentLanguage, setLanguage: setGlobalLanguage } = useLanguage();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preferences & App Settings
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);
  const [language, setLanguage] = useState(currentLanguage || "English");
  const [notificationPreferences, setNotificationPreferences] = useState({
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: false,
    tripUpdates: true,
    routeChanges: true,
    trafficWarnings: true,
    fuelWarnings: true,
    emergencyAlerts: true,
    sound: true,
    vibration: true
  });

  // Password Validation States
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});

  const validatePasswordField = (field, value, allValues = {}) => {
    switch (field) {
      case "currentPassword": {
        const val = value || "";
        if (!val) return "Current password is required to authorize changes.";
        return "";
      }
      case "newPassword": {
        const val = value || "";
        if (!val) return "New password is required.";
        if (val.length < 8) return "Password must be at least 8 characters.";
        if (val.length > 50) return "Password must not exceed 50 characters.";
        if (!/[A-Z]/.test(val)) return "Must contain at least one uppercase letter (A-Z).";
        if (!/[a-z]/.test(val)) return "Must contain at least one lowercase letter (a-z).";
        if (!/\d/.test(val)) return "Must contain at least one number (0-9).";
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) return "Must contain at least one special character.";
        if (allValues.currentPassword && val === allValues.currentPassword) {
          return "New password cannot be identical to current password.";
        }
        return "";
      }
      case "confirmPassword": {
        const val = value || "";
        if (!val) return "Please re-type to confirm your new password.";
        if (allValues.newPassword && val !== allValues.newPassword) {
          return "Passwords do not match. Please re-enter.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const handlePasswordFieldChange = (field, value) => {
    if (field === "currentPassword") setCurrentPassword(value);
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    const allValues = {
      currentPassword: field === "currentPassword" ? value : currentPassword,
      newPassword: field === "newPassword" ? value : newPassword,
      confirmPassword: field === "confirmPassword" ? value : confirmPassword
    };
    const err = validatePasswordField(field, value, allValues);
    setPasswordErrors(prev => ({ ...prev, [field]: err }));

    if (field === "newPassword" && passwordTouched.confirmPassword) {
      const confirmErr = validatePasswordField("confirmPassword", confirmPassword, allValues);
      setPasswordErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handlePasswordFieldBlur = (field, value) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    const allValues = { currentPassword, newPassword, confirmPassword };
    const err = validatePasswordField(field, value, allValues);
    setPasswordErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAllPassword = () => {
    const fields = { currentPassword, newPassword, confirmPassword };
    const errs = {};
    let isValid = true;
    Object.keys(fields).forEach(key => {
      const err = validatePasswordField(key, fields[key], fields);
      if (err) {
        errs[key] = err;
        isValid = false;
      }
    });
    setPasswordErrors(errs);
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    return isValid;
  };

  useEffect(() => {
    fetchDriverSettings();
  }, []);

  useEffect(() => {
    if (currentLanguage) {
      setLanguage(getLanguageName(currentLanguage));
    }
  }, [currentLanguage]);

  const fetchDriverSettings = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.language) {
          const validLang = getLanguageName(d.language);
          setLanguage(validLang || "English");
        } else {
          setLanguage(currentLanguage ? getLanguageName(currentLanguage) : "English");
        }
        if (d.notificationPreferences) {
          setNotificationPreferences(prev => ({
            ...prev,
            ...d.notificationPreferences
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching driver settings:", err);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("driver_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      toast.success("Dark Mode Active 🌙");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Light Theme Active ☀️");
    }
  };

  const handleUpdateLanguage = async (newLang) => {
    const targetLang = newLang || language;
    const validLang = getLanguageName(targetLang || "English");
    const langCode = getLanguageCode(validLang);
    setLanguage(validLang);
    setUpdatingLanguage(true);

    try {
      // 1. Immediately apply to storage, cookies, and document
      applyApplicationLanguage(validLang, false);
      if (setGlobalLanguage) {
        setGlobalLanguage(validLang, false);
      }

      // 2. Persist language to backend database for the driver
      await driverApi.updateProfile({
        language: validLang
      });

      // 3. Dispatch events for real-time synchronization across UI
      window.dispatchEvent(new CustomEvent("profileUpdated"));
      window.dispatchEvent(new CustomEvent("app:language-changed", { detail: { language: validLang, code: langCode } }));

      toast.success(`Language successfully updated to ${validLang}!`);

      // 4. Smooth reload to ensure all UI elements and layout re-render cleanly
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err) {
      console.error("Language update error:", err);
      // Fallback: apply locally and inform user
      applyApplicationLanguage(validLang, false);
      toast.success(`Language set to ${validLang}`);
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } finally {
      setUpdatingLanguage(false);
    }
  };

  const handleTogglePref = (key) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async (e) => {
    e?.preventDefault?.();
    setSavingPreferences(true);
    try {
      const validLang = getLanguageName(language);
      const langCode = getLanguageCode(validLang);
      applyApplicationLanguage(validLang, false);
      if (setGlobalLanguage) {
        setGlobalLanguage(validLang, false);
      }
      const res = await driverApi.updateProfile({
        notificationPreferences,
        language: validLang,
        isDarkMode: isDark
      });
      if (res?.success) {
        toast.success("Notification preferences and app settings saved!");
        window.dispatchEvent(new CustomEvent("profileUpdated"));
        window.dispatchEvent(new Event("notificationsUpdated"));
        window.dispatchEvent(new CustomEvent("app:language-changed", { detail: { language: validLang, code: langCode } }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateAllPassword()) {
      toast.error("Please satisfy all password security requirements.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await driverApi.changePassword({
        currentPassword,
        newPassword
      });

      if (res?.success) {
        toast.success("Password updated successfully! Please keep it secure.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordTouched({});
        setPasswordErrors({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await driverApi.deleteAccount();
      setShowDeleteModal(false);
      await logout();
      toast.success("Account permanently deleted and set to In-Active. You have been securely logged out.");
      navigate("/login");
    } catch (err) {
      console.error("Error during account deletion:", err);
      toast.error(err.response?.data?.message || "Failed to complete account deletion request");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8 font-nunito pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black font-poppins text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#A14000]" />
          Driver Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Configure security, password management, portal theme, language preferences, and notification alerts.
        </p>
      </div>

      {/* 1. Security & Password Change */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <KeyRound className="w-5 h-5 text-[#A14000]" /> Security & Password Management
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg" noValidate>
          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Current Password *</label>
            <div className="relative mt-2">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
                onBlur={(e) => handlePasswordFieldBlur("currentPassword", e.target.value)}
                placeholder="••••••••"
                className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                  passwordTouched.currentPassword && passwordErrors.currentPassword
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordTouched.currentPassword && passwordErrors.currentPassword && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">New Password *</label>
            <div className="relative mt-2">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
                onBlur={(e) => handlePasswordFieldBlur("newPassword", e.target.value)}
                placeholder="••••••••"
                className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                  passwordTouched.newPassword && passwordErrors.newPassword
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordTouched.newPassword && passwordErrors.newPassword && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Confirm New Password *</label>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => handlePasswordFieldChange("confirmPassword", e.target.value)}
                onBlur={(e) => handlePasswordFieldBlur("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                  passwordTouched.confirmPassword && passwordErrors.confirmPassword
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordTouched.confirmPassword && passwordErrors.confirmPassword && (
              <p className="text-red-500 text-[11px] font-semibold mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Password Requirements:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>At least 8 characters long</li>
              <li>Must contain at least 1 uppercase and 1 lowercase letter</li>
              <li>Must contain at least 1 numeric digit and 1 special symbol</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {updatingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{updatingPassword ? "Updating Password..." : "Update Password"}</span>
          </button>
        </form>
      </div>

      {/* 2. Portal Appearance & Theme */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-[#A14000]" /> Portal Appearance & Theme
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
              !isDark
                ? "border-[#A14000] bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-[#A14000]/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-[#A14000] dark:bg-amber-950 dark:text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold font-poppins text-slate-900 dark:text-white">Light Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Standard crisp bright dashboard</p>
              </div>
            </div>
            {!isDark && <CheckCircle2 className="w-5 h-5 text-[#A14000]" />}
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
              isDark
                ? "border-[#A14000] bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-[#A14000]/20"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold font-poppins text-slate-900 dark:text-white">Dark Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Night mode optimized palette</p>
              </div>
            </div>
            {isDark && <CheckCircle2 className="w-5 h-5 text-[#A14000]" />}
          </button>
        </div>
      </div>

      {/* 3. System Preferences & Language */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-5 h-5 text-[#A14000]" /> System Preferences & Language
        </h2>

        <div className="space-y-6 max-w-2xl">
          {/* Preferred Language Selection */}
          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">
              Preferred Application Language
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Select your primary regional language. All driver menus, trip instructions, and notifications will render in this language.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              <div className="relative w-full sm:w-80">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={updatingLanguage}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] cursor-pointer appearance-none pr-10 shadow-xs transition disabled:opacity-50"
                >
                  {language && !LANGUAGE_OPTIONS.some((opt) => opt.value === language || opt.label === language) && (
                    <option value={language} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {language}
                    </option>
                  )}
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <button
                type="button"
                disabled={updatingLanguage}
                onClick={() => handleUpdateLanguage(language)}
                className="px-5 py-2.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {updatingLanguage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>{updatingLanguage ? "Updating Language..." : "Update Language"}</span>
              </button>
            </div>
          </div>

          {/* Operational Notification Preferences Toggles */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold font-poppins text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#A14000]" /> Push & SMS Alerts
            </h3>

            <div className="space-y-3">
              {[
                { key: "pushNotifications", label: "Push Notifications", desc: "Real-time alerts for active assigned trips and dispatch instructions" },
                { key: "smsNotifications", label: "SMS Notifications", desc: "Emergency roadside and dispatch contact text messages" },
                { key: "tripUpdates", label: "Trip Status Updates", desc: "Automatic reminders when planned departure time approaches" },
                { key: "trafficWarnings", label: "Traffic & Route Deviation Alerts", desc: "Audible route alerts and weather speed warnings" },
                { key: "sound", label: "Audible Notification Chimes", desc: "Play sound effect upon new dispatch message or ticket update" },
                { key: "vibration", label: "Haptic Vibration", desc: "Trigger phone vibration on high priority trip dispatches" }
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  onClick={() => handleTogglePref(key)}
                  className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-0.5 pr-3">
                    <p className="text-xs font-bold font-poppins text-slate-900 dark:text-white">{label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                  <div
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      notificationPreferences[key] ? "bg-[#A14000]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        notificationPreferences[key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                disabled={savingPreferences}
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {savingPreferences ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{savingPreferences ? "Saving Settings..." : "Save Preferences"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone / Account Deletion */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold font-poppins text-base">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Danger Zone: Delete Driver Account</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Permanently delete your driver profile, disable login credentials, and cease all background GPS telemetry tracking. This action is irreversible.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <NavLink
              to="/account-deletion"
              className="text-xs font-bold text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline flex items-center gap-1"
            >
              <span>View Deletion Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Warning Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white">
                Confirm Driver Account Deletion
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete your driver account? This will immediately deactivate your mobile credentials, disconnect live GPS tracking, and purge your personal records.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200">Please note:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>All active trips must be completed beforehand.</li>
                <li>Legally required tax & POD manifest slips are retained per transport regulations.</li>
                <li>You will be logged out and redirected to login immediately.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <NavLink
                to="/account-deletion"
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Read Policy Guide
              </NavLink>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAccount}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Confirm Deletion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
