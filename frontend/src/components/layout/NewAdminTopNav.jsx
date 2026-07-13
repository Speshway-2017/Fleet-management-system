import { Bell, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import NotificationOverlay from "./NotificationOverlay";

export default function NewAdminTopNav({ title = "Dashboard" }) {
  const location = useLocation();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const { notifications, isSidebarOpen, setIsSidebarOpen, adminProfile } = useAdmin();
  const isNotificationsActive = location.pathname.startsWith("/admin/notifications");
  const unreadCount = notifications ? notifications.filter(n => n.unread).length : 0;
  const initials = adminProfile.name ? adminProfile.name.split(' ').map(part => part[0]).join('').toUpperCase() : 'A';

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 relative">
        <button 
          onClick={() => setIsOverlayOpen(!isOverlayOpen)}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer ${
            isNotificationsActive || isOverlayOpen
              ? "bg-slate-100 text-[#0f172a]" 
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bell className="w-[20px] h-[20px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b45309] rounded-full border border-white"></span>
          )}
        </button>

        <NotificationOverlay 
          isOpen={isOverlayOpen} 
          onClose={() => setIsOverlayOpen(false)} 
        />
        
        <Link to="/admin/settings/profile" className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {adminProfile.avatarUrl ? (
              <img src={adminProfile.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-800">{adminProfile.name || 'Admin'}</span>
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Online</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
