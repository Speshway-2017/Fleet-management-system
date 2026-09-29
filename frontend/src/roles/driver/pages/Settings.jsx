import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "react-hot-toast";
import { Settings, KeyRound, User, Save, Eye, EyeOff, Moon, Sun, Trash2, AlertTriangle, X, ShieldAlert, ArrowRight } from "lucide-react";

export default function DriverSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme, isDark } = useTheme();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile details state
  const [name, setName] = useState(user?.fullName || user?.name || "Driver");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phoneNumber || user?.phoneNo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setName(d.fullName || d.name || user?.fullName || user?.name || "Driver");
        setPhoneNumber(d.phone || d.phoneNumber || user?.phone || user?.phoneNumber || user?.phoneNo || "");
        setEmail(d.email || user?.email || "");
        setLicenseNumber(d.licenseNumber || user?.licenseNumber || "");
        if (d.profileImage) setProfileImage(d.profileImage);
      }
    } catch (err) {
      console.error("Error fetching profile details in settings:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
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
        licenseNumber,
        profileImage
      });
      if (res?.success) {
        toast.success("Profile details & avatar updated successfully!");
        fetchProfile();
        window.dispatchEvent(new Event("profileUpdated"));
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
    <div className="max-w-4xl space-y-8 font-nunito pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-poppins text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#A14000]" />
          Driver Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Configure security, password change, profile details, language preferences, and portal theme.
        </p>
      </div>

      {/* Driver Profile Details */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-[#A14000]" /> Profile Information
        </h2>

        <form onSubmit={handleSaveProfileDetails} className="space-y-6 max-w-2xl">
          {/* Profile Picture Upload Avatar Box */}
          <div className="flex items-center gap-4 p-4 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#FFDBCC]/60 dark:bg-[#A14000]/30 border-2 border-[#A14000]/50 flex items-center justify-center text-[#A14000] dark:text-white font-bold font-poppins text-xl shrink-0 shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <label className="block text-xs font-bold font-poppins text-slate-900 dark:text-white">Profile Photo</label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload a clean headshot. JPG, PNG up to 5MB.</p>
              <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                <span>Upload New Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Driver Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter driver name"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Phone Number</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@fleet.com"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="DL-XXXX-XXXXXX"
                className="mt-1 block w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="py-2.5 px-5 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? "Saving Profile..." : "Update Profile Details"}</span>
          </button>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <KeyRound className="w-5 h-5 text-[#A14000]" /> Change Security Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Current Password</label>
            <div className="relative mt-1">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 transition"
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">New Password</label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 transition"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-poppins text-slate-700 dark:text-slate-300 uppercase">Confirm New Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 transition"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="py-2.5 px-5 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs transition disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {updating ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
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

          <div className="flex items-center gap-3 self-start sm:self-center flex-shrink-0">
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
              <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
