import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

export default function NewAdminSidebar({ activeItem = "dashboard" }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { id: "organizations", label: "Organizations", to: "/admin/organizations", icon: Building2 },
    { id: "fleet-managers", label: "Fleet Managers", to: "/admin/fleet-managers", icon: Users },
    { id: "analytics", label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="w-[260px] bg-[#1a2332] text-slate-300 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo Area */}
      <div className="p-6 pb-4 border-b border-[#2a3241]/50">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white p-1" />
          <span className="font-bold text-white text-lg tracking-tight">Fleet Management</span>
        </div>
        <div className="text-[11px] text-slate-400 pl-12 font-medium">Super Admin</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 space-y-1">
        <p className="px-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
        
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.id}
              to={item.to} 
              className={`flex items-center gap-3 px-8 py-3.5 transition-colors border-l-[3px] ${
                isActive 
                  ? "bg-[#252f3f] text-[#f97316] font-semibold border-[#f97316]" 
                  : "text-slate-400 hover:bg-[#252f3f] hover:text-white border-transparent"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 mb-4">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-[#252f3f] hover:text-white transition-colors">
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </Link>
      </div>
    </div>
  );
}
