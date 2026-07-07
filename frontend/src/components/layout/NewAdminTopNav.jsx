import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function NewAdminTopNav({ title = "Dashboard" }) {
  const location = useLocation();
  const isNotificationsActive = location.pathname.startsWith("/admin/notifications");

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-6">
        <Link 
          to="/admin/notifications" 
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer ${
            isNotificationsActive 
              ? "bg-slate-100 text-[#0f172a]" 
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bell className="w-[20px] h-[20px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
        </Link>
        
        <Link to="/admin/settings/profile" className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">Super Admin</span>
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Online</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
