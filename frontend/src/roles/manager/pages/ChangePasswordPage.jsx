import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { changePasswordSchema, validateForm } from "@/validations";
import { managerApi } from "../api/managerApi";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePasswordField = (name, value, currentForm) => {
    let errorMsg = "";
    const strVal = String(value || "").trim();

    if (name === "currentPassword") {
      if (!strVal) {
        errorMsg = "Current password is required.";
      } else if (strVal.length > 20) {
        errorMsg = "Current password must not exceed 20 characters.";
      }
    } else if (name === "newPassword") {
      if (!strVal) {
        errorMsg = "New password is required.";
      } else if (/\s/.test(strVal)) {
        errorMsg = "Password must not contain spaces.";
      } else if (strVal.length < 8) {
        errorMsg = "Password must be at least 8 characters.";
      } else if (strVal.length > 20) {
        errorMsg = "Password must not exceed 20 characters.";
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(strVal)) {
        errorMsg = "Password must contain uppercase, lowercase and number.";
      } else if (/(.)\1{4,}/i.test(strVal)) {
        errorMsg = "Password contains invalid repeated characters.";
      } else if (currentForm?.currentPassword && strVal === String(currentForm.currentPassword).trim()) {
        errorMsg = "New password must be different from current password.";
      }
    } else if (name === "confirmPassword") {
      if (!strVal) {
        errorMsg = "Confirm password is required.";
      } else if (strVal.length > 20) {
        errorMsg = "Confirm password must not exceed 20 characters.";
      } else if (strVal !== String(currentForm?.newPassword || "").trim()) {
        errorMsg = "Passwords do not match.";
      }
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...formData, [name]: value };
    setFormData(nextForm);
    const err = validatePasswordField(name, value, nextForm);
    setErrors((prev) => {
      const updated = { ...prev, [name]: err };
      // Revalidate confirmPassword when newPassword changes
      if (name === "newPassword" && formData.confirmPassword) {
        updated.confirmPassword = validatePasswordField("confirmPassword", formData.confirmPassword, nextForm);
      }
      return updated;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validatePasswordField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateForm(changePasswordSchema, formData);
    if (!result.isValid) {
      setErrors(result.errors);
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError || "Please fix validation errors");
      return;
    }

    try {
      setLoading(true);
      const res = await managerApi.changePassword({
        currentPassword: formData.currentPassword,
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setErrors({});
        setTimeout(() => {
          navigate("/manager/settings");
        }, 800);
      } else {
        toast.error(res.data?.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to update password";
      toast.error(msg);
      if (
        msg.toLowerCase().includes("current password") ||
        msg.toLowerCase().includes("old password") ||
        msg.toLowerCase().includes("incorrect password")
      ) {
        setErrors((prev) => ({ ...prev, currentPassword: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800">
      <Breadcrumb />
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[28px] sm:text-[32px] text-[#1E293B] leading-tight">
            Change Password
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1 font-medium">
            Update your account password and security credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/manager/settings")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#1E293B] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs font-poppins"
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 text-[#64748B]" />
          Back to Settings
        </button>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Icon icon="mdi:lock-reset" className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 font-poppins">Update Your Password</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Choose a strong password to keep your account secure</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-poppins">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none transition-all ${
                  errors.currentPassword ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-amber-500"
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Icon
                  icon={showPasswords.current ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1.5 font-medium font-poppins flex items-center gap-1">
                • {errors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-poppins">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none transition-all ${
                  errors.newPassword ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-amber-500"
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Icon
                  icon={showPasswords.new ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-xs text-red-500 mt-1.5 font-medium font-poppins flex items-center gap-1">
                • {errors.newPassword}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2 font-poppins">
                Must be at least 8 characters long with a mix of letters and numbers (max 20)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-poppins">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none transition-all ${
                  errors.confirmPassword ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-amber-500"
                }`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Icon
                  icon={showPasswords.confirm ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5 font-medium font-poppins flex items-center gap-1">
                • {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/manager/settings")}
              disabled={loading}
              className="px-6 py-3 border border-gray-400 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white rounded-xl font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}

