import { Bell, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import NotificationOverlay from "./NotificationOverlay";
import UserProfileCard from "@/components/common/UserProfileCard";
import toast from "react-hot-toast";

export default function NewAdminTopNav({ title = "Dashboard" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayUnreadCount, setOverlayUnreadCount] = useState(null);
  const { notifications, isSidebarOpen, setIsSidebarOpen, adminProfile } = useAdmin();
  const { isDark, toggleTheme } = useTheme();
  const isNotificationsActive = location.pathname.startsWith("/admin/notifications");
  const fallbackUnreadCount = notifications ? notifications.filter(n => !n.isRead && n.unread !== false).length : 0;
  const effectiveUnreadCount = overlayUnreadCount !== null ? overlayUnreadCount : fallbackUnreadCount;
  const initials = adminProfile?.name ? adminProfile.name.split(' ').map(part => part[0]).join('').toUpperCase() : 'A';

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const adminUserData = {
    ...user,
    fullName: adminProfile?.name || user?.fullName || user?.name || "Admin",
    avatarUrl: adminProfile?.avatarUrl || user?.profileImage || "",
    initials: initials,
    isOnline: true,
  };

  return (
    <header className="h-[72px] bg-white dark:bg-[#151C28] border-b border-slate-200 dark:border-[#242E42] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 select-none">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-poppins">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 relative">
        <button 
          onClick={() => setIsOverlayOpen(!isOverlayOpen)}
          className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer ${
            isNotificationsActive || isOverlayOpen
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Bell className="w-[20px] h-[20px]" />
          {effectiveUnreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A14000] rounded-full border border-white dark:border-[#151C28]"></span>
          )}
        </button>

        <NotificationOverlay 
          isOpen={isOverlayOpen} 
          onClose={() => setIsOverlayOpen(false)}
          onUnreadCountChange={setOverlayUnreadCount} 
        />
        
        <div className="pl-3 sm:pl-6 border-l border-slate-200 dark:border-slate-800">
          <UserProfileCard
            user={adminUserData}
            roleLabel="ONLINE"
            profilePath="/admin/settings/profile"
            settingsPath="/admin/settings"
            showSettings={true}
            showSupport={false}
            showStatusToggle={false}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
