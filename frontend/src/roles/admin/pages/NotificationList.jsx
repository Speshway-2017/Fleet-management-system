import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Activity, Check, CheckCircle2, AlertCircle, Trash2, Loader2 } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";

export default function NotificationList() {
  const [activeTab, setActiveTab] = useState("All");
  const { notifications, notificationsLoading, notificationsError, markAllAsRead, deleteNotification } = useAdmin();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case "bell":
        return { icon: Bell, bg: "bg-orange-50", text: "text-orange-500" };
      case "success":
        return { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-500" };
      case "warning":
        return { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-500" };
      case "danger":
        return { icon: AlertCircle, bg: "bg-red-50", text: "text-red-500" };
      case "system":
        return { icon: Activity, bg: "bg-blue-50", text: "text-blue-500" };
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Total Notifications</p>
                <h4 className="text-2xl font-black text-slate-800">{notifications.length}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Bell className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Unread</p>
                <h4 className="text-2xl font-black text-[#b45309]">{notifications.filter(n => n.unread).length}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#b45309]">
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#b45309] rounded-full border-2 border-orange-50"></span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Alerts</p>
                <h4 className="text-2xl font-black text-slate-800">{notifications.filter(n => n.type === 'danger' || n.type === 'warning').length}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">System Events</p>
                <h4 className="text-2xl font-black text-slate-800">{notifications.filter(n => n.type === 'system').length}</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Activity className="w-5 h-5" />
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
                  All ({notifications.length})
                </button>
                <button 
                  onClick={() => setActiveTab("Unread")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeTab === "Unread" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Unread ({notifications.filter(n => n.unread).length})
                </button>
                <button 
                  onClick={() => setActiveTab("Read")}
                  className={`px-5 py-2 text-[13px] font-bold rounded-full transition-colors ${activeTab === "Read" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Read ({notifications.filter(n => !n.unread).length})
                </button>
              </div>

              <button 
                onClick={markAllAsRead}
                className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 text-[13px] font-bold text-[#b45309] hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            </div>

            {/* Notification Items */}
            <div className="flex flex-col divide-y divide-slate-100">
              {notificationsLoading ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
                  <span className="text-sm font-medium">Loading notifications...</span>
                </div>
              ) : notificationsError ? (
                <div className="p-8 text-center text-red-500 flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{notificationsError}</span>
                </div>
              ) : Object.keys(grouped).length === 0 ? (
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
                            onClick={() => navigate(`/admin/notifications/${notification.id}`)}
                            className={`flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors cursor-pointer ${notification.unread ? 'bg-white' : 'bg-white opacity-80'}`}
                          >
                            <div className="pt-2 flex items-center justify-center w-2 shrink-0">
                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full bg-[#b45309]"></div>
                              )}
                            </div>
                            
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${IconData.bg} ${IconData.text}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-bold text-slate-800 mb-1 truncate">{notification.title}</h4>
                              <p className="text-[13px] text-slate-500 leading-relaxed">{notification.description}</p>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-end justify-between ml-4">
                              <span className="text-[11px] font-bold text-slate-400 mb-2">{notification.time}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
