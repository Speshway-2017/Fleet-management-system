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
      navigate("/manager/maintenance/schedule", {
        state: {
          vehicleNumber: notification.vehicle,
          maintenanceType: "Brake Check",
          dueMileage: "150 miles"
        }
      });
    } else if (actType === "Download PDF") {
      toast.success(`Downloading PDF for ${notification.title}...`);
    } else {
      toast.success(`${actType} action triggered!`);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await managerApi.markNotificationRead(notif._id || notif.id);
      setNotifications(prev =>
        prev.map(n => (n._id === notif._id || n.id === notif.id) ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }

    if (notif.type === "COMMUNICATION" || notif.relatedModel === "Trip" || notif.title?.toLowerCase().includes("message")) {
      const tripId = notif.relatedId || notif.tripId;
      if (tripId) {
        navigate(`/manager/trip-details/${tripId}?tab=communication`);
        return;
      }
    }

    setActiveTab(mapTypeToTab(notif.type));
    navigate(`/manager/notifications/${notif._id || notif.id}`);
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              Loading alerts...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium font-poppins select-none shadow-sm">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:bell-off-outline" className="w-8 h-8" />
              </div>
              <h4 className="text-gray-700 font-bold">No Alerts Found</h4>
              <p className="text-xs text-gray-450 mt-1 max-w-xs mx-auto leading-relaxed">
                You have no active notifications or priority updates matching this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif._id || notif.id} 
                onClick={() => handleNotificationClick(notif)}
                className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative ${!notif.isRead ? 'border-l-4 border-l-[#B45A0A]' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full ${getIconColor(notif.type)} flex items-center justify-center shrink-0`}>
                    <Icon icon={getIcon(notif.type)} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B45A0A]" />
                        )}
                      </h4>
                      <span className="text-xs text-gray-400 font-medium">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{notif.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(notif.actions || []).map((action, i) => (
                        <button
                          key={i}
                          onClick={(e) => handleActionClick(action, notif, e)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${action.bg === 'bg-white'
                              ? `${action.bg} ${action.text} border-gray-300 hover:bg-gray-50`
                              : `${action.bg} text-white border-transparent ${action.hover}`
                            }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
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
