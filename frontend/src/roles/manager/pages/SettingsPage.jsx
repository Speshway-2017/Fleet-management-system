import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import managerApi from "@/roles/manager/api/managerApi";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [twoStep, setTwoStep] = useState(() => {
    const saved = localStorage.getItem("manager_two_step");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("manager_language") || "English (United States)");
  const [timezone, setTimezone] = useState(() => localStorage.getItem("manager_timezone") || "(GMT-05:00) Eastern Time");
  const [units, setUnits] = useState(() => localStorage.getItem("manager_units") || "metric");
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("manager_notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      critical: { push: true, email: true, sms: true },
      maintenance: { push: true, email: false, sms: false },
      operational: { push: false, email: true, sms: false },
    };
  });

  const [supportSettings, setSupportSettings] = useState({
    officeName: "",
    phone: "",
    email: "",
    whatsappNumber: "",
    dispatchName: "",
    dispatchPhone: "",
    dispatchEmail: ""
  });
  const [savingSupport, setSavingSupport] = useState(false);

  const [supportErrors, setSupportErrors] = useState({});
  const [supportTouched, setSupportTouched] = useState({});

  useEffect(() => {
    fetchSupportSettings();
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hashId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  const fetchSupportSettings = async () => {
    try {
      const res = await managerApi.getSupportSettings();
      if (res?.data) {
        setSupportSettings({
          officeName: res.data.officeName || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          whatsappNumber: res.data.whatsappNumber || "",
          dispatchName: res.data.dispatchName || "",
          dispatchPhone: res.data.dispatchPhone || "",
          dispatchEmail: res.data.dispatchEmail || ""
        });
      }
    } catch (err) {
      console.error("Error loading support settings:", err);
    }
  };

  const validateSupportField = (name, val) => {
    const value = (val !== null && val !== undefined ? val : "").toString().trim();

    switch (name) {
      case "officeName": {
        if (!value) return "Office / Hub Title is required.";
        if (value.length < 2) return "Office / Hub Title must be at least 2 characters.";
        if (value.length > 50) return "Office / Hub Title must not exceed 50 characters.";
        if (!/[a-zA-Z]/.test(value)) return "Office / Hub Title must contain letters.";
        if (!/^[a-zA-Z0-9\s,.'\-&/]+$/.test(value)) return "Office / Hub Title contains invalid characters.";
        if (/(.)\1{3,}/i.test(value)) return "Repeated characters are not allowed.";
        return "";
      }
      case "phone": {
        if (!value) return "Manager phone number is required.";
        const clean = value.replace(/^(\+91|91|0)/, "").replace(/\D/g, "");
        if (clean.length !== 10) return "Phone number must contain exactly 10 digits.";
        if (!/^[1-9]/.test(clean)) return "Phone number must start with 1-9 (cannot start with 0).";
        if (/^(\d)\1{9}$/.test(clean)) return "Please enter a valid active phone number.";
        return "";
      }
      case "whatsappNumber": {
        if (!value) return "WhatsApp support number is required.";
        const clean = value.replace(/^(\+91|91|0)/, "").replace(/\D/g, "");
        if (clean.length !== 10) return "WhatsApp number must contain exactly 10 digits.";
        if (!/^[1-9]/.test(clean)) return "WhatsApp number must start with 1-9 (cannot start with 0).";
        if (/^(\d)\1{9}$/.test(clean)) return "Please enter a valid active WhatsApp number.";
        return "";
      }
      case "email": {
        if (!value) return "Manager office email is required.";
        if (/\s/.test(value)) return "Email address must not contain spaces.";
        if (value.length > 80) return "Email must not exceed 80 characters.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address.";
        return "";
      }
      case "dispatchName": {
        if (!value) return "Dispatch Desk Title is required.";
        if (value.length < 2) return "Dispatch Desk Title must be at least 2 characters.";
        if (value.length > 50) return "Dispatch Desk Title must not exceed 50 characters.";
        if (!/[a-zA-Z]/.test(value)) return "Dispatch Desk Title must contain letters.";
        if (!/^[a-zA-Z0-9\s,.'\-&/]+$/.test(value)) return "Dispatch Desk Title contains invalid characters.";
        if (/(.)\1{3,}/i.test(value)) return "Repeated characters are not allowed.";
        return "";
      }
      case "dispatchPhone": {
        if (!value) return "Emergency dispatch phone number is required.";
        const clean = value.replace(/^(\+91|91|0)/, "").replace(/\D/g, "");
        if (clean.length !== 10) return "Emergency phone number must contain exactly 10 digits.";
        if (!/^[1-9]/.test(clean)) return "Emergency phone number must start with 1-9 (cannot start with 0).";
        if (/^(\d)\1{9}$/.test(clean)) return "Please enter a valid active phone number.";
        return "";
      }
      case "dispatchEmail": {
        if (!value) return "Dispatch desk email is required.";
        if (/\s/.test(value)) return "Email address must not contain spaces.";
        if (value.length > 80) return "Email must not exceed 80 characters.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address.";
        return "";
      }
      default:
        return "";
    }
  };

  const handleSupportFieldChange = (field, value) => {
    setSupportSettings(prev => ({ ...prev, [field]: value }));
    const err = validateSupportField(field, value);
    setSupportErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSupportFieldBlur = (field) => {
    setSupportTouched(prev => ({ ...prev, [field]: true }));
    const err = validateSupportField(field, supportSettings[field]);
    setSupportErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAllSupportSettings = () => {
    const fields = ["officeName", "phone", "whatsappNumber", "email", "dispatchName", "dispatchPhone", "dispatchEmail"];
    const errors = {};
    let isValid = true;

    fields.forEach(field => {
      const err = validateSupportField(field, supportSettings[field]);
      if (err) {
        errors[field] = err;
        isValid = false;
      }
    });

    setSupportErrors(errors);
    setSupportTouched({
      officeName: true,
      phone: true,
      whatsappNumber: true,
      email: true,
      dispatchName: true,
      dispatchPhone: true,
      dispatchEmail: true
    });

    return isValid;
  };

  const handleSaveSupportSettings = async (e) => {
    if (e) e.preventDefault();
    if (!validateAllSupportSettings()) {
      toast.error("Please fix all validation errors before saving support contacts.");
      return;
    }

    setSavingSupport(true);
    try {
      const res = await managerApi.updateSupportSettings(supportSettings);
      if (res?.success) {
        toast.success("Driver Support Helpline contacts updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save support settings");
    } finally {
      setSavingSupport(false);
    }
  };

  const handleToggleTwoStep = () => {
    const next = !twoStep;
    setTwoStep(next);
    localStorage.setItem("manager_two_step", JSON.stringify(next));
    toast.success(next ? "2-Step verification enabled" : "2-Step verification disabled");
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    localStorage.setItem("manager_language", val);
  };

  const handleTimezoneChange = (val) => {
    setTimezone(val);
    localStorage.setItem("manager_timezone", val);
  };

  const handleUnitsChange = (val) => {
    setUnits(val);
    localStorage.setItem("manager_units", val);
  };

  const handleNotificationChange = (type, channel) => {
    setNotifications((prev) => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          [channel]: !prev[type][channel],
        },
      };
      localStorage.setItem("manager_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSave = async () => {
    localStorage.setItem("manager_two_step", JSON.stringify(twoStep));
    localStorage.setItem("manager_language", language);
    localStorage.setItem("manager_timezone", timezone);
    localStorage.setItem("manager_units", units);
    localStorage.setItem("manager_notifications", JSON.stringify(notifications));

    const isSupportValid = validateAllSupportSettings();
    if (!isSupportValid) {
      toast.error("Please fix all validation errors before saving.");
      return;
    }

    setSavingSupport(true);
    try {
      const res = await managerApi.updateSupportSettings(supportSettings);
      if (res?.success && res.data) {
        setSupportSettings({
          officeName: res.data.officeName || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          whatsappNumber: res.data.whatsappNumber || "",
          dispatchName: res.data.dispatchName || "",
          dispatchPhone: res.data.dispatchPhone || "",
          dispatchEmail: res.data.dispatchEmail || ""
        });
      }
      toast.success("All settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save support settings");
    } finally {
      setSavingSupport(false);
    }
  };

  const handleCancel = () => {
    const savedTwoStep = localStorage.getItem("manager_two_step");
    setTwoStep(savedTwoStep !== null ? JSON.parse(savedTwoStep) : true);
    setLanguage(localStorage.getItem("manager_language") || "English (United States)");
    setTimezone(localStorage.getItem("manager_timezone") || "(GMT-05:00) Eastern Time");
    setUnits(localStorage.getItem("manager_units") || "metric");
    const savedNotifs = localStorage.getItem("manager_notifications");
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch { /* ignore */ }
    }
    fetchSupportSettings();
    setSupportErrors({});
    toast.success("Settings reset to saved values");
  };

  return (
    <div className="p-8">
      <Breadcrumb />
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Settings</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Manage your professional profile and operational preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-400 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingSupport}
            className="px-6 py-2 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors shadow-lg cursor-pointer disabled:opacity-50"
          >
            {savingSupport ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Security Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
            <Icon icon="mdi:shield-outline" className="w-7 h-7 text-amber-700" />
            <h2 className="text-xl font-bold text-gray-800">Security</h2>
          </div>

          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-800 font-medium">2-Step Verification</p>
              <button
                onClick={handleToggleTwoStep}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  twoStep ? "bg-amber-700" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    twoStep ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400">Add an extra layer of safety</p>
          </div>

          <div>
            <p className="text-gray-800 font-medium mb-2">Password Management</p>
            <button
              onClick={() => navigate("/manager/change-password")}
              className="w-full py-3 border border-amber-700 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:lock-reset" className="w-5 h-5" />
              Change Password
            </button>
            <p className="text-center text-xs text-gray-300 mt-3">Last updated 45 days ago</p>
          </div>
        </div>

        {/* Regional & Units Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
            <Icon icon="mdi:earth" className="w-7 h-7 text-amber-700" />
            <h2 className="text-xl font-bold text-gray-800">Regional & Units</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 font-medium mb-2">System Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-2 bg-amber-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_12px_center]"
              >
                <option>English (United States)</option>
                <option>Spanish (Spain)</option>
                <option>French (France)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="w-full px-4 py-2 bg-amber-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_12px_center]"
              >
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT-06:00) Central Time</option>
                <option>(GMT-07:00) Mountain Time</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">Measurement Units</label>
              <div className="flex bg-amber-50 border border-gray-300 rounded-xl p-1">
                <button
                  onClick={() => handleUnitsChange("metric")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    units === "metric" ? "bg-white text-amber-700 shadow" : "text-gray-500"
                  }`}
                >
                  Metric (km, kg)
                </button>
                <button
                  onClick={() => handleUnitsChange("imperial")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    units === "imperial" ? "bg-white text-amber-700 shadow" : "text-gray-500"
                  }`}
                >
                  Imperial (mi, lbs)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div id="notifications" className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
          <Icon icon="mdi:bell-outline" className="w-7 h-7 text-amber-700" />
          <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Alert Type
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Push
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  Email
                </th>
                <th className="text-center px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  SMS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Critical Alerts</p>
                    <p className="text-xs text-gray-400">Accidents, major breakdowns, SOS</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.push}
                    onChange={() => handleNotificationChange("critical", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.email}
                    onChange={() => handleNotificationChange("critical", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.critical.sms}
                    onChange={() => handleNotificationChange("critical", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Maintenance Reminders</p>
                    <p className="text-xs text-gray-400">Scheduled servicing, fluid checks</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.push}
                    onChange={() => handleNotificationChange("maintenance", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.email}
                    onChange={() => handleNotificationChange("maintenance", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.maintenance.sms}
                    onChange={() => handleNotificationChange("maintenance", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-800 font-medium">Operational Reports</p>
                    <p className="text-xs text-gray-400">Weekly summaries, efficiency data</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.push}
                    onChange={() => handleNotificationChange("operational", "push")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.email}
                    onChange={() => handleNotificationChange("operational", "email")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifications.operational.sms}
                    onChange={() => handleNotificationChange("operational", "sms")}
                    className="w-5 h-5 accent-amber-700"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Support Helpline Configuration Card */}
      <div id="driver-support" className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <Icon icon="mdi:headset" className="w-7 h-7 text-amber-700" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Driver Support Helpline Configuration</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage office and dispatch contact details shown to drivers on their Support page.</p>
            </div>
          </div>
          <button
            onClick={handleSaveSupportSettings}
            disabled={savingSupport}
            className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
          >
            {savingSupport ? "Saving Support Contacts..." : "Save Support Contacts"}
          </button>
        </div>

        <form onSubmit={handleSaveSupportSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fleet Manager Office Section */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Icon icon="mdi:office-building" className="w-5 h-5 text-amber-700" />
              Fleet Manager Office Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Office / Hub Title</label>
              <input
                type="text"
                placeholder="e.g. Fleet Manager Office"
                value={supportSettings.officeName}
                onChange={(e) => handleSupportFieldChange("officeName", e.target.value)}
                onBlur={() => handleSupportFieldBlur("officeName")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.officeName
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-amber-700"
                }`}
              />
              {supportErrors.officeName && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.officeName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Manager Call Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +919876543210"
                value={supportSettings.phone}
                onChange={(e) => handleSupportFieldChange("phone", e.target.value)}
                onBlur={() => handleSupportFieldBlur("phone")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.phone
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-amber-700"
                }`}
              />
              {supportErrors.phone && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Chat Support Number</label>
              <input
                type="text"
                placeholder="e.g. +919876543210"
                value={supportSettings.whatsappNumber}
                onChange={(e) => handleSupportFieldChange("whatsappNumber", e.target.value)}
                onBlur={() => handleSupportFieldBlur("whatsappNumber")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.whatsappNumber
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-amber-700"
                }`}
              />
              {supportErrors.whatsappNumber && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.whatsappNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Manager Office Email</label>
              <input
                type="email"
                placeholder="e.g. manager@fleet.com"
                value={supportSettings.email}
                onChange={(e) => handleSupportFieldChange("email", e.target.value)}
                onBlur={() => handleSupportFieldBlur("email")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.email
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-amber-700"
                }`}
              />
              {supportErrors.email && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* 24/7 Central Dispatch Desk Section */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/60 space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Icon icon="mdi:phone-in-talk" className="w-5 h-5 text-blue-700" />
              24/7 Emergency Dispatch Helpline
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dispatch Desk Title</label>
              <input
                type="text"
                placeholder="e.g. Central Dispatch Desk"
                value={supportSettings.dispatchName}
                onChange={(e) => handleSupportFieldChange("dispatchName", e.target.value)}
                onBlur={() => handleSupportFieldBlur("dispatchName")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.dispatchName
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-700"
                }`}
              />
              {supportErrors.dispatchName && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.dispatchName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">24/7 Emergency Call Number</label>
              <input
                type="text"
                placeholder="e.g. +919876543211"
                value={supportSettings.dispatchPhone}
                onChange={(e) => handleSupportFieldChange("dispatchPhone", e.target.value)}
                onBlur={() => handleSupportFieldBlur("dispatchPhone")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.dispatchPhone
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-700"
                }`}
              />
              {supportErrors.dispatchPhone && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.dispatchPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dispatch Desk Email</label>
              <input
                type="email"
                placeholder="e.g. dispatch@fleet.com"
                value={supportSettings.dispatchEmail}
                onChange={(e) => handleSupportFieldChange("dispatchEmail", e.target.value)}
                onBlur={() => handleSupportFieldBlur("dispatchEmail")}
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none transition-colors ${
                  supportErrors.dispatchEmail
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-700"
                }`}
              />
              {supportErrors.dispatchEmail && (
                <p className="text-red-500 text-xs font-semibold mt-1 font-poppins flex items-center gap-1">
                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 inline shrink-0" />
                  {supportErrors.dispatchEmail}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>


    </div>
  );
}
