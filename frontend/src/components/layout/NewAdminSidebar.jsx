import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MoreHorizontal,
  MessageSquare
} from "lucide-react";

export default function NewAdminSidebar({ activeItem = "dashboard" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useAdmin();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { id: "organizations", label: "Organizations", to: "/admin/organizations", icon: Building2 },
    { id: "fleet-managers", label: "Fleet Managers", to: "/admin/fleet-managers", icon: Users },
    { id: "contact-requests", label: "Contact Requests", to: "/admin/contact-requests", icon: MessageSquare },
    { id: "analytics", label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  const bottomNavItems = [
    { id: "dashboard", label: "Home", to: "/admin/dashboard", icon: LayoutDashboard },
    { id: "organizations", label: "Orgs", to: "/admin/organizations", icon: Building2 },
    { id: "fleet-managers", label: "Managers", to: "/admin/fleet-managers", icon: Users },
    { id: "analytics", label: "Insights", to: "/admin/analytics", icon: BarChart3 },
    { id: "settings", label: "More", to: "/admin/settings", icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-[260px] bg-[#1a2332] text-slate-300 flex flex-col h-screen fixed lg:sticky top-0 z-50 flex-shrink-0 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
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
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#b45309]/30 bg-transparent px-4 py-3 font-semibold text-[#b45309] transition-all hover:bg-[#b45309]/10"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.95rem))] pt-3 shadow-[0_-10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#FFF3E8] text-[#b45309]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
