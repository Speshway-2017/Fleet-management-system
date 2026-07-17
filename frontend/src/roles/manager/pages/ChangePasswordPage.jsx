import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    navigate("/manager/settings");
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Breadcrumb />
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none mb-2">Change Password</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:lock-reset" className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Update Your Password</h2>
            <p className="text-gray-500">Choose a strong password to keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Icon
                  icon={showPasswords.current ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Icon
                  icon={showPasswords.new ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Must be at least 8 characters long with a mix of letters and numbers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Icon
                  icon={showPasswords.confirm ? "mdi:eye-off" : "mdi:eye"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/manager/settings")}
              className="px-6 py-3 border border-gray-400 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors shadow-lg"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
