import { NavLink, useLocation } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
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
  X
} from "lucide-react";
import toast from "react-hot-toast";
import "./manager.css";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/manager", icon: LayoutDashboard, isRealRoute: true },
  { label: "Vehicle Management", to: "/manager/vehicle-management", icon: Truck, isRealRoute: true },
  { label: "Drivers", to: "/manager/drivers", icon: Users, isRealRoute: true },
  { label: "Trips", to: "/manager/trips", icon: Route, isRealRoute: true },
  { label: "Live Tracking", to: "/manager/map", icon: MapPin, isRealRoute: true },
  { label: "Fuel Management", to: "/manager/fuel", icon: Fuel, isRealRoute: true },
  { label: "Maintenance", to: "/manager/maintenance", icon: Wrench, isRealRoute: true },
  { label: "Analytics", to: "/manager/analytics", icon: BarChart3, isRealRoute: true },
  { label: "Reports", to: "/manager/reports", icon: ClipboardList, isRealRoute: true },
  { label: "Notifications", to: "/manager/notifications", icon: Bell, isRealRoute: true },
  { label: "Settings", to: "/manager/settings", icon: Settings, isRealRoute: true },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const { platformSettings } = useSettings();

  const handleMenuClick = (e, item) => {
    if (!item.isRealRoute) {
      e.preventDefault();
      toast.success(`${item.label} screen is mocked as active for dashboard demo.`);
    } else {
      if (setMobileOpen) setMobileOpen(false);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0F0F10] text-gray-400 border-r border-[#1B1B1D]/50 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-[#1B1B1D]/50 shrink-0">
        <div className="flex items-center gap-2">
          <img src={platformSettings?.logoUrl || "/logo.png"} className="w-10 h-10 object-contain rounded-lg shrink-0" alt="Logo" />
          <div className="border-l border-[#1B1B1D]/80 pl-[14px] py-1">
            <h1 className="font-poppins font-black text-white text-base tracking-wide leading-none whitespace-nowrap">{platformSettings?.platformName || "Fleet Management"}</h1>
            <span className="text-[10px] text-[#64748B] font-bold font-poppins uppercase tracking-wider mt-1.5 block">Manager</span>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (location.pathname === "/manager" && item.to === "/manager");
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={(e) => handleMenuClick(e, item)}
              className={`flex items-center gap-3.5 px-6 py-3 font-poppins text-sm border-l-4 sidebar-link-transition ${isActive
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
    </div>
  );

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* --- Mobile/Tablet Sidebar Drawer Overlay --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <aside className="w-64 h-full animate-slide-in">
            {navContent}
          </aside>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
