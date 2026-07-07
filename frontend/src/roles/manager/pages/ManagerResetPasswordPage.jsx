import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerResetPasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    toast.success("Password updated successfully!");
    navigate("/manager/profile/edit");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800 max-w-2xl">
      
      {/* ── HEADER BACK LINK ── */}
      <div className="space-y-1.5">
        <button
          onClick={() => navigate("/manager/profile/edit")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#B45A0A] hover:text-[#9A4D08] transition-colors border-none bg-transparent cursor-pointer p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Edit Profile</span>
        </button>
        <div>
          <h1 className="font-poppins font-black text-2xl text-gray-900 tracking-tight leading-none mt-1">
            Reset Password
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Ensure your account is protected by updating your security credentials.
          </p>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-orange-50/30 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#B45A0A]" />
          <h3 className="font-poppins font-black text-xs text-[#B45A0A] uppercase tracking-wider">
            Update Security Credentials
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/manager/profile/edit")}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-250 rounded-xl text-xs font-bold transition-all cursor-pointer text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
