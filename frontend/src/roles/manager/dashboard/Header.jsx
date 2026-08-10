import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, User, LogOut, ChevronDown, CheckCheck, ExternalLink } from "lucide-react";
import UserProfileCard from "@/components/common/UserProfileCard";
import toast from "react-hot-toast";
import { getSocket } from "@/api/socket";
import { managerApi } from "../api/managerApi";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const host = apiBase.replace(/\/api\/?$/, "");
  return `${host}${url}`;
};

export default function Header({ onMenuToggle, showMenuButton = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await managerApi.getNotifications();
      const list = res.data?.data || res.data || [];
      setNotifications(list);
      const unread = list.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to load header notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket.IO real-time notification listener
    const socket = getSocket();
    if (socket) {
      if (user?._id) {
        socket.emit("joinManagerRoom", user._id);
      }

      const handleNewNotification = (newNotif) => {
        toast.custom(
          (t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                handleNotificationClick(newNotif);
              }}
              className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 cursor-pointer hover:bg-orange-50/50 transition-all font-poppins border-l-4 border-[#B45A0A]`}
            >
              <div className="flex-1">
                <p className="text-xs font-bold text-[#B45A0A] uppercase tracking-wider">{newNotif.title || "Driver Update"}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{newNotif.message || newNotif.description}</p>
              </div>
            </div>
          ),
          { duration: 5000 }
        );

        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      socket.on("notification:new", handleNewNotification);

      return () => {
        socket.off("notification:new", handleNewNotification);
      };
    }
  }, [user?._id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    try {
      await managerApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error("Failed to mark notifications as read.");
    }
  };

  const resolveTargetUrl = (notif) => {
    if (!notif) return "/manager/dashboard";
    if (notif.actionUrl) return notif.actionUrl;
    if (notif.metadata?.actionUrl) return notif.metadata.actionUrl;
    if (notif.metadata?.targetUrl) return notif.metadata.targetUrl;

    const title = (notif.title || "").toLowerCase();
    const message = (notif.message || notif.description || "").toLowerCase();
    const type = (notif.type || "").toUpperCase();

    const tripId = notif.metadata?.tripId || notif.referenceId || notif.relatedId;
    const driverId = notif.metadata?.driverId;
    let extractedTicketId = notif.metadata?.ticketId || notif.metadata?.complaintId;
    if (!extractedTicketId) {
      const fullText = (notif.title || "") + " " + (notif.message || notif.description || "");
      const match = fullText.match(/TKT-VEH-[\w-]+/i);
      if (match) extractedTicketId = match[0];
    }

    // 1. Subscription Notifications
    if (
      type.includes("SUB") ||
      title.includes("subscription") ||
      title.includes("plan") ||
      title.includes("billing") ||
      title.includes("invoice") ||
      message.includes("subscription") ||
      message.includes("plan") ||
      message.includes("renew")
    ) {
      return `/manager/subscription`;
    }

    // 2. Ticket & Maintenance Notifications
    if (
      extractedTicketId ||
      title.includes("ticket") ||
      title.includes("mechanic") ||
      title.includes("maintenance") ||
      title.includes("issue") ||
      title.includes("breakdown") ||
      message.includes("tkt-") ||
      message.includes("mechanic") ||
      message.includes("maintenance") ||
      message.includes("breakdown") ||
      type.includes("MAINTENANCE") ||
      type.includes("COMPLAINT")
    ) {
      return extractedTicketId
        ? `/manager/maintenance?ticketId=${encodeURIComponent(extractedTicketId)}`
        : `/manager/maintenance`;
    }

    // 3. Fuel Notifications
    if (
      type.includes("FUEL") ||
      title.includes("fuel") ||
      message.includes("fuel") ||
      message.includes("diesel") ||
      message.includes("petrol")
    ) {
      return `/manager/fuel-management`;
    }

    // 4. Trip, Dispatch, POD & Weighbridge Notifications
    if (
      tripId ||
      type.includes("TRIP") ||
      type.includes("POD") ||
      type.includes("WEIGHBRIDGE") ||
      title.includes("trip") ||
      title.includes("dispatch") ||
      title.includes("delivery") ||
      title.includes("pod") ||
      title.includes("weighbridge") ||
      message.includes("trp-") ||
      message.includes("dispatch") ||
      message.includes("delivery")
    ) {
      return tripId ? `/manager/trip-details/${tripId}` : `/manager/trips`;
    }

    // 5. Driver Notifications
    if (
      driverId ||
      type.includes("DRIVER") ||
      title.includes("driver") ||
      message.includes("driver")
    ) {
      return driverId ? `/manager/driver-profile/${driverId}` : `/manager/drivers`;
    }

    // 6. Vehicle & Live Tracking Notifications
    if (
      type.includes("VEHICLE") ||
      title.includes("vehicle") ||
      title.includes("truck") ||
      message.includes("vehicle") ||
      message.includes("tracking")
    ) {
      return `/manager/vehicles`;
    }

    // 7. Document Notifications
    if (
      type.includes("DOCUMENT") ||
      title.includes("document") ||
      title.includes("insurance") ||
      message.includes("document")
    ) {
      return `/manager/settings`;
    }

    return `/manager/dashboard`;
  };

  const handleNotificationClick = async (notif) => {
    setNotifDropdownOpen(false);
    try {
      if (!notif.isRead) {
        await managerApi.markNotificationRead(notif._id || notif.id);
        setNotifications(prev => prev.map(n => (n._id === notif._id || n.id === notif.id) ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
    const url = resolveTargetUrl(notif);
    navigate(url);
  };

  return (
    <header className={`sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between transition-shadow duration-300 ${isScrolled ? "shadow-md" : "shadow-none"
      }`}>
      {/* Mobile Menu Toggler and Title */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl focus:outline-none transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h2 className="font-poppins font-semibold text-lg text-[#1B2430]">
          Manager Workspace
        </h2>
      </div>

      {/* Notifications & Profile Area */}
      <div className="flex items-center gap-6">

        {/* Bell Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setUserMenuOpen(false);
              navigate("/manager/notifications");
            }}
            className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none transition-colors duration-150 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5.5 h-5.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#B45A0A] text-white text-[10px] font-bold rounded-full border-2 border-white font-poppins min-w-[18px] text-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)} />
              <div className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] py-3 z-40 font-poppins text-sm animate-in fade-in duration-150">
                <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-orange-100 text-[#B45A0A] text-[10px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#B45A0A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-orange-50/40 transition-colors cursor-pointer flex items-start gap-3 ${!notif.isRead ? "bg-amber-50/30 font-semibold" : "bg-white"
                          }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.isRead ? "bg-[#B45A0A]" : "bg-gray-300"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{notif.title}</p>
                          <p className="text-xs text-gray-600 font-normal line-clamp-2 mt-0.5">{notif.message || notif.description}</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2.5 px-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      navigate("/manager/notifications");
                    }}
                    className="text-xs font-bold text-[#B45A0A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Notifications</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reusable User Profile Card */}
        <UserProfileCard
          user={user}
          roleLabel="Fleet Manager"
          profilePath="/manager/profile"
          settingsPath="/manager/settings"
          supportPath="/manager/help-support"
          onLogout={handleLogout}
        />

      </div>
    </header>
  );
}
