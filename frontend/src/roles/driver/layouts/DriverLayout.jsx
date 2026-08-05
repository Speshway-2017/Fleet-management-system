import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import driverApi from "../api/driverApi";
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
  X
} from "lucide-react";

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnDuty, setIsOnDuty] = useState(user?.isDuty ?? true);
  const [updatingDuty, setUpdatingDuty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        setIsOnDuty(res.data.isDuty ?? true);
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
      const res = await driverApi.updateProfile({ isDuty: newStatus });
      if (res?.success) {
        setIsOnDuty(newStatus);
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
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col md:flex-row font-nunito">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0F0F10] text-slate-200 border-b border-[#1B1B1D]">
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

      {/* Desktop Sidebar (Manager Style Dark #0F0F10) */}
      <aside
        className={`${
          sidebarOpen ? "flex" : "hidden md:flex"
        } flex-col w-full md:w-64 bg-[#0F0F10] border-r border-[#1B1B1D]/80 shrink-0 z-30 transition-all duration-300 select-none md:sticky md:top-0 md:h-screen md:max-h-screen md:overflow-hidden`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1B1B1D]/80 shrink-0">
          <Link to="/driver/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" className="w-9 h-9 object-contain rounded-lg shrink-0" alt="Logo" />
            <div className="border-l border-[#1B1B1D] pl-3 py-0.5">
              <h1 className="font-poppins font-black text-white text-base tracking-wide leading-none whitespace-nowrap">Fleet Management</h1>
              <span className="text-[10px] text-[#64748B] font-bold font-poppins uppercase tracking-wider mt-1 block">Driver Portal</span>
            </div>
          </Link>
        </div>

        {/* Driver Profile Card in Sidebar */}
        <div className="p-4 border-b border-[#1B1B1D]/80 bg-[#1B1B1D]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-[#B45A0A]/40 flex items-center justify-center text-[#B45A0A] font-bold font-poppins">
              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white font-poppins truncate">{user?.name || "Driver"}</h2>
              <p className="text-xs text-slate-400 truncate">{user?.email || user?.phoneNumber || "Driver Account"}</p>
            </div>
          </div>
          {/* Duty Toggle Button */}
          <button
            onClick={handleToggleDuty}
            disabled={updatingDuty}
            className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold font-poppins flex items-center justify-center gap-2 transition ${
              isOnDuty
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            {isOnDuty ? "Status: ON DUTY" : "Status: OFF DUTY"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-6 py-3 font-poppins text-sm border-l-4 transition-colors ${
                  isActive
                    ? "border-[#B45A0A] bg-[#1B1B1D] text-[#B45A0A] font-semibold"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-[#1B1B1D]/30"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#B45A0A] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 mb-2 border-t border-[#1B1B1D]/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#b45309]/30 bg-transparent px-4 py-2.5 font-semibold font-poppins text-sm text-[#b45309] transition-all hover:bg-[#b45309]/10"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-[#F5F7FA]">
        {/* Header Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold font-poppins text-slate-900">
              Welcome back, <span className="text-[#B45A0A]">{user?.name || "Driver"}</span> 👋
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Duty Status Badge */}
            <button
              onClick={handleToggleDuty}
              disabled={updatingDuty}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-poppins flex items-center gap-2 border transition ${
                isOnDuty
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isOnDuty ? "ON DUTY" : "OFF DUTY"}
            </button>

            <Link
              to="/driver/notifications"
              className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#B45A0A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/driver/profile"
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B45A0A] border border-amber-200 flex items-center justify-center font-bold font-poppins text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
              </div>
              <span className="text-xs font-semibold font-poppins text-slate-800">{user?.name || "Profile"}</span>
            </Link>
          </div>
        </header>

        {/* Outlet Page View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
