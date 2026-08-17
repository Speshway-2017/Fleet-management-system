import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import driverApi from "../api/driverApi";
import UserProfileCard from "@/components/common/UserProfileCard";
import NotificationOverlay from "@/components/layout/NotificationOverlay";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard,
  Navigation,
  Truck,
  Fuel,
  Wrench,
  FileText,
  Bell,
  Headphones,
  Settings,
  LogOut,
  Power,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnDuty, setIsOnDuty] = useState(user?.isDuty ?? false);
  const [updatingDuty, setUpdatingDuty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [driverProfile, setDriverProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();

    const handleNotifUpdate = () => {
      fetchNotifications();
    };
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("notificationsUpdated", handleNotifUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("notificationsUpdated", handleNotifUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        setDriverProfile(res.data);
        const activeDuty = res.data.isDuty ?? res.data.isOnline ?? (res.data.driverStatus && res.data.driverStatus !== "OFFLINE" && res.data.driverStatus !== "OFF_DUTY");
        setIsOnDuty(Boolean(activeDuty));
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await driverApi.getNotifications();
      if (res?.success && Array.isArray(res.data)) {
        const unread = res.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleToggleDuty = async () => {
    setUpdatingDuty(true);
    try {
      const newStatus = !isOnDuty;
      const res = await driverApi.updateProfile({
        isDuty: newStatus,
        isOnline: newStatus,
        driverStatus: newStatus ? "AVAILABLE" : "OFFLINE"
      });
      if (res?.success) {
        setIsOnDuty(newStatus);
        setDriverProfile(prev => ({
          ...prev,
          isDuty: newStatus,
          isOnline: newStatus,
          driverStatus: newStatus ? "AVAILABLE" : "OFFLINE"
        }));
        toast.success(`Duty status updated to ${newStatus ? "ON DUTY" : "OFF DUTY"}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update duty status");
    } finally {
      setUpdatingDuty(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Clear local state regardless
    }
    navigate("/login", { replace: true });
  };

  const driverName = driverProfile?.fullName || driverProfile?.name || user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : "Driver");

  const navItems = [
    { label: "Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
    { label: "Trips", path: "/driver/trips", icon: Navigation },
    { label: "Vehicle", path: "/driver/vehicles", icon: Truck },
    { label: "Fuel", path: "/driver/fuel", icon: Fuel },
    { label: "Maintenance", path: "/driver/maintenance", icon: Wrench },
    { label: "Notifications", path: "/driver/notifications", icon: Bell, badge: unreadCount },
    { label: "Support", path: "/driver/support", icon: Headphones },
    { label: "Settings", path: "/driver/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen max-h-screen h-screen flex flex-col md:flex-row font-nunito bg-[#F5F7FA] dark:bg-[#0B0F17] text-slate-900 dark:text-white overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0F0F10] text-slate-200 border-b border-[#1B1B1D] shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-[#1B1B1D] hover:bg-slate-800 text-slate-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-7 h-7 object-contain rounded shrink-0" alt="Logo" />
            <span className="font-poppins font-black text-white text-base tracking-wide">FleetDriver</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleDuty}
            disabled={updatingDuty}
            className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 transition font-poppins ${
              isOnDuty
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <Power className="w-3 h-3" />
            {isOnDuty ? "ON DUTY" : "OFF DUTY"}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (Unified Dark Navy) */}
      <aside
        className={`${
          sidebarOpen ? "flex" : "hidden md:flex"
        } flex-col w-full md:w-64 bg-[#0D1B2A] text-slate-300 border-r border-slate-800/80 shrink-0 z-30 transition-all duration-300 select-none md:h-screen md:max-h-screen overflow-hidden`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 shrink-0">
          <Link to="/driver/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" className="w-9 h-9 object-contain rounded-lg shrink-0" alt="Logo" />
            <div className="border-l border-slate-700/60 pl-3 py-0.5">
              <h1 className="font-poppins font-black text-white text-base tracking-wide leading-none whitespace-nowrap">Fleet Management</h1>
              <span className="text-[10px] text-[#A14000] font-extrabold font-poppins uppercase tracking-wider mt-1 block">Driver Portal</span>
            </div>
          </Link>
        </div>

        {/* Driver Profile Card in Sidebar */}
        <div className="p-4 border-b border-slate-800/80 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFDBCC]/60 border border-[#A14000]/40 flex items-center justify-center text-[#A14000] font-bold font-poppins shrink-0 overflow-hidden">
              {driverProfile?.profileImage ? (
                <img src={driverProfile.profileImage} alt={driverName} className="w-full h-full object-cover" />
              ) : (
                driverName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-extrabold text-white font-poppins truncate">{driverName}</h2>
              <p className="text-xs font-semibold text-slate-400 truncate">{driverProfile?.email || user?.email || user?.phoneNumber || "Driver Account"}</p>
            </div>
          </div>
          {/* Duty Toggle Button */}
          <button
            onClick={handleToggleDuty}
            disabled={updatingDuty}
            className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-extrabold font-poppins flex items-center justify-center gap-2 transition cursor-pointer ${
              isOnDuty
                ? "bg-emerald-950/80 text-[#6EE7B7] border border-emerald-700/60 hover:bg-emerald-900/90"
                : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnDuty ? "bg-[#6EE7B7] animate-pulse" : "bg-slate-400"}`} />
            <span>{isOnDuty ? "Status: ON DUTY" : "Status: OFF DUTY"}</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 font-poppins text-sm rounded-xl transition-all ${
                  isActive
                    ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#A14000] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 mb-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#A14000]/30 bg-transparent px-4 py-2.5 font-bold font-poppins text-sm text-[#A14000] dark:text-rose-400 transition-all hover:bg-[#A14000]/10 cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden bg-[#F5F7FA] dark:bg-[#0B0F17]">
        {/* Fixed Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white dark:bg-[#151C28] border-b border-slate-200 dark:border-[#242E42] px-8 items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold font-poppins text-slate-900 dark:text-white">
              Welcome back, <span className="text-[#A14000]">{driverName}</span> 👋
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 px-1.5 py-0.5 bg-[#A14000] text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#151C28] leading-none min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationOverlay
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Driver Profile Dropdown without settings, support, or status toggle */}
            <UserProfileCard
              user={driverProfile || user || { fullName: driverName }}
              roleLabel="Driver"
              profilePath="/driver/settings"
              showSettings={false}
              showSupport={false}
              showStatusToggle={false}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Scrollable Page Body Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

