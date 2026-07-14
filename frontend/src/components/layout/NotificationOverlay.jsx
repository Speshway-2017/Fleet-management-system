import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCircle2, AlertTriangle, AlertCircle, Activity, Mail } from "lucide-react";
import { useAdmin } from "@/roles/admin/context/AdminContext";

export default function NotificationOverlay({ isOpen, onClose }) {
  const { notifications, markAllAsRead, markAsRead } = useAdmin();
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (type) => {
    switch (type) {
      case "bell": return { icon: Bell, bg: "bg-orange-50", text: "text-orange-500" };
      case "success": return { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-500" };
      case "warning": return { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-500" };
      case "danger": return { icon: AlertCircle, bg: "bg-red-50", text: "text-red-500" };
      case "system": return { icon: Activity, bg: "bg-blue-50", text: "text-blue-500" };
      case "CONTACT_REQUEST": return { icon: Mail, bg: "bg-blue-50", text: "text-[#b45309]" };
      default: return { icon: Bell, bg: "bg-slate-50", text: "text-slate-500" };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return n.unread;
    if (activeTab === "Alerts") return n.type === "warning" || n.type === "danger";
    if (activeTab === "System") return n.type === "system";
    return true;
  });

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    onClose();
    if (notification.type === "CONTACT_REQUEST" && notification.referenceId) {
      navigate(`/admin/contact-requests?id=${notification.referenceId}`);
    } else {
      navigate(`/admin/notifications/${notification.id}`);
    }
  };

  return (
    <div 
      ref={overlayRef} 
      className="absolute top-14 -right-1 sm:right-0 w-[320px] sm:w-[380px] max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden z-50 transform origin-top-right transition-all"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-[#b45309] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllAsRead}
            className="text-[11px] font-bold text-[#b45309] hover:text-[#92400e] transition-colors flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {["All", "Unread", "Alerts", "System"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? "bg-slate-800 text-white" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 max-h-[200px] sm:max-h-[320px] overflow-y-auto custom-scrollbar flex flex-col divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Bell className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-slate-500 text-[13px] font-medium">No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const IconData = getIcon(notification.type);
            const IconComp = IconData.icon;
            return (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${notification.unread ? 'bg-white' : 'bg-slate-50/50 opacity-75'}`}
              >
                {notification.unread && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#b45309]"></div>
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ml-2 ${IconData.bg} ${IconData.text}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-[13px] font-bold text-slate-800 truncate">{notification.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{notification.time}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-snug line-clamp-2">{notification.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/50">
        <button 
          onClick={() => {
            onClose();
            navigate("/admin/notifications");
          }}
          className="w-full py-2.5 text-[12px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-center"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
