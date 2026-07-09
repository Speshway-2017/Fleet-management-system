import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
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
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/manager", icon: LayoutDashboard },
  { label: "Vehicle Management", to: "/manager/vehicle-management", icon: Truck },
  { label: "Drivers", to: "/manager/drivers", icon: Users },
  { label: "Trips", to: "/manager/trips", icon: Route },
  { label: "Live Tracking", to: "/manager/map", icon: MapPin },
  { label: "Route Optimization", to: "/manager/route", icon: Compass },
  { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
  { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
  { label: "E-Way Bills", to: "/manager/eway", icon: FileText },
  { label: "FASTag & Toll", to: "/manager/fastag", icon: CreditCard },
  { label: "Documents", to: "/manager/documents", icon: FolderOpen },
  { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
  { label: "Reports", to: "/manager/reports", icon: ClipboardList },
  { label: "Notifications", to: "/manager/notifications", icon: Bell },
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
  { label: "Route Optimization", to: "/manager/route", icon: Compass },
  { label: "Fuel Management", to: "/manager/fuel", icon: Fuel },
  { label: "Maintenance", to: "/manager/maintenance", icon: Wrench },
  { label: "E-Way Bills", to: "/manager/eway", icon: FileText },
  { label: "FASTag & Toll", to: "/manager/fastag", icon: CreditCard },
  { label: "Documents", to: "/manager/documents", icon: FolderOpen },
  { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
  { label: "Reports", to: "/manager/reports", icon: ClipboardList },
];

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
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
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-[#0F0F10] text-gray-400 border-r border-[#1B1B1D]/50 h-full shadow-2xl z-10 animate-slide-left">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1B1B1D]/30 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center px-4 py-6 border-b border-[#1B1B1D]/50 shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  className="w-10 h-10 object-contain rounded-lg shrink-0"
                  alt="Fleet Management Logo"
                />
                <div className="border-l border-[#1B1B1D]/80 pl-[14px] py-1">
                  <h1 className="font-black text-white text-base tracking-wide leading-none whitespace-nowrap">
                    Fleet Management
                  </h1>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1.5 block">
                    {role === "admin" ? "Admin" : "Manager"}
                  </span>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-5" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {role === "admin" ? (
                links.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-6 py-3 text-sm border-l-4 transition-all ${
                        isActive
                          ? "border-[#B45A0A] bg-[#1B1B1D] text-[#B45A0A] font-semibold"
                          : "border-transparent hover:text-white hover:bg-[#1B1B1D]/30"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })
              ) : (
                <div className="px-2 py-2">
                  {MANAGER_MOBILE_SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                    return (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 text-sm rounded-xl transition-all ${
                          isActive
                            ? "bg-[#1B1B1D] text-[#B45A0A] font-semibold"
                            : "text-gray-300 hover:text-white hover:bg-[#1B1B1D]/30"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </nav>
            <div className="border-t border-[#1B1B1D]/50 px-4 py-4">
              <button
                onClick={handleLogoutRequest}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-col bg-[#0F0F10] text-gray-400 border-r border-[#1B1B1D]/50 shrink-0 sticky top-0 h-screen max-h-screen">
        {/* Brand Header */}
        <div className="flex items-center justify-center lg:justify-start lg:px-4 py-6 border-b border-[#1B1B1D]/50 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              className="w-10 h-10 object-contain rounded-lg shrink-0"
              alt="Fleet Management Logo"
            />
            <div className="border-l border-[#1B1B1D]/80 pl-[14px] py-1 hidden lg:block">
              <h1 className="font-black text-white text-base tracking-wide leading-none whitespace-nowrap">
                Fleet Management
              </h1>
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1.5 block">
                {role === "admin" ? "Admin" : "Manager"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 max-h-[calc(100vh-90px)]" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center justify-center lg:justify-start gap-3.5 px-6 py-3 text-sm border-l-4 transition-all ${
                  isActive
                    ? "border-[#B45A0A] bg-[#1B1B1D] text-[#B45A0A] font-semibold"
                    : "border-transparent hover:text-white hover:bg-[#1B1B1D]/30"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md md:hidden focus:outline-none cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Open Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-800 md:hidden">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(role === "admin" ? "/admin/notifications" : "/manager/notifications")}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B45A0A] border border-white rounded-full animate-pulse" />
            </button>
            <div className="relative hidden md:block">
              {/* Profile Trigger */}
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-all cursor-pointer text-left border-none bg-transparent"
              >
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800 leading-none">
                    {user?.name || "Alex Thompson"}
                  </p>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    {role === "admin" ? "Admin" : "Fleet Manager"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20 animate-fade-in origin-top-right">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(role === "admin" ? "/admin/settings/profile" : "/manager/profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(role === "admin" ? "/admin/settings" : "/manager/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(role === "admin" ? "/admin/notifications" : "/manager/notifications");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span>Help & Support</span>
                    </button>
                    <button
                      onClick={handleLogoutRequest}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[120px] md:pb-0 transition-all duration-300 animate-fade">
          <Outlet />
        </main>

        {isMobile && !mobileSidebarOpen && (
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
                    className={`flex flex-1 items-center justify-center rounded-2xl px-2 py-4 transition-all ${
                      isActive
                        ? "bg-[#FFF3E8] text-[#B45A0A]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}

        {isMobile && !mobileSidebarOpen && (
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
                    className="flex items-center gap-2 rounded-full bg-[#B45A0A] px-3 py-2 text-sm font-semibold text-white shadow-lg"
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
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B45A0A] text-white shadow-[0_10px_30px_rgba(180,90,10,0.35)] transition-transform hover:scale-105"
                title="Quick Actions"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
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
                  className="rounded-lg bg-[#B45A0A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#963f00]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
