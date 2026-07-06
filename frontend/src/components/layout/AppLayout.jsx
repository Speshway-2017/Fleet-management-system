import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@iconify/react";

const NAV_ITEMS = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: "mdi:view-dashboard-outline" },
    { to: "/admin/users", label: "Users", icon: "mdi:account-group" },
    { to: "/admin/dashboard", label: "Dashboard" },

  ],
  manager: [
    { to: "/manager", label: "Dashboard", icon: "mdi:view-dashboard-outline" },
    { to: "/manager/vehicles", label: "Vehicles", icon: "mdi:truck-outline" },
    { to: "/manager/drivers", label: "Drivers", icon: "mdi:account-outline" },
    { to: "/manager/trips", label: "Trips", icon: "mdi:swap-horizontal-variant" },
    { to: "/manager/tracking", label: "Live Tracking", icon: "mdi:crosshairs-gps" },
    { to: "/manager/routes", label: "Route Optimization", icon: "mdi:directions" },
    { to: "/manager/fuel", label: "Fuel Management", icon: "mdi:gas-station-outline" },
    { to: "/manager/maintenance", label: "Maintenance", icon: "mdi:wrench-outline" },
    { to: "/manager/ewaybills", label: "E-Way Bills", icon: "mdi:file-document-outline" },
    { to: "/manager/fastag", label: "FASTag & Toll", icon: "mdi:ticket-outline" },
    { to: "/manager/documents", label: "Documents", icon: "mdi:folder-outline" },
    { to: "/manager/analytics", label: "Analytics", icon: "mdi:chart-box-outline" },
    { to: "/manager/reports", label: "Reports", icon: "mdi:file-chart-outline" },
    { to: "/manager/notifications", label: "Notifications", icon: "mdi:bell-outline" },
    { to: "/manager/settings", label: "Settings", icon: "mdi:cog-outline" },
  ],
};

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const links = NAV_ITEMS[role] ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img 
              src="/fleet-logo.png" 
              alt="Fleet Management Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-white">FleetManagement</h1>
              <p className="text-gray-400 text-xs">{role === "admin" ? "Admin" : "Fleet Manager"}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 mb-0.5 text-sm transition-colors ${
                  isActive 
                    ? "bg-zinc-800 text-orange-500 font-medium border-l-4 border-orange-600 rounded-r-sm" 
                    : "text-gray-300 hover:text-white hover:bg-zinc-900"
                }`
              }
            >
              <Icon icon={link.icon} width="22" height="22" />
              <span>{link.label}</span>
            </NavLink>
          ))}
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
              <Icon icon="mdi:bell-outline" width="22" height="22" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Icon icon="mdi:account" width="22" height="22" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.name || "Alex Thompson"}</p>
                <p className="text-xs text-gray-500">{role === "admin" ? "Admin" : "Fleet Manager"}</p>
              </div>
              <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-md">
                <Icon icon="mdi:chevron-down" width="18" height="18" />
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
