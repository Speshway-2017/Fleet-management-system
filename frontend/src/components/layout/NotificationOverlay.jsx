import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCircle2, AlertTriangle, AlertCircle, Activity, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axiosClient from "@/api/axiosClient";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export default function NotificationOverlay({ isOpen, onClose }) {
  const { role } = useAuth() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  const getEndpointPrefix = useCallback(() => {
    const r = (role || "").toLowerCase();
    if (r === "admin" || r === "super_admin") return "/admin";
    if (r === "driver") return "/driver";
    return "/manager";
  }, [role]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const prefix = getEndpointPrefix();
      const res = await axiosClient.get(`${prefix}/notifications`);
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications in overlay:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [getEndpointPrefix]);

  // Fetch when opened or periodically every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications, isOpen]);

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

  const isItemUnread = (n) => !n.isRead && n.unread !== false;

  const unreadCount = notifications.filter(isItemUnread).length;

  const getIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("success") || t.includes("accept") || t.includes("completed") || t.includes("pod")) {
      return { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-[#00C853]" };
    }
    if (t.includes("warn") || t.includes("delay") || t.includes("reject") || t.includes("ticket")) {
      return { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-[#F59E0B]" };
    }
    if (t.includes("danger") || t.includes("alert") || t.includes("critical") || t.includes("expiry")) {
      return { icon: AlertCircle, bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-[#EF4444]" };
    }
    if (t.includes("system") || t.includes("status")) {
      return { icon: Activity, bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-[#0085FF]" };
    }
    return { icon: Bell, bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-[#A14000]" };
  };

  const handleMarkAllRead = async () => {
    try {
      const prefix = getEndpointPrefix();
      await axiosClient.patch(`${prefix}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, unread: false })));
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err?.message);
    }
  };

  const getNotificationTargetUrl = (notification) => {
    if (notification.metadata?.targetUrl) {
      return notification.metadata.targetUrl;
    }
    const r = (role || "").toLowerCase();
    const isManager = r === "manager" || r === "fleet_manager" || !r;

    const title = (notification.title || "").toLowerCase();
    const message = (notification.message || notification.description || "").toLowerCase();
    const type = (notification.type || "").toUpperCase();
    const meta = notification.metadata || {};

    const tripId = meta.tripId || notification.tripId;
    const vehicleId = meta.vehicleId || notification.vehicleId;
    const driverId = meta.driverId || notification.driverId;
    const ticketId = meta.ticketId || notification.ticketId;

    if (isManager) {
      // 1. Subscription & Billing
      if (
        type.includes("SUB") || title.includes("subscription") || title.includes("plan") || title.includes("billing") || title.includes("invoice") ||
        message.includes("subscription") || message.includes("plan") || message.includes("renew")
      ) {
        return `/manager/subscription`;
      }

      // 2. Ticket & Maintenance
      if (
        ticketId || title.includes("ticket") || title.includes("mechanic") || title.includes("maintenance") || title.includes("issue") || title.includes("breakdown") ||
        message.includes("tkt-") || message.includes("mechanic") || message.includes("maintenance") || message.includes("breakdown") ||
        type.includes("MAINTENANCE") || type.includes("COMPLAINT")
      ) {
        return ticketId ? `/manager/maintenance?ticketId=${encodeURIComponent(ticketId)}` : `/manager/maintenance`;
      }

      // 3. Fuel
      if (
        type.includes("FUEL") || title.includes("fuel") || message.includes("fuel") || message.includes("diesel") || message.includes("petrol")
      ) {
        return `/manager/fuel`;
      }

      // 4. Trip, Dispatch, POD & Weighbridge
      if (
        tripId || type.includes("TRIP") || type.includes("POD") || type.includes("WEIGHBRIDGE") ||
        title.includes("trip") || title.includes("dispatch") || title.includes("delivery") || title.includes("pod") || title.includes("weighbridge") ||
        message.includes("trp-") || message.includes("dispatch") || message.includes("delivery")
      ) {
        return tripId ? `/manager/trip-details/${tripId}` : `/manager/trips`;
      }

      // 5. Driver
      if (
        driverId || type.includes("DRIVER") || title.includes("driver") || message.includes("driver")
      ) {
        return driverId ? `/manager/driver-profile/${driverId}` : `/manager/drivers`;
      }

      // 6. Vehicle & Tracking
      if (
        vehicleId || type.includes("VEHICLE") || title.includes("vehicle") || title.includes("truck") || message.includes("vehicle") || message.includes("tracking")
      ) {
        return vehicleId ? `/manager/vehicle-details/${vehicleId}` : `/manager/vehicles`;
      }

      // 7. Settings & Documents
      if (
        type.includes("DOCUMENT") || title.includes("document") || title.includes("insurance") || message.includes("document") || title.includes("setting")
      ) {
        return `/manager/settings`;
      }

      return `/manager`;
    }

    if (r === "admin" || r === "super_admin") return "/admin/notifications";
    if (r === "driver") return "/driver/notifications";
    return "/manager/notifications";
  };

  const handleNotificationClick = async (notification) => {
    const notifId = notification._id || notification.id;
    try {
      const prefix = getEndpointPrefix();
      if (notifId) {
        await axiosClient.patch(`${prefix}/notifications/${notifId}/read`);
      }
    } catch (_) {}

    setNotifications(prev => prev.map(n => (n._id === notifId || n.id === notifId) ? { ...n, isRead: true, unread: false } : n));
    onClose();

    const targetUrl = getNotificationTargetUrl(notification);
    navigate(targetUrl);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "Unread") return isItemUnread(n);
    if (activeTab === "Alerts") return n.type === "warning" || n.type === "danger" || n.type === "alert" || n.priority === "high";
    if (activeTab === "System") return n.type === "system" || n.type === "info";
    return true;
  }).slice(0, 7);

  return (
    <div 
      ref={overlayRef} 
      className="absolute top-14 right-0 sm:right-2 w-[340px] sm:w-[380px] max-w-[90vw] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transform origin-top-right transition-all font-poppins select-none"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-[#A14000] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#A14000] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-[#1E293B] overflow-x-auto no-scrollbar">
        {["All", "Unread", "Alerts", "System"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab 
                ? "bg-[#A14000] text-white" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 max-h-[320px] overflow-y-auto custom-scrollbar flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const isUnread = isItemUnread(notification);
            const IconData = getIcon(notification.type);
            const IconComp = IconData.icon;
            const timeFormatted = notification.time || formatRelativeTime(notification.createdAt);

            return (
              <div 
                key={notification.id || notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative ${isUnread ? 'bg-orange-50/20 dark:bg-[#0F172A]' : 'bg-slate-50/40 dark:bg-slate-900/30 opacity-80'}`}
              >
                {isUnread && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#A14000]" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1.5 ${IconData.bg} ${IconData.text}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{notification.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">{timeFormatted}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">{notification.description || notification.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer View All Button */}
      <div className="p-2.5 border-t border-slate-100 dark:border-[#1E293B] bg-slate-50/50 dark:bg-slate-900/60">
        <button 
          onClick={() => {
            onClose();
            const r = (role || "").toLowerCase();
            const basePath = r === "admin" || r === "super_admin" ? "/admin/notifications" : (r === "driver" ? "/driver/notifications" : "/manager/notifications");
            navigate(basePath);
          }}
          className="w-full py-2 bg-[#A14000] hover:bg-[#853400] text-white font-bold text-xs rounded-xl transition-all shadow-2xs text-center cursor-pointer font-poppins"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}
