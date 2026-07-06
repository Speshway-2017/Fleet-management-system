import { Bell } from "lucide-react";

export default function NewAdminTopNav({ title = "Dashboard" }) {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-[22px] h-[22px]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#1a2332] text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">Super Admin</span>
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
