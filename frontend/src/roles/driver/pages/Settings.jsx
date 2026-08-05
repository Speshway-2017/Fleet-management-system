import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Settings, KeyRound, Globe, Moon, Sun, User, Save } from "lucide-react";

export default function DriverSettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile details state with defaults from useAuth
  const [name, setName] = useState(user?.fullName || user?.name || "Driver");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phoneNumber || user?.phoneNo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "");

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setName(d.fullName || d.name || user?.fullName || user?.name || "Driver");
        setPhoneNumber(d.phone || d.phoneNumber || user?.phone || user?.phoneNumber || user?.phoneNo || "");
        setEmail(d.email || user?.email || "");
        setLicenseNumber(d.licenseNumber || user?.licenseNumber || "");
      }
    } catch (err) {
      console.error("Error fetching profile details in settings:", err);
    }
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber) {
      toast.error("Name and Phone number are required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await driverApi.updateProfile({
        fullName: name,
        name,
        phone: phoneNumber,
        phoneNumber,
        email,
        licenseNumber
      });
      if (res?.success) {
        toast.success("Profile details updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter current and new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setUpdating(true);
    try {
      const res = await driverApi.updateProfile({
        currentPassword,
        newPassword
      });

      if (res?.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#B45A0A]" />
          Driver Account Settings
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Configure security, password change, profile details, language preferences, and portal theme.
        </p>
      </div>

      {/* Driver Profile Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-[#B45A0A]" /> Profile Information
        </h2>

        <form onSubmit={handleSaveProfileDetails} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Driver Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter driver name"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Phone Number</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@fleet.com"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="DL-XXXX-XXXXXX"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="py-2.5 px-5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? "Saving Profile..." : "Update Profile Details"}</span>
          </button>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-[#B45A0A]" /> Change Security Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="py-2.5 px-5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm"
          >
            {updating ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#B45A0A]" /> App Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-2">Display Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                toast.success("Language preference saved");
              }}
              className="block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
            >
              <option value="en">English (Default)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 uppercase mb-2">Theme Mode</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  toast.success("Light Theme Active");
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold font-poppins flex items-center justify-center gap-2 border transition ${
                  theme === "light"
                    ? "bg-amber-50 text-[#B45A0A] border-amber-200 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  toast.success("Dark Mode Active");
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold font-poppins flex items-center justify-center gap-2 border transition ${
                  theme === "dark"
                    ? "bg-amber-50 text-[#B45A0A] border-amber-200 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
