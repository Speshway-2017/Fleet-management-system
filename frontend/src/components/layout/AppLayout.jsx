import { Outlet, NavLink, useLocation } from "react-router-dom";
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
  { label: "E-Way Bills", to: "/manager/ewaybills", icon: FileText },
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
  const { user, role } = useAuth();
  const location = useLocation();
  const links = role === "admin" ? ADMIN_ITEMS : MENU_ITEMS;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#0F0F10] text-gray-400 border-r border-[#1B1B1D]/50 shrink-0">
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
        <nav className="flex-1 overflow-y-auto py-4">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {role === "admin" ? "Admin Workspace" : "Manager Workspace"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || "Alex Thompson"}
                </p>
                <p className="text-xs text-gray-500">
                  {role === "admin" ? "Admin" : "Fleet Manager"}
                </p>
              </div>
              <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-md">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
