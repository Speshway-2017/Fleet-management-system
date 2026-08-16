import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import { managerApi } from "@/roles/manager/api/managerApi";
import MilestoneReviewModal from "./MilestoneReviewModal";
import UserProfileCard from "@/components/common/UserProfileCard";
import NotificationOverlay from "./NotificationOverlay";


const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const host = apiBase.replace(/\/api\/?$/, "");
  return `${host}${url}`;
};
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  MapPin,
  Compass,
  Fuel,
  Wrench,
  FileText,
  CreditCard,
  FolderOpen,
  BarChart3,
  ClipboardList,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  User,
  Mail,
  Building2,
  ShieldCheck,
  X,
  Menu,
  MoreHorizontal,
  Plus,
  Coins,
  Sun,
  Moon
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
  { label: "Vehicle Management", to: "/manager/vehicle-management", icon: Truck },
  { label: "Drivers", to: "/manager/drivers", icon: Users },
  { label: "Trips", to: "/manager/trips", icon: Route },
  { label: "Live Tracking", to: "/manager/map", icon: MapPin },
  { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
  { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
  { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
  { label: "Earnings", to: "/manager/earnings", icon: Coins },
  { label: "Reports", to: "/manager/reports", icon: ClipboardList },
  { label: "Notifications", to: "/manager/notifications", icon: Bell },
  { label: "Subscription", to: "/manager/subscription", icon: CreditCard },
  { label: "Settings", to: "/manager/settings", icon: Settings },
];

const ADMIN_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
];

const MANAGER_MOBILE_ITEMS = [
  { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
  { label: "Vehicles", to: "/manager/vehicle-management", icon: Truck },
  { label: "Live Tracking", to: "/manager/map", icon: MapPin },
  { label: "Notifications", to: "/manager/notifications", icon: Bell },
  { label: "More", to: "/manager/settings", icon: MoreHorizontal },
];

const ADMIN_MOBILE_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Organizations", to: "/admin/organizations", icon: Building2 },
  { label: "Managers", to: "/admin/fleet-managers", icon: Users },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "More", to: "/admin/settings", icon: MoreHorizontal },
];

const MANAGER_MOBILE_SIDEBAR_ITEMS = [
  { label: "Trips", to: "/manager/trips", icon: Route },
  { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
  { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
  { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
  { label: "Earnings", to: "/manager/earnings", icon: Coins },
  { label: "Reports", to: "/manager/reports", icon: ClipboardList },
];

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const { platformSettings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNotifOverlayOpen, setIsNotifOverlayOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [openSections, setOpenSections] = useState({
    overview: true,
    logistics: true,
    fleetServices: true,
    analytics: true,
    system: true,
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/manager/vehicle") || path.startsWith("/manager/drivers") || path.startsWith("/manager/trips") || path.startsWith("/manager/map")) {
      setOpenSections((prev) => ({ ...prev, logistics: true }));
    } else if (path.startsWith("/manager/fuel") || path.startsWith("/manager/maintenance")) {
      setOpenSections((prev) => ({ ...prev, fleetServices: true }));
    } else if (path.startsWith("/manager/analytics") || path.startsWith("/manager/earnings") || path.startsWith("/manager/reports")) {
      setOpenSections((prev) => ({ ...prev, analytics: true }));
    } else if (path.startsWith("/manager/notifications") || path.startsWith("/manager/subscription") || path.startsWith("/manager/settings")) {
      setOpenSections((prev) => ({ ...prev, system: true }));
    }
  }, [location.pathname]);
  const links = role === "admin" ? ADMIN_ITEMS : MENU_ITEMS;
  const mobileLinks = role === "admin" ? ADMIN_MOBILE_ITEMS : MANAGER_MOBILE_ITEMS;
  const pageTitle = location.pathname.startsWith("/manager/reports") ? "Reports Center" : role === "admin" ? "Fleet Management" : "Fleet Center";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();

    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      setFabOpen(false);
    }
  }, [mobileSidebarOpen]);

  const [pendingMilestone, setPendingMilestone] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const checkMilestone = async () => {
    if (role !== "FLEET_MANAGER" && role !== "manager") return;
    try {
      const res = await managerApi.getPendingMilestone();
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data && data.milestone) {
        setPendingMilestone(data);
      } else {
        setPendingMilestone(null);
        setIsLocked(false);
      }
    } catch (err) {
      console.error("Failed to check trip milestone status:", err);
    }
  };

  useEffect(() => {
    checkMilestone();
  }, [location.pathname, role]);

  useEffect(() => {
    if (role !== "FLEET_MANAGER" && role !== "manager") return;
    const interval = setInterval(checkMilestone, 15000);
    return () => clearInterval(interval);
  }, [role]);

  const handleLogoutRequest = () => {
    setProfileOpen(false);
    setMobileSidebarOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden relative">
      {/* Mobile Sidebar Drawer */}
      {isMobile && mobileSidebarOpen && (
        <div className={`fixed inset-0 z-50 flex md:hidden ${isLocked ? "pointer-events-none filter blur-[3px] select-none" : ""}`}>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-[#0D1B2A] text-slate-300 border-r border-slate-800/80 h-full shadow-2xl z-10 animate-slide-left">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center px-4 py-6 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src={platformSettings?.logoUrl || "/logo.png"}
                  className="w-10 h-10 object-contain rounded-lg shrink-0"
                  alt="Fleet Management Logo"
                />
                <div className="border-l border-slate-700 pl-[14px] py-1">
                  <h1 className="font-black text-white text-base tracking-wide leading-none whitespace-nowrap">
                    {platformSettings?.platformName || "Fleet Management"}
                  </h1>
                  <span className="text-[10px] text-[#A14000] font-extrabold uppercase tracking-wider mt-1.5 block">
                    {role === "admin" ? "Super Admin" : "Fleet Manager"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-5 no-scrollbar">
              {role === "admin" ? (
                links.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-6 py-3 text-sm border-l-4 transition-all ${isActive
                          ? "border-[#A14000] bg-[#A14000]/10 text-[#A14000] font-bold"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })
              ) : (
                <div className="px-2 py-2 space-y-3">
                  {/* OVERVIEW */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("overview")}
                      className="w-full flex items-center justify-between px-3 py-1.5 font-poppins text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <span>Overview</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.overview ? "" : "-rotate-90"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.overview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden"
                        >
                          <NavLink
                            to="/manager"
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all ${location.pathname === "/manager"
                                ? "bg-[#A14000]/10 text-[#A14000] font-bold border-l-4 border-[#A14000]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                              }`}
                          >
                            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
                            <span>Dashboard</span>
                          </NavLink>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* LOGISTICS */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("logistics")}
                      className="w-full flex items-center justify-between px-3 py-1.5 font-poppins text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <span>Logistics</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.logistics ? "" : "-rotate-90"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.logistics && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {[
                            { label: "Vehicles", to: "/manager/vehicle-management", icon: Truck },
                            { label: "Drivers", to: "/manager/drivers", icon: Users },
                            { label: "Trips", to: "/manager/trips", icon: Route },
                            { label: "Live Tracking", to: "/manager/map", icon: MapPin },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || (item.to !== "/manager" && location.pathname.startsWith(item.to));
                            return (
                              <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all ${isActive
                                    ? "bg-[#A14000]/10 text-[#A14000] font-bold border-l-4 border-[#A14000]"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  }`}
                              >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* FLEET SERVICES */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("fleetServices")}
                      className="w-full flex items-center justify-between px-3 py-1.5 font-poppins text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <span>Fleet Services</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.fleetServices ? "" : "-rotate-90"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.fleetServices && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {[
                            { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
                            { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                            return (
                              <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all ${isActive
                                    ? "bg-[#A14000]/10 text-[#A14000] font-bold border-l-4 border-[#A14000]"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  }`}
                              >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ANALYTICS & REPORTS */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("analytics")}
                      className="w-full flex items-center justify-between px-3 py-1.5 font-poppins text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <span>Analytics & Reports</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.analytics ? "" : "-rotate-90"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.analytics && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {[
                            { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
                            { label: "Earnings", to: "/manager/earnings", icon: Coins },
                            { label: "Reports", to: "/manager/reports", icon: ClipboardList },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                            return (
                              <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all ${isActive
                                    ? "bg-[#A14000]/10 text-[#A14000] font-bold border-l-4 border-[#A14000]"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  }`}
                              >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* SYSTEM */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection("system")}
                      className="w-full flex items-center justify-between px-3 py-1.5 font-poppins text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                    >
                      <span>System</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSections.system ? "" : "-rotate-90"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.system && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {[
                            { label: "Notifications", to: "/manager/notifications", icon: Bell },
                            { label: "Subscription", to: "/manager/subscription", icon: CreditCard },
                            { label: "Settings", to: "/manager/settings", icon: Settings },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                            return (
                              <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3.5 px-4 py-2.5 text-sm rounded-xl transition-all ${isActive
                                    ? "bg-[#A14000]/10 text-[#A14000] font-bold border-l-4 border-[#A14000]"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  }`}
                              >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              )}
            </nav>
            <div className="border-t border-slate-100 px-4 py-4">
              <button
                onClick={handleLogoutRequest}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-20 lg:w-64 flex-col bg-[#0D1B2A] text-slate-300 border-r border-slate-800/80 shrink-0 sticky top-0 h-screen max-h-screen select-none ${isLocked ? "pointer-events-none filter blur-[3px]" : ""}`}>
        {/* Brand Header */}
        <div className="flex items-center justify-center lg:justify-start lg:px-5 py-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shrink-0">
              <img
                src={platformSettings?.logoUrl || "/logo.png"}
                className="w-8 h-8 object-contain rounded-md shrink-0"
                alt="Fleet Management Logo"
              />
            </div>
            <div className="hidden lg:block min-w-0">
              <h1 className="font-black text-white text-base tracking-tight leading-none truncate font-poppins">
                {platformSettings?.platformName || "Fleet Ops"}
              </h1>
              <span className="text-[10px] text-[#A14000] font-extrabold uppercase tracking-widest mt-1 block">
                {role === "admin" ? "Super Admin" : "Fleet Manager"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links with Accordions */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 max-h-[calc(100vh-85px)] no-scrollbar">
          {role === "admin" ? (
            links.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-xs font-bold font-poppins rounded-xl transition-all ${
                    isActive
                      ? "bg-[#A14000] text-white font-extrabold shadow-md shadow-[#A14000]/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="hidden lg:block">{item.label}</span>
                </NavLink>
              );
            })
          ) : (
            <div className="space-y-3">
              {/* OVERVIEW */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("overview")}
                  className="w-full flex items-center justify-between px-5 pt-2.5 pb-1.5 font-manrope text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <span className="hidden lg:block">Overview</span>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform duration-200 ${openSections.overview ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.overview && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <NavLink
                        to="/manager"
                        className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-sm font-semibold font-poppins rounded-xl transition-all ${
                          location.pathname === "/manager"
                            ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/20"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <LayoutDashboard className={`w-5 h-5 shrink-0 ${location.pathname === "/manager" ? "text-white" : "text-slate-400"}`} />
                        <span className="hidden lg:block">Dashboard</span>
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LOGISTICS & OPERATIONS */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("logistics")}
                  className="w-full flex items-center justify-between px-5 pt-2.5 pb-1.5 font-manrope text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <span className="hidden lg:block">Logistics</span>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform duration-200 ${openSections.logistics ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.logistics && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {[
                        { label: "Vehicles", to: "/manager/vehicle-management", icon: Truck },
                        { label: "Drivers", to: "/manager/drivers", icon: Users },
                        { label: "Trips", to: "/manager/trips", icon: Route },
                        { label: "Live Tracking", to: "/manager/map", icon: MapPin },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || (item.to !== "/manager" && location.pathname.startsWith(item.to));
                        return (
                          <NavLink
                            key={item.label}
                            to={item.to}
                            className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-sm font-semibold font-poppins rounded-xl transition-all ${
                              isActive
                                ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/20"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="hidden lg:block">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FLEET SERVICES */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("fleetServices")}
                  className="w-full flex items-center justify-between px-5 pt-2.5 pb-1.5 font-manrope text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <span className="hidden lg:block">Fleet Services</span>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform duration-200 ${openSections.fleetServices ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.fleetServices && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {[
                        { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
                        { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                        return (
                          <NavLink
                            key={item.label}
                            to={item.to}
                            className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-sm font-semibold font-poppins rounded-xl transition-all ${
                              isActive
                                ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/20"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="hidden lg:block">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ANALYTICS & REPORTS */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("analytics")}
                  className="w-full flex items-center justify-between px-5 pt-2.5 pb-1.5 font-manrope text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <span className="hidden lg:block">Analytics & Reports</span>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform duration-200 ${openSections.analytics ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.analytics && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {[
                        { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
                        { label: "Earnings", to: "/manager/earnings", icon: Coins },
                        { label: "Reports", to: "/manager/reports", icon: ClipboardList },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                        return (
                          <NavLink
                            key={item.label}
                            to={item.to}
                            className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-sm font-semibold font-poppins rounded-xl transition-all ${
                              isActive
                                ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/20"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="hidden lg:block">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SYSTEM */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("system")}
                  className="w-full flex items-center justify-between px-5 pt-2.5 pb-1.5 font-manrope text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <span className="hidden lg:block">System</span>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 transition-transform duration-200 ${openSections.system ? "" : "-rotate-90"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.system && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {[
                        { label: "Notifications", to: "/manager/notifications", icon: Bell },
                        { label: "Subscription", to: "/manager/subscription", icon: CreditCard },
                        { label: "Settings", to: "/manager/settings", icon: Settings },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                        return (
                          <NavLink
                            key={item.label}
                            to={item.to}
                            className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 my-0.5 text-sm font-semibold font-poppins rounded-xl transition-all ${
                              isActive
                                ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/20"
                                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="hidden lg:block">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 bg-[#FAFBFC] dark:bg-[#0D1117] ${isLocked ? "pointer-events-none filter blur-[3px] select-none" : ""}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#151C28]/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-[#242E42] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs shrink-0 select-none">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden focus:outline-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white md:hidden truncate">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOverlayOpen(!isNotifOverlayOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#A14000] border-2 border-white dark:border-[#151C28] rounded-full animate-pulse" />
              </button>

              <NotificationOverlay
                isOpen={isNotifOverlayOpen}
                onClose={() => setIsNotifOverlayOpen(false)}
              />
            </div>
            <div className="relative hidden md:block">
              <UserProfileCard
                user={user}
                roleLabel={role === "admin" ? "Admin" : "Fleet Manager"}
                profilePath={role === "admin" ? "/admin/settings/profile" : "/manager/profile"}
                settingsPath={role === "admin" ? "/admin/settings" : "/manager/settings"}
                supportPath={role === "admin" ? "/admin/notifications" : "/manager/notifications"}
                onLogout={handleLogoutRequest}
              />
            </div>
          </div>
        </header>

    {/* Page Content */}
    <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[120px] md:pb-0 bg-[#FAFBFC] dark:bg-[#0D1117]">
      <div key={location.pathname} className="animate-page-enter h-full w-full">
        <Outlet />
      </div>
    </main>

    { isMobile && !mobileSidebarOpen && (
      <nav className="fixed inset-x-2 bottom-2 z-[9999] flex min-h-[96px] items-center rounded-[24px] border border-gray-200 bg-white/95 px-2 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden animate-slide-up">
        <div className="mx-auto flex h-full w-full max-w-md items-center justify-between gap-2">
          {mobileLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/manager"
                ? location.pathname === "/manager"
                : item.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            if (item.label === "More") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(true);
                    setFabOpen(false);
                  }}
                  className="flex flex-1 items-center justify-center rounded-2xl px-2 py-4 text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
                >
                  <Icon className="h-6 w-6 shrink-0" />
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex flex-1 items-center justify-center rounded-2xl px-2 py-4 transition-all ${isActive
                    ? "bg-[#FFF3E8] text-[#A14000]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
              </NavLink>
            );
          })}
        </div>
      </nav>
    )
}

{
  isMobile && !mobileSidebarOpen && (
    <div className="fixed bottom-[110px] right-4 z-[60] md:hidden">
      <div className="relative">
        {fabOpen && (
          <div className="mb-3 flex flex-col gap-2 animate-slide-up">
            <button
              onClick={() => { setFabOpen(false); navigate("/manager/add-vehicle"); }}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <Truck className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
            <button
              onClick={() => { setFabOpen(false); navigate("/manager/reports"); }}
              className="flex items-center gap-2 rounded-full bg-[#A14000] px-3 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            <button
              onClick={() => { setFabOpen(false); navigate("/manager/reports"); }}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A14000] text-white shadow-[0_10px_30px_rgba(180,90,10,0.35)] transition-transform hover:scale-105"
          title="Quick Actions"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

{
  showLogoutConfirm && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-800">Are you sure you want to log out?</h3>
        <p className="mt-2 text-sm text-slate-500">You can sign back in anytime.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-[#A14000] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#963f00]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

      </div >

  { pendingMilestone && (
    <MilestoneReviewModal
      milestoneData={pendingMilestone}
      onClose={(refresh) => {
        setPendingMilestone(null);
        setIsLocked(false);
        if (refresh) {
          checkMilestone();
        }
      }}
      onLockStateChange={setIsLocked}
    />
  )}
    </div >
  );
}
