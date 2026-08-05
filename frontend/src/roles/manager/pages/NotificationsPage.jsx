import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import DispatchWarningModal from "@/components/common/DispatchWarningModal";
import ContactDriverModal from "@/components/common/ContactDriverModal";
import { managerApi } from "../api/managerApi";
import { getSocket, disconnectSocket } from "@/api/socket";
import { useAuth } from "@/context/AuthContext";

const mapTypeToTab = (type) => {
  if (type === "alert")  return "Critical";
  if (type === "info")   return "Maintenance";
  if (type === "system") return "System";
  return "All";
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getNotifications();
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // Socket.IO
  useEffect(() => {
    if (isAuthenticated && user?.role === "manager") {
      const socket = getSocket();

      // Join rooms
      socket.emit("joinManagerRoom", user._id || user.id);
      if (user?.organizationId) {
        socket.emit("joinOrganizationRoom", user.organizationId);
      }

      // Listen for events
      socket.on("notification:new", (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      socket.on("notification:read", (notification) => {
        setNotifications(prev => prev.map(n => 
          (n._id === (notification._id || notification.id) || n.id === (notification._id || notification.id)) 
            ? { ...n, isRead: true } 
            : n
        ));
      });

      socket.on("notification:update", (data) => {
        if (data.allRead) {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
      });

      socket.on("notification:delete", (data) => {
        setNotifications(prev => prev.filter(n => 
          n._id !== data.id && n.id !== data.id
        ));
      });

      return () => {
        socket.off("notification:new");
        socket.off("notification:read");
        socket.off("notification:update");
        socket.off("notification:delete");
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "Critical") return notif.type === "alert" || notif.type === "warning";
    if (activeTab === "Maintenance") return notif.type === "info";
    if (activeTab === "System") return notif.type === "success" || notif.type === "system";
    if (activeTab === "Alert Overview" && priorityFilter) {
      return notif.priority === priorityFilter;
    }
    return true;
  });

  const [showDispatchWarningModal, setShowDispatchWarningModal] = useState(false);
  const [showContactDriverModal, setShowContactDriverModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const getIconColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      case 'success': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return 'mdi:alert-octagon';
      case 'warning': return 'mdi:alert-circle';
      case 'info': return 'mdi:information';
      case 'success': return 'mdi:check-circle';
      case 'system': return 'mdi:cloud-sync';
      default: return 'mdi:bell';
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await managerApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all read");
    }
  };

  const handleActionClick = async (action, notification, e) => {
    e.stopPropagation();
    
    // Mark as read in DB
    try {
      await managerApi.markNotificationRead(notification._id || notification.id);
      setNotifications(prev =>
        prev.map(n => (n._id === notification._id || n.id === notification.id) ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }

    const actType = action.actionType;
    if (actType === "Dispatch Warning") {
      setSelectedNotification(notification);
      setShowDispatchWarningModal(true);
    } else if (actType === "Call Driver") {
      setSelectedNotification(notification);
      setShowContactDriverModal(true);
    } else if (actType === "Track Live") {
      navigate("/manager/map");
    } else if (actType === "View Analytics") {
      navigate("/manager/analytics");
    } else if (actType === "Schedule Now") {
      navigate("/manager/maintenance/tickets");
    } else if (actType === "Download PDF") {
      toast.success(`Downloading PDF for ${notification.title}...`);
    } else {
      toast.success(`${actType} action triggered!`);
    }
  };

  const resolveTargetUrl = (notif) => {
    if (!notif) return "/manager/dashboard";
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

    // 1. Subscription Notifications (MUST BE FIRST)
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
    const notifId = notif._id || notif.id;
    try {
      await managerApi.markNotificationRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n._id === notifId || n.id === notifId) ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }

    const targetUrl = resolveTargetUrl(notif);
    navigate(targetUrl);
  };

  const countByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority).length;
  };

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Notifications Center</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer border-none"
            >
              <Icon icon="mdi:check-all" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Mark all as read</span>
            </button>
          )}
          <button 
            onClick={() => navigate("/manager/profile")}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Icon icon="mdi:cog-outline" className="w-5 h-5" />
            Profile Settings
          </button>
        </div>
      </div>

      <div className="w-full space-y-4">
        {/* Tabs & Notifications List */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full overflow-visible flex-wrap">
            {['All', 'Critical', 'Maintenance', 'System'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPriorityFilter(null);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
              >
                {tab}
              </button>
            ))}

            {/* Alert Overview Dropdown */}
            <div className="relative overflow-visible">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none flex items-center gap-1.5 ${activeTab === "Alert Overview"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
              >
                <span>Alert Overview {priorityFilter ? `(${priorityFilter.toUpperCase()})` : ''}</span>
                <Icon icon="mdi:chevron-down" className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 animate-fade-in font-poppins">
                  {[
                    { label: "High Priority", value: "high", color: "bg-red-500" },
                    { label: "Medium Priority", value: "medium", color: "bg-orange-500" },
                    { label: "Low Priority", value: "low", color: "bg-blue-500" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setActiveTab("Alert Overview");
                        setPriorityFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {countByPriority(option.value)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading state / Empty state */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 font-poppins text-xs font-semibold">
              Loading alerts...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium font-poppins select-none shadow-sm">
              <div className="w-14 h-14 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon icon="mdi:bell-off-outline" className="w-7 h-7" />
              </div>
              <h4 className="text-gray-700 font-bold text-sm">No Alerts Found</h4>
              <p className="text-xs text-gray-450 mt-1 max-w-xs mx-auto leading-relaxed">
                You have no active notifications or priority updates matching this category.
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-230px)] overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif._id || notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`bg-white rounded-xl border border-[#E7EAF0] px-4 py-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative group ${
                    !notif.isRead ? 'border-l-4 border-l-[#B45A0A] bg-amber-50/20' : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Compact Icon Badge */}
                    <div className={`w-9 h-9 rounded-xl ${getIconColor(notif.type)} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                      <Icon icon={getIcon(notif.type)} className="w-4.5 h-4.5" />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-poppins font-bold text-xs text-[#1E293B] truncate group-hover:text-[#B45A0A] transition-colors flex items-center gap-1.5">
                          <span>{notif.title}</span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#B45A0A] shrink-0" title="Unread" />
                          )}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-400 font-poppins shrink-0">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>

                      <p className="text-xs text-[#64748B] font-nunito font-normal line-clamp-2 mt-1 leading-relaxed">
                        {notif.message || notif.description}
                      </p>

                      {/* Action buttons if present */}
                      {notif.actions && notif.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {notif.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={(e) => handleActionClick(action, notif, e)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-poppins transition-colors cursor-pointer border ${
                                action.bg === 'bg-white'
                                  ? `${action.bg} ${action.text} border-gray-200 hover:bg-gray-50`
                                  : `${action.bg} text-white border-transparent ${action.hover}`
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DispatchWarningModal
        isOpen={showDispatchWarningModal}
        onClose={() => setShowDispatchWarningModal(false)}
        notification={selectedNotification?.meta}
      />
      <ContactDriverModal
        isOpen={showContactDriverModal}
        onClose={() => setShowContactDriverModal(false)}
        notification={selectedNotification?.meta}
      />
    </div>
  );
}
