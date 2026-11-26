import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import NotificationCard from "../components/NotificationCard";
import { useDriverSocket } from "../hooks/useDriverSocket";
import { toast } from "react-hot-toast";
import { Bell, CheckCheck, Inbox, RefreshCw } from "lucide-react";

export default function DriverNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useDriverSocket({
    onNotification: (newNotif) => {
      toast(newNotif.title || "New Notification", { icon: "🔔" });
      fetchNotifications();
    }
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getNotifications();
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await driverApi.markNotificationRead(id);
      if (res?.success) {
        setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
        window.dispatchEvent(new Event("notificationsUpdated"));
      }
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await driverApi.markAllNotificationsRead();
      if (res?.success) {
        toast.success("All notifications marked as read");
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        window.dispatchEvent(new Event("notificationsUpdated"));
      }
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#A14000]" />
              Notifications Inbox
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#A14000] text-white font-poppins">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time dispatches, trip updates, and manager alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#A14000] border border-slate-200 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#A14000] animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <NotificationCard
              key={notif._id || notif.id}
              notification={notif}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold font-poppins text-base">Your Inbox is Empty</h3>
          <p className="text-slate-500 text-xs mt-1">No notifications or alerts received yet.</p>
        </div>
      )}
    </div>
  );
}
