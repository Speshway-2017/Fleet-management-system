import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Activity, Check, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";

export default function NotificationList() {
  const [activeTab, setActiveTab] = useState("All");
  const { notifications, markAllAsRead, markAsRead } = useAdmin();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case "bell":
        return { icon: Bell, bg: "bg-orange-50", text: "text-[#A14000]" };
      case "success":
        return { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-500" };
      case "warning":
        return { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-500" };
      case "danger":
        return { icon: AlertCircle, bg: "bg-red-50", text: "text-red-500" };
      case "system":
        return { icon: Activity, bg: "bg-blue-50", text: "text-blue-500" };
      case "CONTACT_REQUEST":
        return { icon: Mail, bg: "bg-blue-50", text: "text-[#b45309]" };
      default:
        return { icon: Bell, bg: "bg-slate-50", text: "text-slate-500" };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return n.unread;
    if (activeTab === "Read") return !n.unread;
    return true;
  });

  const grouped = filteredNotifications.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Notifications" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 truncate">Total Notifications</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800">{notifications.length}</h4>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 truncate">Unread</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#b45309]">{notifications.filter(n => n.unread).length}</h4>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-[#b45309]">
                <div className="relative">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#b45309] rounded-full border border-orange-50 sm:border-2"></span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 truncate">Alerts</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800">
                  {notifications.filter(n => n.type === 'alert' || n.type === 'danger' || n.type === 'warning').length}
                </h4>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex items-center justify-between shadow-sm">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 truncate">System Events</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-800">{notifications.filter(n => n.type === 'system').length}</h4>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* List Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header / Tabs */}
            <div className="px-4 sm:px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="inline-flex overflow-x-auto no-scrollbar max-w-full items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
                <button 
                  onClick={() => setActiveTab("All")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeTab === "All" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  All (10)
                </button>
                <button 
                  onClick={() => setActiveTab("Unread")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeTab === "Unread" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Unread (4)
                </button>
                <button 
                  onClick={() => setActiveTab("Read")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeTab === "Read" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Read (6)
                </button>
              </div>

              <button 
                onClick={markAllAsRead}
                className="flex items-center justify-center w-auto self-end sm:self-auto gap-2 px-4 py-2 text-[13px] font-bold text-[#b45309] hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            </div>

            {/* Notification Items */}
            <div className="flex flex-col divide-y divide-slate-100">
              {Object.keys(grouped).length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm font-medium">
                  No notifications found.
                </div>
              ) : (
                Object.keys(grouped).map(groupName => (
                  <div key={groupName}>
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{groupName}</h5>
                    </div>
                    
                    <div className="flex flex-col divide-y divide-slate-100">
                      {grouped[groupName].map(notification => {
                        const IconData = getIcon(notification.type);
                        const IconComp = IconData.icon;
                        
                        return (
                          <div 
                            key={notification.id}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.type === "CONTACT_REQUEST" && notification.referenceId) {
                                navigate(`/admin/contact-requests?id=${notification.referenceId}`);
                              } else if (
                                notification.type === "subscription_request" || 
                                notification.type === "SUBSCRIPTION_REQUEST" ||
                                (notification.title && notification.title.toLowerCase().includes("subscription"))
                              ) {
                                navigate(`/admin/subscription-requests`);
                              } else {
                                navigate(`/admin/notifications/${notification.id}`);
                              }
                            }}
                            className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-white' : 'bg-white opacity-80'}`}
                          >
                            <div className="pt-2 flex items-center justify-center w-2 shrink-0 hidden sm:flex">
                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full bg-[#b45309]"></div>
                              )}
                            </div>
                            
                            <div className="relative">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${IconData.bg} ${IconData.text}`}>
                                <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              {notification.unread && (
                                <div className="sm:hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#b45309] border-2 border-white"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 mb-1">
                                <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-tight pr-2 sm:pr-0">{notification.title}</h4>
                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0">{notification.time}</span>
                              </div>
                              <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-none mt-1 sm:mt-0">{notification.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
