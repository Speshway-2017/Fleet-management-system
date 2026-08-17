import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, LogOut, Settings, HelpCircle, UserCheck } from "lucide-react";
import { driverApi } from "@/api/driverApi";
import toast from "react-hot-toast";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const host = apiBase.replace(/\/api\/?$/, "");
  return `${host}${url}`;
};

export default function UserProfileCard({
  user,
  roleLabel = "Fleet Manager",
  profilePath = "/manager/profile",
  settingsPath = "/manager/settings",
  supportPath = "/manager/notifications",
  showSettings = true,
  showSupport = true,
  showStatusToggle = true,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(
    user?.isOnline ?? (user?.driverStatus ? (user.driverStatus !== "OFFLINE" && user.driverStatus !== "OFF_DUTY") : false)
  );
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isDriver = roleLabel?.toLowerCase().includes("driver") || user?.role === "DRIVER";
  const displayName = user?.fullName || user?.name || (isDriver ? "Driver" : "Alex Thompson");
  const displayRole = roleLabel || (isDriver ? "Driver" : "Fleet Manager");

  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setIsOnline(user.isOnline);
    } else if (user?.driverStatus) {
      setIsOnline(user.driverStatus !== "OFFLINE" && user.driverStatus !== "OFF_DUTY");
    } else {
      setIsOnline(false);
    }
  }, [user]);

  // Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAvailability = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      const updateFn = driverApi.updateProfile || driverApi.update;
      if (updateFn) {
        await updateFn({
          isDuty: newStatus,
          isOnline: newStatus,
          driverStatus: newStatus ? "AVAILABLE" : "OFFLINE",
        });
        toast.success(newStatus ? "Status updated to Online 🟢" : "Status updated to Offline ⚪");
      }
    } catch (err) {
      console.error("Failed to update availability status:", err);
      setIsOnline(!newStatus);
      toast.error("Failed to update availability status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 p-1.5 hover:bg-gray-100/80 rounded-2xl focus:outline-none transition-all duration-150 cursor-pointer"
      >
        <div className="relative">
          <div className="w-[44px] h-[44px] rounded-full bg-[#A14000]/10 border border-[#A14000]/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {user?.profileImage ? (
              <img
                src={getImageUrl(user.profileImage)}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[#A14000]" />
            )}
          </div>
          {/* Status Indicator Dot */}
          {showStatusToggle && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                isOnline ? "bg-[#22C55E]" : "bg-[#9CA3AF]"
              }`}
            />
          )}
        </div>

        <div className="hidden sm:block text-left leading-tight pr-1">
          <p className="font-poppins font-bold text-sm text-[#1B2430] dark:text-white leading-none max-w-[140px] truncate">
            {displayName}
          </p>
          <span className="text-[11px] text-[#6B7280] dark:text-slate-300 font-nunito font-semibold mt-1 block leading-none">
            {displayRole}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Animated Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-[99999] font-poppins text-sm animate-in fade-in zoom-in-95 duration-150">
          {/* Mobile Profile Header Info */}
          <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
            <p className="font-semibold text-sm text-[#1B2430] truncate">{displayName}</p>
            <span className="text-xs text-[#6B7280] font-medium">{displayRole}</span>
          </div>

          {/* 1. My Profile */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (profilePath) navigate(profilePath);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span>My Profile</span>
          </button>

          {/* 2. Settings (Optional) */}
          {settingsPath && showSettings && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(settingsPath);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>
          )}

          {/* 3. Help & Support (Optional) */}
          {supportPath && showSupport && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(supportPath);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span>Help & Support</span>
            </button>
          )}

          {/* 4. Availability Status Toggle Switch (Optional) */}
          {isDriver && showStatusToggle && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <div className="px-4 py-2.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Availability Status
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnline ? "bg-[#22C55E]" : "bg-[#9CA3AF]"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        isOnline ? "text-emerald-700" : "text-gray-600"
                      }`}
                    >
                      {isOnline ? "🟢 Online" : "⚪ Offline"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnline}
                      onChange={handleToggleAvailability}
                      disabled={isUpdating}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22C55E]"></div>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="my-1 border-t border-gray-100" />

          {/* 5. Logout */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onLogout) onLogout();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
