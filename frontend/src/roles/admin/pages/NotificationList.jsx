import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Activity, Check, CheckCircle2, AlertCircle } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New Organization Registered",
    description: "Peak Freight Co. completed registration and is pending approval.",
    time: "2 min ago",
    type: "bell",
    unread: true,
    group: "TODAY"
  },
  {
    id: 2,
    title: "Fleet Manager Activated",
    description: "Emma Wilson from Global Express accepted the invite and is now active.",
    time: "15 min ago",
    type: "success",
    unread: true,
    group: "TODAY"
  },
  {
    id: 3,
    title: "Subscription Expiring Soon",
    description: "ABC Logistics Enterprise plan expires in 7 days. Renewal required.",
    time: "1 hour ago",
    type: "warning",
    unread: true,
    group: "TODAY"
  },
  {
    id: 4,
    title: "Failed Login Attempt",
    description: "5 consecutive failed logins detected from IP 203.0.113.0. Account temporarily locked.",
    time: "2 hours ago",
    type: "danger",
    unread: true,
    group: "TODAY"
  },
  {
    id: 5,
    title: "System Maintenance Scheduled",
    description: "Planned maintenance window: Sunday 02:00-04:00 AM. Expect brief downtime.",
    time: "5 hours ago",
    type: "system",
    unread: false,
    group: "TODAY"
  },
  {
    id: 6,
    title: "Organization Activated",
    description: "VRL Freight has been successfully activated after KYC verification.",
    time: "Yesterday",
    type: "success",
    unread: false,
    group: "YESTERDAY"
  },
  {
    id: 7,
    title: "Monthly Report Ready",
    description: "Your fleet performance summary for June is now available to download.",
    time: "Yesterday",
    type: "bell",
    unread: false,
    group: "YESTERDAY"
  }
];

export default function NotificationList() {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
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

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
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
      <NewAdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Notifications" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Total Notifications</p>
                <h4 className="text-2xl font-black text-slate-800">10</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Bell className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Unread</p>
                <h4 className="text-2xl font-black text-[#b45309]">4</h4>
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
                <h4 className="text-2xl font-black text-slate-800">4</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">System Events</p>
                <h4 className="text-2xl font-black text-slate-800">4</h4>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* List Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header / Tabs */}
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
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
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-[#b45309] hover:bg-orange-50 rounded-lg transition-colors"
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
                            
                            <div className="shrink-0 text-right">
                              <span className="text-[11px] font-bold text-slate-400">{notification.time}</span>
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
