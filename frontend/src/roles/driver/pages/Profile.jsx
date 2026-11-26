import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import {
  User,
  Save,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowRight,
  Settings,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  Building,
  RefreshCw
} from "lucide-react";

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile data states
  const [driverData, setDriverData] = useState(null);
  const [name, setName] = useState(user?.fullName || user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phoneNumber || user?.phoneNo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "");
  const [profileImage, setProfileImage] = useState("");

  // Validation States
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    switch (field) {
      case "name": {
        const val = (value || "").trim();
        if (!val) return "Full name is required.";
        if (val.length < 2) return "Full name must be at least 2 characters.";
        if (val.length > 50) return "Full name must not exceed 50 characters.";
        if (/\d/.test(val)) return "Full name must contain letters only (numbers are not allowed).";
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return "Full name contains invalid characters.";
        if (/(.)\1{3,}/i.test(val)) return "Repeated characters are not allowed.";
        return "";
      }
      case "phoneNumber": {
        const val = (value || "").trim();
        if (!val) return "Phone number is required.";
        const clean = val.replace(/^(\+91|91|0)/, "").replace(/\D/g, "");
        if (clean.length !== 10) return "Phone number must contain exactly 10 digits.";
        if (!/^[1-9]/.test(clean)) return "Phone number must start with 1-9 (cannot start with 0).";
        if (/^(\d)\1{9}$/.test(clean)) return "Please enter a valid active phone number.";
        return "";
      }
      case "email": {
        const val = (value || "").trim();
        if (!val) return "";
        if (/\s/.test(val)) return "Email address must not contain spaces.";
        if (val.length > 80) return "Email must not exceed 80 characters.";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) return "Please enter a valid email address.";
        return "";
      }
      case "licenseNumber": {
        const val = (value || "").trim();
        if (!val) return "License number is required.";
        if (val.length < 5) return "License number must be at least 5 characters.";
        if (val.length > 20) return "License number must not exceed 20 characters.";
        if (!/^[A-Z0-9\s\-/]+$/i.test(val)) return "License number contains invalid characters.";
        if (!/[a-zA-Z]/.test(val) || !/[0-9]/.test(val)) return "License number must contain alphanumeric characters.";
        if (/(.)\1{4,}/i.test(val)) return "Repeated characters are not allowed.";
        return "";
      }
      default:
        return "";
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "phoneNumber") setPhoneNumber(value);
    if (field === "email") setEmail(value);
    if (field === "licenseNumber") setLicenseNumber(value);

    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFieldBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const fields = { name, phoneNumber, email, licenseNumber };
    const errs = {};
    let isValid = true;
    Object.keys(fields).forEach((key) => {
      const err = validateField(key, fields[key]);
      if (err) {
        errs[key] = err;
        isValid = false;
      }
    });
    setErrors(errs);
    setTouched({
      name: true,
      phoneNumber: true,
      email: true,
      licenseNumber: true,
    });
    return isValid;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setDriverData(d);
        setName(d.fullName || d.name || user?.fullName || user?.name || "");
        setPhoneNumber(d.phone || d.phoneNumber || user?.phone || user?.phoneNumber || user?.phoneNo || "");
        setEmail(d.email || user?.email || "");
        setLicenseNumber(d.licenseNumber || user?.licenseNumber || "");
        if (d.profileImage) {
          setProfileImage(d.profileImage);
        }
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix all validation errors before saving profile details.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: name.trim(),
        name: name.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        licenseNumber: licenseNumber.trim(),
      };

      if (profileImage) {
        payload.profileImage = profileImage;
      }

      const res = await driverApi.updateProfile(payload);

      if (res?.success) {
        toast.success("Profile updated successfully!");
        window.dispatchEvent(new CustomEvent("profileUpdated"));
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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

  const assignedManagerName = driverData?.manager?.name || driverData?.assignedManager?.name || "Assigned Manager";
  const assignedVehiclePlate = driverData?.vehicle || driverData?.assignedVehicle?.plateNumber || "Assigned Fleet Vehicle";
  const driverHub = driverData?.branch || driverData?.primaryHub || "Regional Hub";
  const isOnDuty = driverData?.isDuty ?? driverData?.isOnline ?? true;

  return (
    <div className="w-full max-w-4xl space-y-8 font-nunito pb-12">
      {/* Page Header with Action Nav to Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-[#A14000]" />
            Driver Profile Details
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Manage your personal identity, contact details, commercial driving license, and headshot.
          </p>
        </div>

        <Link
          to="/driver/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-poppins bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/70 dark:border-slate-700 transition self-start sm:self-center"
        >
          <Settings className="w-4 h-4 text-[#A14000]" />
          <span>Go to Account Settings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Profile Overview Banner Card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar Container */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FFDBCC]/50 dark:bg-[#A14000]/20 border-2 border-[#A14000]/40 flex items-center justify-center text-[#A14000] dark:text-amber-400 font-bold font-poppins text-2xl shadow-sm shrink-0">
              {profileImage ? (
                <img src={profileImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                (name || "D").charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold font-poppins text-slate-900 dark:text-white truncate">
                  {name || "Driver Name"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-poppins bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  CDL Verified
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-poppins uppercase ${
                  isOnDuty
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {isOnDuty ? "On Duty" : "Off Duty"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role: <span className="font-semibold text-slate-700 dark:text-slate-200">Registered Commercial Fleet Driver</span>
              </p>
            </div>
          </div>
        </div>

        {/* Operational Context Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-xs font-poppins">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Vehicle</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={assignedVehiclePlate}>
                {assignedVehiclePlate}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#A14000] dark:text-amber-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Manager</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={assignedManagerName}>
                {assignedManagerName}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Hub</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={driverHub}>
                {driverHub}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Profile Information Form */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-5 h-5 text-[#A14000]" /> Personal & Contact Details
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 dark:text-slate-300">
                Driver Full Name *
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={(e) => handleFieldBlur("name", e.target.value)}
                  placeholder="Enter full name"
                  className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                    touched.name && errors.name
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 dark:text-slate-300">
                Phone Number *
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                  onBlur={(e) => handleFieldBlur("phoneNumber", e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                    touched.phoneNumber && errors.phoneNumber
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={(e) => handleFieldBlur("email", e.target.value)}
                  placeholder="driver@fleet.com"
                  className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                    touched.email && errors.email
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700 dark:text-slate-300">
                Commercial Driving License Number (CDL) *
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => handleFieldChange("licenseNumber", e.target.value)}
                  onBlur={(e) => handleFieldBlur("licenseNumber", e.target.value)}
                  placeholder="DL-XXXX-XXXXXX"
                  className={`block w-full px-4 py-3 bg-white dark:bg-slate-900/80 border rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none transition-colors ${
                    touched.licenseNumber && errors.licenseNumber
                      ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000]"
                  }`}
                />
              </div>
              {touched.licenseNumber && errors.licenseNumber && (
                <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.licenseNumber}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
            </button>
          </div>
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
