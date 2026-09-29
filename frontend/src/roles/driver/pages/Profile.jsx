import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { User, Save, Trash2, AlertTriangle, X, ShieldAlert, ArrowRight } from "lucide-react";
import { driverSchema, validateForm } from "@/validations";

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState(user?.fullName || user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phoneNumber || user?.phoneNo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setName(d.fullName || d.name || user?.fullName || user?.name || "");
        setPhoneNumber(d.phone || d.phoneNumber || user?.phone || user?.phoneNumber || user?.phoneNo || "");
        setEmail(d.email || user?.email || "");
        setLicenseNumber(d.licenseNumber || user?.licenseNumber || "");
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = validateForm(driverSchema, {
      fullName: name,
      email,
      phoneNumber,
      licenseNumber
    });

    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError || "Please fix validation errors");
      return;
    }

    setSaving(true);
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
        toast.success("Profile updated successfully!");
        fetchProfile();
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

  return (
    <div className="space-y-8 font-nunito pb-12 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-[#A14000]" />
          Driver Profile Details
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage your personal contact details, license numbers, and account preferences.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#A14000] flex items-center justify-center font-bold font-poppins text-xl">
              {name ? name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <h2 className="text-lg font-bold font-poppins text-slate-900">{name || "Driver Name"}</h2>
              <p className="text-xs text-slate-500">Role: Registered Fleet Driver</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Driving License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#A14000] focus:border-[#A14000] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#A14000] hover:bg-[#853400] text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
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
