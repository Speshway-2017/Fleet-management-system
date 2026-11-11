import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import driverApi from "../api/driverApi";
import UserProfileCard from "@/components/common/UserProfileCard";
import NotificationOverlay from "@/components/layout/NotificationOverlay";
import { applyApplicationLanguage, getLanguageName } from "@/utils/languageUtils";
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
  User,
  LogOut,
  Power,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  Home,
  RefreshCw
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
        if (res.data.language) {
          const currentLang = localStorage.getItem("app_language");
          const targetLang = getLanguageName(res.data.language);
          if (currentLang !== targetLang) {
            applyApplicationLanguage(targetLang, false);
          }
        }
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
        window.dispatchEvent(new CustomEvent("profileUpdated"));
        window.dispatchEvent(new CustomEvent("dutyStatusChanged", { detail: { isDuty: newStatus } }));
        toast.success(`Duty status updated to ${newStatus ? "ON DUTY" : "OFF DUTY"}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update duty status");
    } finally {
      setUpdatingDuty(false);
    }
  };

  const renderBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    if (pathnames.length === 0) return null;

    // Hide breadcrumbs entirely on the dashboard page
    const isDashboardPage = pathnames.length <= 2 && pathnames.includes("dashboard");
    if (isDashboardPage) return null;

    const labelMap = {
      driver: "Driver Portal",
      dashboard: "Dashboard",
      trips: "My Trips",
      vehicles: "My Vehicle",
      fuel: "Fuel Purchases",
      maintenance: "Maintenance Requests",
      documents: "Compliance Documents",
      notifications: "Alerts & Notifications",
      support: "Help & Support",
      settings: "Profile Settings",
      profile: "Driver Profile"
    };

    return (
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6 px-1 py-0.5 select-none font-poppins">
        <Link
          to="/driver/dashboard"
          className="flex items-center gap-1 hover:text-[#A14000] dark:hover:text-amber-400 transition-colors font-medium"
        >
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {pathnames.map((value, index) => {
          if (value.toLowerCase() === "driver" || value.toLowerCase() === "dashboard") return null;

          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayValue = labelMap[value.toLowerCase()] || (value.startsWith("TRIP") || value.match(/^[0-9a-fA-F]{24}$/) ? `Details (#${value.slice(-6)})` : value.charAt(0).toUpperCase() + value.slice(1));

          return (
            <div key={to} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-600" />
              {isLast ? (
                <span className="font-bold text-[#A14000] dark:text-amber-500">{displayValue}</span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-[#A14000] dark:hover:text-amber-400 transition-colors font-medium"
                >
                  {displayValue}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    );
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
            type="button"
            onClick={handleToggleDuty}
            disabled={updatingDuty}
            title={isOnDuty ? "Status: ON DUTY (Click to switch to Off Duty)" : "Status: OFF DUTY (Click to switch to On Duty)"}
            className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition font-poppins border shadow-2xs cursor-pointer ${
              isOnDuty
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-600/70"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {updatingDuty ? (
              <RefreshCw className="w-3 h-3 animate-spin text-current shrink-0" />
            ) : isOnDuty ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-slate-400 shrink-0"></span>
            )}
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {updatingDuty ? "..." : isOnDuty ? "On Duty" : "Off Duty"}
            </span>
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

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 my-0.5 font-poppins text-[11px] font-semibold rounded-xl transition-all ${
                  isActive
                    ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
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

        {/* Sign Out */}
        <div className="border-t border-slate-800/80 p-3 mt-auto shrink-0 bg-[#0D1B2A]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-poppins text-xs font-bold cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden bg-[#F5F7FA] dark:bg-[#0B0F17]">
        {/* Fixed Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white dark:bg-[#151C28] border-b border-slate-200 dark:border-[#242E42] px-8 items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h1 className="text-lg font-bold font-poppins text-slate-900 dark:text-white truncate" title={`Welcome back, ${driverName}`}>
              Welcome back, <span className="text-[#A14000]">{driverName}</span> 👋
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Redesigned On Duty / Off Duty Status Badge Button */}
            <button
              type="button"
              onClick={handleToggleDuty}
              disabled={updatingDuty}
              title={isOnDuty ? "Status: ON DUTY (Click to switch to Off Duty)" : "Status: OFF DUTY (Click to switch to On Duty)"}
              className={`group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-poppins transition-all duration-200 cursor-pointer select-none border shadow-2xs hover:shadow-xs active:scale-98 ${
                isOnDuty
                  ? "bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300/90 dark:border-emerald-700/70 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 hover:border-emerald-400"
                  : "bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:border-slate-400"
              }`}
            >
              {/* Dynamic Beacon / Dot */}
              {updatingDuty ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
              ) : isOnDuty ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 dark:bg-slate-500 shrink-0"></span>
              )}

              {/* Status Label */}
              <span className="tracking-wider uppercase text-[11px] font-black whitespace-nowrap">
                {updatingDuty ? "Updating..." : isOnDuty ? "On Duty" : "Off Duty"}
              </span>

              {/* Micro Switch Slider Affordance */}
              <div
                aria-hidden="true"
                className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isOnDuty ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isOnDuty ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

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
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* Driver Profile Dropdown */}
            <UserProfileCard
              user={driverProfile || user || { fullName: driverName }}
              roleLabel="Driver"
              profileLabel="Profile"
              profilePath="/driver/settings"
              settingsPath={null}
              showSettings={false}
              showSupport={false}
              showStatusToggle={false}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Scrollable Page Body Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto custom-scrollbar">
          {renderBreadcrumbs()}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

