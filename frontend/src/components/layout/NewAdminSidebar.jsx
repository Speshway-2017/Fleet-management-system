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
  MessageSquare,
  CreditCard,
  ClipboardList
} from "lucide-react";

export default function NewAdminSidebar({ activeItem = "dashboard" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, platformSettings } = useAdmin();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { id: "organizations", label: "Organizations", to: "/admin/organizations", icon: Building2 },
    { id: "subscription-requests", label: "Subscriptions", to: "/admin/subscription-requests", icon: CreditCard },
    { id: "contact-requests", label: "Contact Requests", to: "/admin/contact-requests", icon: MessageSquare },
    { id: "analytics", label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  const bottomNavItems = [
    { id: "dashboard", label: "Home", to: "/admin/dashboard", icon: LayoutDashboard },
    { id: "organizations", label: "Orgs", to: "/admin/organizations", icon: Building2 },
    { id: "subscription-requests", label: "Requests", to: "/admin/subscription-requests", icon: CreditCard },
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

      {/* Sidebar - Unified Dark Navy */}
      <div className={`w-[260px] bg-[#0D1B2A] text-slate-300 border-r border-slate-800/80 flex flex-col h-screen fixed lg:sticky top-0 z-50 flex-shrink-0 overflow-hidden transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
      {/* Logo Area */}
      <div className="p-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-900/60 border border-slate-800 shrink-0">
            <img src={platformSettings?.logoUrl || "/logo.png"} className="w-8 h-8 object-contain rounded-md shrink-0" alt="Logo" />
          </div>
          <div className="border-l border-slate-700/60 pl-3 py-0.5">
            <h1 className="font-poppins font-black text-white text-base tracking-wide leading-none whitespace-nowrap">{platformSettings?.platformName || "Fleet Management"}</h1>
            <span className="text-[10px] text-[#A14000] font-extrabold font-poppins uppercase tracking-wider mt-1.5 block">Super Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
        
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.id}
              to={item.to} 
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#A14000] text-white font-bold shadow-md shadow-[#A14000]/25" 
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 mb-4">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[#0D1B2A]/95 px-2 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.95rem))] pt-3 shadow-[0_-10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
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
                    ? "bg-[#A14000] text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
