import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const links = role === "admin" ? ADMIN_ITEMS : MENU_ITEMS;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#0F0F10] text-gray-400 border-r border-[#1B1B1D]/50 shrink-0 sticky top-0 h-fit max-h-screen">
        {/* Brand Header */}
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
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {role === "admin" ? "Admin Workspace" : "Manager Workspace"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative">
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
                  {/* Invisible overlay to close dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20 animate-fade-in origin-top-right">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/manager/profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate("/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
